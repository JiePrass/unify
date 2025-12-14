const express = require("express");
const router = express.Router();
const missionsController = require("../controllers/admin-missions.controller");
const requireLogin = require("../middlewares/requireLogin");
const requireRole = require("../middlewares/requireRole");
router.use(requireLogin);
router.use(requireRole("ADMIN"));

// ========= Missions Management Routes =========
router.post('/missions', missionsController.createMission)
router.get('/missions', missionsController.getAllMissions)
router.get('/missions/:id', missionsController.getMissionById)
router.delete('/missions/:id', missionsController.deleteMission)

module.exports = router;