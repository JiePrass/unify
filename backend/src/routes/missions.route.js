const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missions.controller");
const requireLogin = require("../middlewares/requireLogin");

router.use(requireLogin);

router.get('/', missionController.getMyMissions)

module.exports = router;
