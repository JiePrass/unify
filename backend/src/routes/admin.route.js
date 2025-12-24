const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const requireLogin = require("../middlewares/requireLogin");
const requireRole = require("../middlewares/requireRole");
router.use(requireLogin);
router.use(requireRole("ADMIN"));

// ========= Missions Management Routes =========
router.post('/missions', adminController.createMission)
router.get('/missions', adminController.getAllMissions)
router.get('/missions/:id', adminController.getMissionById)
router.delete('/missions/:id', adminController.deleteMission)

// ========= Cancel Help Report Routes =========
router.get("/cancel-help", adminController.getCancelEvents);

module.exports = router;