const express = require("express");
const router = express.Router();
const requireLogin = require("../middlewares/requireLogin");
const leaderboardController = require("../controllers/leaderboard.controller");
router.use(requireLogin);

router.get("/global", leaderboardController.getGlobalLeaderboard);

module.exports = router;