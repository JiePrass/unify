const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const missionService = require('../missions/missions.service');

exports.markCompleted = async (assignmentId, helperId) => {
    return prisma.$transaction(async (tx) => {

        const assignment = await tx.helpAssignment.findUnique({
            where: { id: assignmentId },
            include: {
                helpRequest: true,
            },
        });

        if (!assignment) {
            throw { status: 404, message: 'Assignment tidak ditemukan' };
        }

        if (assignment.helper_id !== helperId) {
            throw { status: 403, message: 'Akses ditolak' };
        }

        if (assignment.status !== 'CONFIRMED' && assignment.helpRequest.status !== 'IN_PROGRESS') {
            throw {
                status: 409,
                message: 'Bantuan belum atau sudah diselesaikan',
            };
        }

        await tx.helpAssignment.update({
            where: { id: assignmentId },
            data: {
                status: 'COMPLETED',
                completed_at: new Date(),
            },
        });

        await tx.helpRequest.update({
            where: { id: assignment.help_request_id },
            data: { status: 'COMPLETED' },
        });

        // reward → helper
        await missionService.updateMissionProgress(
            helperId,
            'HELP_COMPLETED',
            1,
            tx
        );

        return { success: true };
    });
};


exports.markFailed = async (assignmentId) => {
    const assignment = await prisma.helpAssignment.update({
        where: { id: assignmentId },
        data: {
            status: "FAILED",
            failed_at: new Date()
        }
    });

    await prisma.helpRequest.update({
        where: { id: assignment.help_request_id },
        data: { status: "CANCELLED" }
    });

    return assignment;
};

exports.markTimeout = async (helpRequestId) => {
    const help = await prisma.helpRequest.findUnique({ where: { id: helpRequestId }});

    if (!help) return null;
    if (help.status !== "OPEN") return null; 

    return prisma.helpRequest.update({
        where: { id: helpRequestId },
        data: { status: "TIMEOUT" }
    });
};

exports.markGracePeriodEnd = async (helpRequestId) => {
    const help = await prisma.helpRequest.findUnique({
        where: { id: helpRequestId },
        include: { assignments: true }
    });

    if (!help) return null;
    if (help.status !== "TAKEN") return null;

    return prisma.helpRequest.update({
        where: { id: helpRequestId },
        data: { status: "CANCELLED" }
    });
};

