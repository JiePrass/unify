const express = require("express");
const router = express.Router();
const requireLogin = require("../middlewares/requireLogin");
const helpController = require("../controllers/help.controller");

router.use(requireLogin);

// =======================================
// HELP REQUEST — MEMINTA BANTUAN
// =======================================

// Membuat bantuan
router.post("/", helpController.createHelpRequest);

// Mendapatkan bantuan terdekat
router.get("/nearby", helpController.getNearbyHelpRequests);

// Detail bantuan
router.get("/:id", helpController.getHelpRequestById);

// Menghapus bantuan (soft delete)
router.delete("/:id", helpController.deleteHelpRequest);

// =======================================
// HELP ASSIGNMENT — RELAWAN MENGAMBIL / DIKONFIRMASI
// =======================================

// Relawan mengambil bantuan
router.post("/:id/take", helpController.takeHelpRequest);

// Peminta bantuan mengonfirmasi relawan tertentu
router.post("/:id/confirm", helpController.confirmHelper);

// Membatalkan bantuan (oleh user atau relawan tertentu)
router.post("/:id/cancel", helpController.cancelHelpRequest);

// =======================================
// HELP STATUS — STATUS AKHIR
// =======================================

// Relawan menandai selesai
router.post("/assignment/:assignmentId/complete", helpController.markCompleted);

// Relawan menandai gagal
router.post("/assignment/:assignmentId/failed", helpController.markFailed);

// Admin/automated — timeout sebelum diambil
router.post("/:id/force-timeout", helpController.forceTimeout);

// Admin/automated — timeout setelah grace period
router.post("/:id/force-grace-cancel", helpController.forceGraceCancel);

module.exports = router;
