const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const missionService = require('../missions/missions.service');
const { calculateDistanceKm } = require('../../utils/calculateDistanceKm');

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

    const helps = await prisma.helpRequest.findMany({
        where: {
            status: 'OPEN',
            deleted_at: null,
        },
    });

    const result = helps
        .map((help) => {
            const distanceKm = calculateDistanceKm(
                lat,
                lng,
                help.latitude,
                help.longitude
            );

            return {
                ...help,
                distance_km: distanceKm,
            };
        })
        .filter(
            (help) =>
                help.distance_km !== null &&
                help.distance_km <= radiusKm
        )
        .sort((a, b) => a.distance_km - b.distance_km);

    return result;
};

// DETAIL
exports.getHelpRequestById = async (id) => {
    return prisma.helpRequest.findUnique({ where: { id } });
};

// GET ACTIVE HELP REQUEST BY USER
exports.getActiveHelpByUser = async (userId, lat = null, lng = null) => {
    const ACTIVE_HELP_STATUSES = ['OPEN', 'TAKEN', 'IN_PROGRESS'];
    const ACTIVE_ASSIGNMENT_STATUSES = ['TAKEN', 'CONFIRMED'];

    // ========== REQUESTER ==========
    const asRequester = await prisma.helpRequest.findFirst({
        where: {
            user_id: userId,
            status: { in: ACTIVE_HELP_STATUSES },
        },
        include: {
            assignments: {
                where: { status: { in: ACTIVE_ASSIGNMENT_STATUSES } },
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
            help: {
                ...asRequester,
                distance_km: lat && lng
                    ? calculateDistanceKm(
                        lat,
                        lng,
                        asRequester.latitude,
                        asRequester.longitude
                    )
                    : null,
            },
        };
    }

    // ========== HELPER ==========
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
        const help = asHelper.helpRequest;

        return {
            role: 'HELPER',
            assignment_id: asHelper.id,
            help: {
                ...help,
                distance_km: lat && lng
                    ? calculateDistanceKm(
                        lat,
                        lng,
                        help.latitude,
                        help.longitude
                    )
                    : null,
            },
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
