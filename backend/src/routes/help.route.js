const express = require("express");
const router = express.Router();
const requireLogin = require("../middlewares/requireLogin");
const helpController = require("../controllers/help.controller");

// =======================================
// HELP REQUEST — MEMINTA BANTUAN
// =======================================

// Membuat bantuan
router.post("/", requireLogin, helpController.createHelpRequest);

// Mendapatkan bantuan terdekat
router.get("/nearby", requireLogin, helpController.getNearbyHelpRequests);

// Detail bantuan
router.get("/:id", requireLogin, helpController.getHelpRequestById);

// Menghapus bantuan (soft delete)
router.delete("/:id", requireLogin, helpController.deleteHelpRequest);

// =======================================
// HELP ASSIGNMENT — RELAWAN MENGAMBIL / DIKONFIRMASI
// =======================================

// Relawan mengambil bantuan
router.post("/:id/take", requireLogin, helpController.takeHelpRequest);

// Peminta bantuan mengonfirmasi relawan tertentu
router.post("/:id/confirm", requireLogin, helpController.confirmHelper);

// Membatalkan bantuan (oleh user atau relawan tertentu)
router.post("/:id/cancel", requireLogin, helpController.cancelHelpRequest);

// =======================================
// HELP STATUS — STATUS AKHIR
// =======================================

// Relawan menandai selesai
router.post("/assignment/:assignmentId/complete", requireLogin, helpController.markCompleted);

// Relawan menandai gagal
router.post("/assignment/:assignmentId/failed", requireLogin, helpController.markFailed);

// Admin/automated — timeout sebelum diambil
router.post("/:id/force-timeout", requireLogin, helpController.forceTimeout);

// Admin/automated — timeout setelah grace period
router.post("/:id/force-grace-cancel", requireLogin, helpController.forceGraceCancel);

module.exports = router;
