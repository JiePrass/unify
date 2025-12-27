const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CREATE BADGE
exports.createBadge = async (data) => {
    return prisma.badge.create({
        data: {
            name: data.name,
            icon_url: data.icon_url,
            tier: data.tier,
        },
    });
};

// GET ALL BADGES (with user obtained status if userId provided)
exports.getAllBadges = async (userId = null) => {
    const badges = await prisma.badge.findMany({
        orderBy: { id: 'asc' },
    });

    // If userId is provided, include information about which badges the user has obtained
    if (userId) {
        // Get all badges obtained by this user
        const userBadges = await prisma.userBadge.findMany({
            where: { user_id: userId },
            select: { badge_id: true, awarded_at: true },
        });

        // Create a map for quick lookup
        const userBadgeMap = new Map(
            userBadges.map(ub => [ub.badge_id, ub.awarded_at])
        );

        // Add isObtained and awardedAt fields to each badge
        return badges.map(badge => ({
            ...badge,
            isObtained: userBadgeMap.has(badge.id),
            awardedAt: userBadgeMap.get(badge.id) || null,
        }));
    }

    return badges;
};

// GET BADGE BY ID
exports.getBadgeById = async (badgeId) => {
    const badge = await prisma.badge.findUnique({
        where: { id: badgeId },
    });

    if (!badge) {
        throw new Error('Badge not found');
    }

    return badge;
};

// UPDATE BADGE
exports.updateBadge = async (badgeId, data) => {
    const updateData = {
        name: data.name,
        tier: data.tier,
    };
    
    // Only update icon_url if provided
    if (data.icon_url) {
        updateData.icon_url = data.icon_url;
    }
    
    return prisma.badge.update({
        where: { id: badgeId },
        data: updateData,
    });
};

// DELETE BADGE
exports.deleteBadge = async (badgeId) => {
    return prisma.badge.delete({
        where: { id: badgeId },
    });
};
