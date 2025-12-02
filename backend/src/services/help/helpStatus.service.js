const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.markCompleted = async (assignmentId) => {
    const assignment = await prisma.helpAssignment.update({
        where: { id: assignmentId },
        data: {
            status: "COMPLETED",
            completed_at: new Date()
        }
    });

    await prisma.helpRequest.update({
        where: { id: assignment.help_request_id },
        data: { status: "COMPLETED" }
    });

    return assignment;
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

