const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.takeHelpRequest = async (helperId, helpRequestId) => {
    // pastikan OPEN
    const help = await prisma.helpRequest.findUnique({
        where: { id: helpRequestId }
    });

    if (!help || help.status !== 'OPEN') {
        throw new Error("Bantuan tidak tersedia");
    }

    // buat assignment
    const assignment = await prisma.helpAssignment.create({
        data: {
            helper_id: helperId,
            help_request_id: helpRequestId,
            taken_at: new Date()
        }
    });

    // update status helpRequest → TAKEN
    await prisma.helpRequest.update({
        where: { id: helpRequestId },
        data: { status: "TAKEN" }
    });

    return assignment;
};

// konfirmasi oleh user
exports.confirmHelper = async (helpRequestId, assignmentId) => {
    await prisma.helpAssignment.update({
        where: { id: assignmentId },
        data: { status: "CONFIRMED", confirmed_at: new Date() }
    });

    await prisma.helpRequest.update({
        where: { id: helpRequestId },
        data: { status: "IN_PROGRESS" }
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

