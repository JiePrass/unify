const service = require("../services/leaderboard.service");

exports.getGlobalLeaderboard = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 10;
        const userId = req.user.id;

        const [leaderboard, myRank] = await Promise.all([
            service.getTopUsers(limit),
            service.getUserRank(userId),
        ]);

        return res.json({
            success: true,
            data: {
                leaderboard,
                my_rank: myRank,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil leaderboard",
        });
    }
};
