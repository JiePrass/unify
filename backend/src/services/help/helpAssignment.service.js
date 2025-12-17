const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const missionService = require('../missions/missions.service');

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

exports.cancelHelpRequest = async (userId, helpRequestId) => {
    const help = await prisma.helpRequest.findUnique({ where: { id: helpRequestId }});

    if (!help) throw new Error("Tidak ditemukan");
    if (help.user_id !== userId) throw new Error("Tidak boleh membatalkan request orang lain");

    return prisma.helpRequest.update({
        where: { id: helpRequestId },
        data: { status: "CANCELLED", deleted_at: new Date() }
    });
};

