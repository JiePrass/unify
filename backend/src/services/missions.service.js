const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * GET semua misi milik user + progress
 */
exports.getUserMissions = async (userId) => {
    return prisma.userMission.findMany({
        where: { user_id: userId },
        include: {
            mission: {
                include: {
                    rewardBadge: true,
                },
            },
        },
        orderBy: [
            { is_completed: 'asc' },
            { id: 'asc' },
        ],
    })
}

/**
 * Assign all missions ke user
 * dipanggil saat register / login pertama
 */
exports.assignMissionsToUser = async (userId) => {
    const missions = await prisma.mission.findMany()

    const existing = await prisma.userMission.findMany({
        where: { user_id: userId },
        select: { mission_id: true },
    })

    const existingMissionIds = new Set(existing.map(m => m.mission_id))

    const toCreate = missions
        .filter(m => !existingMissionIds.has(m.id))
        .map(m => ({
            user_id: userId,
            mission_id: m.id,
        }))

    if (toCreate.length) {
        await prisma.userMission.createMany({ data: toCreate })
    }
}

/**
 * Update mission progress by event
 * event berasal dari HELP SERVICE
 */
exports.updateMissionProgress = async (userId, event, increment = 1) => {
    const EVENT_MISSION_MAP = {
        HELP_TAKEN: ['HELP_TAKEN'],
        HELP_COMPLETED: ['HELP_COMPLETED'],
        HELP_REQUEST: ['HELP_REQUEST'],

        LOGIN_STREAK: ['LOGIN_STREAK'],

        PROFILE_COMPLETED: ['PROFILE_COMPLETED'],
    }

    const missionCodes = EVENT_MISSION_MAP[event]
    if (!missionCodes) return

    const missions = await prisma.mission.findMany({
        where: { code: { in: missionCodes } },
    })

    if (!missions.length) return

    for (const mission of missions) {
        await progressSingleMission(userId, mission, increment)
    }
}

/**
 * Progress satu mission (idempotent & safe)
 */
const progressSingleMission = async (userId, mission, increment) => {
    const userMission = await prisma.userMission.findFirst({
        where: {
            user_id: userId,
            mission_id: mission.id,
            is_completed: false,
        },
    })

    if (!userMission) return

    const nextProgress = userMission.progress_value + increment

    if (nextProgress >= mission.target_value && mission.auto_complete) {
        await completeMission(userId, mission, userMission.id)
    } else {
        await prisma.userMission.update({
            where: { id: userMission.id },
            data: { progress_value: nextProgress },
        })
    }
}

/**
 * Complete mission + reward
 * dijamin tidak double reward
 */
const completeMission = async (userId, mission, userMissionId) => {
    await prisma.$transaction(async (tx) => {
        const alreadyCompleted = await tx.userMission.findUnique({
            where: { id: userMissionId },
            select: { is_completed: true },
        })

        if (alreadyCompleted?.is_completed) return

        await tx.userMission.update({
            where: { id: userMissionId },
            data: {
                progress_value: mission.target_value,
                is_completed: true,
                completed_at: new Date(),
            },
        })

        await tx.user.update({
            where: { id: userId },
            data: {
                points: { increment: mission.reward_points },
            },
        })

        if (mission.reward_badge_id) {
            await tx.userBadge.create({
                data: {
                    user_id: userId,
                    badge_id: mission.reward_badge_id,
                },
            })
        }

        await tx.notification.create({
            data: {
                user_id: userId,
                title: 'Misi Selesai',
                body: `Misi "${mission.title}" berhasil diselesaikan`,
                type: 'MISSION',
            },
        })
    })
}
