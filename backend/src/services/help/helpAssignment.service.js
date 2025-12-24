const { PrismaClient } = require('@prisma/client');
const { CancelActor, CancelStage, CancelReasonCode } = require('@prisma/client');
const prisma = new PrismaClient();
const chatService = require('../chat.service');
const missionService = require('../missions.service');

exports.takeHelpRequest = async (helperId, helpRequestId) => {
    return prisma.$transaction(async (tx) => {

        const help = await tx.helpRequest.findUnique({
            where: { id: helpRequestId },
            select: { id: true, user_id: true, status: true },
        });

        if (!help || help.status !== 'OPEN') {
            throw { status: 404, message: 'Bantuan tidak tersedia' };
        }

        // Cek: tidak boleh mengambil bantuan sendiri
        if (help.user_id === helperId) {
            throw {
                status: 403,
                message: 'Tidak dapat mengambil bantuan sendiri',
            };
        }

        // Cek: tidak boleh mengambil bantuan jika ada bantuan lain yang aktif
        const activeAssignment = await tx.helpAssignment.findFirst({
            where: {
                helper_id: helperId,
                helpRequest: {
                    status: { in: ['TAKEN', 'IN_PROGRESS'] },
                },
            },
            select: { id: true },
        });

        if (activeAssignment) {
            throw {
                status: 409,
                message: 'Selesaikan bantuan aktif terlebih dahulu',
            };
        }

        const updated = await tx.helpRequest.updateMany({
            where: { id: helpRequestId, status: 'OPEN' },
            data: { status: 'TAKEN' },
        });

        if (updated.count === 0) {
            throw { status: 409, message: 'Bantuan sudah diambil' };
        }

        const assignment = await tx.helpAssignment.create({
            data: {
                helper_id: helperId,
                help_request_id: helpRequestId,
                taken_at: new Date(),
            },
        });

        await chatService.createChatRoom(assignment.id, tx);

        await missionService.updateMissionProgress(
            helperId,
            'HELP_TAKEN',
            1,
            tx
        );

        return assignment;
    });
};

exports.confirmHelper = async (helpRequestId, assignmentId, requesterId) => {
    return prisma.$transaction(async (tx) => {

        const helpRequest = await tx.helpRequest.findUnique({
            where: { id: helpRequestId },
            select: { id: true, user_id: true, status: true },
        });

        if (!helpRequest) {
            throw { status: 404, message: 'Permintaan bantuan tidak ditemukan' };
        }

        // hanya peminta bantuan
        if (helpRequest.user_id !== requesterId) {
            throw { status: 403, message: 'Anda tidak berhak mengonfirmasi relawan' };
        }

        if (helpRequest.status !== 'TAKEN') {
            throw {
                status: 409,
                message: 'Status bantuan tidak dapat dikonfirmasi',
            };
        }

        const assignment = await tx.helpAssignment.findUnique({
            where: { id: assignmentId },
            select: { id: true, help_request_id: true, status: true },
        });

        if (!assignment || assignment.help_request_id !== helpRequestId) {
            throw { status: 404, message: 'Assignment tidak valid' };
        }

        if (assignment.status !== 'TAKEN') {
            throw {
                status: 409,
                message: 'Assignment tidak dapat dikonfirmasi',
            };
        }

        await tx.helpAssignment.update({
            where: { id: assignmentId },
            data: {
                status: 'CONFIRMED',
                confirmed_at: new Date(),
            },
        });

        await tx.helpRequest.update({
            where: { id: helpRequestId },
            data: { status: 'IN_PROGRESS' },
        });

        return { success: true };
    });
};

exports.cancelHelpRequest = async (userId, helpRequestId, payload = {}) => {
    const { reason_code, reason_text } = payload;

    if (!reason_code) {
        throw new Error("Alasan pembatalan wajib diisi");
    }

    // ===== FETCH HELP + ACTIVE ASSIGNMENT =====
    const help = await prisma.helpRequest.findUnique({
        where: { id: helpRequestId },
        include: {
            assignments: {
                where: {
                    status: { in: ["TAKEN", "CONFIRMED"] },
                },
            },
        },
    });

    if (!help) throw new Error("Help request tidak ditemukan");

    const assignment = help.assignments[0] ?? null;

    // ===== DETECT ACTOR =====
    let actor;
    if (help.user_id === userId) {
        actor = CancelActor.REQUESTER;
    } else if (assignment && assignment.helper_id === userId) {
        actor = CancelActor.HELPER;
    } else {
        throw new Error("Tidak memiliki hak membatalkan bantuan ini");
    }

    // ===== VALIDATE REASON BY ACTOR =====
    const VALID_REASON_BY_ACTOR = {
        [CancelActor.REQUESTER]: [
            CancelReasonCode.CHANGE_OF_MIND,
            CancelReasonCode.FOUND_OTHER_HELPER,
            CancelReasonCode.NO_LONGER_NEEDED,
            CancelReasonCode.HELPER_NO_RESPONSE,
            CancelReasonCode.HELPER_LATE,
        ],
        [CancelActor.HELPER]: [
            CancelReasonCode.CANNOT_REACH_LOCATION,
            CancelReasonCode.REQUESTER_NO_SHOW,
            CancelReasonCode.REQUESTER_UNRESPONSIVE,
            CancelReasonCode.TASK_NOT_AS_DESCRIBED,
        ],
    };

    if (!VALID_REASON_BY_ACTOR[actor]?.includes(reason_code)) {
        throw new Error("Reason code tidak valid untuk aktor ini");
    }

    // ===== DETECT STAGE =====
    let stage = CancelStage.BEFORE_TAKEN;
    if (assignment?.status === "TAKEN") stage = CancelStage.AFTER_TAKEN;
    if (assignment?.status === "CONFIRMED")
        stage = CancelStage.AFTER_CONFIRMED;

    // ===== SCORING RULE =====
    let impact_score = 0;
    let violation_score = 0;

    if (actor === CancelActor.REQUESTER && stage !== CancelStage.BEFORE_TAKEN) {
        impact_score = 10;
        violation_score =
            stage === CancelStage.AFTER_CONFIRMED ? 20 : 10;
    }

    if (actor === CancelActor.HELPER) {
        impact_score = 15;
        violation_score =
            stage === CancelStage.AFTER_CONFIRMED ? 25 : 10;
    }

    // ===== TRANSACTION =====
    return prisma.$transaction(async (tx) => {
        await tx.cancelEvent.create({
            data: {
                help_request_id: help.id,
                assignment_id: assignment?.id,
                actor,
                actor_user_id: userId,
                stage,
                reason_code,
                reason_text,
                impact_score,
                violation_score,
            },
        });

        if (actor === CancelActor.REQUESTER) {
            await tx.helpRequest.update({
                where: { id: help.id },
                data: {
                    status: "CANCELLED",
                    deleted_at: new Date(),
                },
            });
        }

        if (actor === CancelActor.HELPER && assignment) {
            await tx.helpAssignment.update({
                where: { id: assignment.id },
                data: {
                    status: "FAILED",
                    failed_at: new Date(),
                },
            });

            await tx.helpRequest.update({
                where: { id: help.id },
                data: {
                    status: "OPEN",
                },
            });
        }

        chatService.closeChatRoom(assignment.id, tx)

        return {
            actor,
            stage,
            impact_score,
            violation_score,
        };
    });
};

