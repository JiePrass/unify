const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * =========================
 * UTILITIES
 * =========================
 */
function startOfYear(year) {
    return new Date(`${year}-01-01T00:00:00.000Z`);
}

function endOfYear(year) {
    return new Date(`${year}-12-31T23:59:59.999Z`);
}

function initMonthlyMap() {
    return {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
        7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0,
    };
}

/**
 * =========================
 * SUMMARY
 * =========================
 */
async function getDashboardSummary() {
    const [
        totalUsers,
        activeUsers,
        totalHelpRequests,
        cancelledHelpRequests,
    ] = await Promise.all([
        prisma.user.count(),

        prisma.user.count({
            where: {
                OR: [
                    { helpRequests: { some: {} } },
                    { helpAssignments: { some: {} } },
                    { chatMessages: { some: {} } },
                ],
            },
        }),

        prisma.helpRequest.count(),

        prisma.helpRequest.count({
            where: { status: "CANCELLED" },
        }),
    ]);

    return {
        totalUsers,
        activeUsers,
        totalHelpRequests,
        cancelledHelpRequests,
    };
}

/**
 * =========================
 * HELP REQUEST STATUS
 * =========================
 */
async function getHelpRequestStatusStats() {
    const data = await prisma.helpRequest.groupBy({
        by: ["status"],
        _count: { status: true },
    });

    return data.map((item) => ({
        status: item.status,
        total: item._count.status,
    }));
}

/**
 * =========================
 * CANCEL REASON STATS
 * =========================
 */
async function getCancelReasonStats() {
    const data = await prisma.cancelHelpRequest.groupBy({
        by: ["reason_code"],
        _count: { reason_code: true },
    });

    return data.map((item) => ({
        reason: item.reason_code,
        total: item._count.reason_code,
    }));
}

/**
 * =========================
 * HELP REQUEST TREND (PER BULAN)
 * PARAM: year (number)
 * =========================
 */
async function getHelpRequestMonthlyTrend(year = new Date().getFullYear()) {
    const start = startOfYear(year);
    const end = endOfYear(year);

    const data = await prisma.helpRequest.findMany({
        where: {
            created_at: {
                gte: start,
                lte: end,
            },
        },
        select: {
            created_at: true,
        },
    });

    const monthlyMap = initMonthlyMap();

    data.forEach((item) => {
        const month = item.created_at.getMonth() + 1;
        monthlyMap[month]++;
    });

    return Object.keys(monthlyMap).map((month) => ({
        month: Number(month), // 1 - 12
        total: monthlyMap[month],
    }));
}

/**
 * =========================
 * USER REGISTRATION TREND (PER BULAN)
 * =========================
 */
async function getUserMonthlyTrend(year = new Date().getFullYear()) {
    const start = startOfYear(year);
    const end = endOfYear(year);

    const data = await prisma.user.findMany({
        where: {
            created_at: {
                gte: start,
                lte: end,
            },
        },
        select: {
            created_at: true,
        },
    });

    const monthlyMap = initMonthlyMap();

    data.forEach((item) => {
        const month = item.created_at.getMonth() + 1;
        monthlyMap[month]++;
    });

    return Object.keys(monthlyMap).map((month) => ({
        month: Number(month),
        total: monthlyMap[month],
    }));
}

/**
 * =========================
 * TOP HELPERS
 * =========================
 */
async function getTopHelpers(limit = 5) {
    const users = await prisma.user.findMany({
        where: {
            helpAssignments: {
                some: { status: "COMPLETED" },
            },
        },
        select: {
            id: true,
            full_name: true,
            points: true,
            reputation_score: true,
            helpAssignments: {
                where: { status: "COMPLETED" },
                select: { id: true },
            },
        },
        orderBy: {
            points: "desc",
        },
        take: limit,
    });

    return users.map((u) => ({
        id: u.id,
        name: u.full_name,
        completedHelps: u.helpAssignments.length,
        points: u.points,
        reputation: u.reputation_score,
    }));
}

/**
 * =========================
 * AGGREGATED DASHBOARD
 * =========================
 */
exports.getDashboardData = async (year) => {
    const [
        summary,
        helpStatus,
        cancelReasons,
        helpTrend,
        userTrend,
        topHelpers,
    ] = await Promise.all([
        getDashboardSummary(),
        getHelpRequestStatusStats(),
        getCancelReasonStats(),
        getHelpRequestMonthlyTrend(year),
        getUserMonthlyTrend(year),
        getTopHelpers(),
    ]);

    return {
        year,
        summary,
        charts: {
            helpStatus,
            cancelReasons,
            helpTrend,
            userTrend,
        },
        topHelpers,
    };
}

