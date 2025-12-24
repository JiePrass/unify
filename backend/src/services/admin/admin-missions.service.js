const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * CREATE MISSION
 */
exports.createMission = async (payload) => {
    const {
        code,
        title,
        description,
        category,
        target_value,
        reward_points,
        reward_badge_id,
        auto_complete = true,
    } = payload

    // VALIDASI BADGE HANYA JIKA ADA ID VALID
    if (typeof reward_badge_id === 'number') {
        const badge = await prisma.badge.findUnique({
            where: { id: reward_badge_id },
        })

        if (!badge) {
            throw new Error('Reward badge tidak ditemukan')
        }
    }

    return prisma.mission.create({
        data: {
            code,
            title,
            description,
            category,
            target_value,
            reward_points,
            reward_badge_id: reward_badge_id ?? null,
            auto_complete,
        },
    })
}


/**
 * READ ALL MISSIONS
 */
exports.getAllMissions = async () => {
    return prisma.mission.findMany({
        orderBy: { id: 'desc' },
        include: {
            rewardBadge: true,
            _count: {
                select: { userMissions: true },
            },
        },
    })
}

/**
 * READ DETAIL MISSION
 */
exports.getMissionById = async (missionId) => {
    return prisma.mission.findUnique({
        where: { id: missionId },
        include: {
            rewardBadge: true,
            userMissions: {
                take: 5,
                orderBy: { id: 'desc' },
                include: { user: true },
            },
        },
    })
}

/**
 * DELETE MISSION
 * hanya boleh jika belum dipakai user
 */
exports.deleteMission = async (missionId) => {
    const used = await prisma.userMission.count({
        where: { mission_id: missionId },
    })

    if (used > 0) {
        throw new Error('Misi sudah digunakan user dan tidak bisa dihapus')
    }

    return prisma.mission.delete({
        where: { id: missionId },
    })
}