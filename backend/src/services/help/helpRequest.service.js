const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const missionService = require('../missions/missions.service');

// CREATE
exports.createHelpRequest = async (userId, data) => {
    return prisma.$transaction(async (tx) => {

        const ACTIVE_STATUSES = ['OPEN', 'TAKEN', 'IN_PROGRESS'];

        // Cek: user tidak boleh punya bantuan aktif
        const activeHelp = await tx.helpRequest.findFirst({
            where: {
                user_id: userId,
                status: { in: ACTIVE_STATUSES },
            },
            select: { id: true },
        });

        if (activeHelp) {
            throw new Error('User masih memiliki permintaan bantuan aktif');
        }

        const timeoutAt = new Date(Date.now() + 10 * 60 * 1000);
        const graceEnd = new Date(timeoutAt.getTime() + 10 * 60 * 1000);

        const help = await tx.helpRequest.create({
            data: {
                user_id: userId,
                title: data.title,
                description: data.description,
                category: data.category,
                latitude: data.latitude,
                longitude: data.longitude,
                timeout_at: timeoutAt,
                grace_period_end: graceEnd,
            },
        });

        await missionService.updateMissionProgress(
            userId,
            'HELP_REQUEST',
            1,
            tx
        );

        return help;
    });
};


// LIST untuk relawan
exports.getNearbyHelpRequests = async (lat, lng, radius = 5000) => {
    const radiusKm = radius / 1000;

    return prisma.$queryRaw`
        SELECT *
        FROM (
            SELECT
                hr.*,
                (
                    6371 * acos(
                        cos(radians(${lat}))
                        * cos(radians(hr.latitude))
                        * cos(radians(hr.longitude) - radians(${lng}))
                        + sin(radians(${lat}))
                        * sin(radians(hr.latitude))
                    )
                ) AS distance_km
            FROM "HelpRequest" hr
            WHERE hr.status = 'OPEN'
            AND hr.deleted_at IS NULL
        ) sub
        WHERE sub.distance_km <= ${radiusKm}
        ORDER BY sub.distance_km ASC;
    `;
};

// DETAIL
exports.getHelpRequestById = async (id) => {
    return prisma.helpRequest.findUnique({ where: { id } });
};

// GET ACTIVE HELP REQUEST BY USER
exports.getActiveHelpByUser = async (userId) => {
    const ACTIVE_HELP_STATUSES = ['OPEN', 'TAKEN', 'IN_PROGRESS'];
    const ACTIVE_ASSIGNMENT_STATUSES = ['TAKEN', 'CONFIRMED'];

    const asRequester = await prisma.helpRequest.findFirst({
        where: {
            user_id: userId,
            status: { in: ACTIVE_HELP_STATUSES },
        },
        include: {
            assignments: {
                where: {
                    status: { in: ACTIVE_ASSIGNMENT_STATUSES },
                },
                include: {
                    helper: {
                        select: {
                            id: true,
                            full_name: true,
                            avatar_url: true,
                        },
                    },
                },
            },
        },
    });

    if (asRequester) {
        return {
            role: 'REQUESTER',
            help: asRequester,
        };
    }

    const asHelper = await prisma.helpAssignment.findFirst({
        where: {
            helper_id: userId,
            status: { in: ACTIVE_ASSIGNMENT_STATUSES },
            helpRequest: {
                status: { in: ACTIVE_HELP_STATUSES },
            },
        },
        include: {
            helpRequest: {
                include: {
                    user: {
                        select: {
                            id: true,
                            full_name: true,
                            avatar_url: true,
                        },
                    },
                },
            },
        },
    });

    if (asHelper) {
        return {
            role: 'HELPER',
            help: asHelper.helpRequest,
            assignment_id: asHelper.id,
        };
    }

    return null;
};

// SOFT DELETE
exports.deleteHelpRequest = async (userId, helpId) => {
    return prisma.helpRequest.update({
        where: { id: helpId, user_id: userId },
        data: { deleted_at: new Date() }
    });
};
