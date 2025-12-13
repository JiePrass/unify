const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.getProfileById = async (userId) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            avatar_url: true,
            points: true,
            reputation_score: true,
            role: true,
            isVerified: true,
            created_at: true,

            _count: {
                select: {
                    helpRequests: true,
                    helpAssignments: true,
                    userBadges: true,
                },
            },
        },
    })
}

exports.updateProfile = async (userId, data) => {
    const allowedFields = {
        full_name: data.full_name,
        phone: data.phone,
        avatar_url: data.avatar_url,
    }

    return prisma.user.update({
        where: { id: userId },
        data: allowedFields,
        select: {
            id: true,
            full_name: true,
            phone: true,
            avatar_url: true,
            updated_at: true,
        },
    })
}

exports.getUserStats = async (userId) => {
    const [
        helpCreated,
        helpCompleted,
        helpedOthers,
    ] = await Promise.all([
        prisma.helpRequest.count({
            where: { user_id: userId },
        }),
        prisma.helpRequest.count({
            where: {
                user_id: userId,
                status: 'COMPLETED',
            },
        }),
        prisma.helpAssignment.count({
            where: {
                helper_id: userId,
                status: 'COMPLETED',
            },
        }),
    ])

    return {
        help_created: helpCreated,
        help_completed: helpCompleted,
        help_helped: helpedOthers,
    }
}

exports.getUserBadges = async (userId) => {
    return prisma.userBadge.findMany({
        where: { user_id: userId },
        include: {
            badge: {
                select: {
                    id: true,
                    name: true,
                    icon_url: true,
                    tier: true,
                },
            },
        },
        orderBy: {
            awarded_at: 'desc',
        },
    })
}

exports.getUserMissions = async (userId) => {
    return prisma.userMission.findMany({
        where: { user_id: userId },
        include: {
            mission: {
                select: {
                    id: true,
                    code: true,
                    title: true,
                    category: true,
                    target_value: true,
                    reward_points: true,
                },
            },
        },
    })
}
