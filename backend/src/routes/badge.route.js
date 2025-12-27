const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badge.controller');
const requireLogin = require('../middlewares/requireLogin');
const requireRole = require('../middlewares/requireRole');
const upload = require('../middlewares/upload');

router.use(requireLogin);
router.get('/', badgeController.getAllBadges);
router.get('/:id', badgeController.getBadgeById);

router.use(requireRole('ADMIN'));
router.post('/', upload.single('icon'), badgeController.createBadge);
router.patch('/:id', upload.single('icon'), badgeController.updateBadge);
router.delete('/:id', badgeController.deleteBadge);

module.exports = router;
