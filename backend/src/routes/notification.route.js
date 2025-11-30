const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const requireLogin = require('../middlewares/requireLogin');

router.get('/', requireLogin, notificationController.list);
router.patch('/:id/read', requireLogin, notificationController.read);
router.patch('/read-all', requireLogin, notificationController.readAll);
router.delete('/:id', requireLogin, notificationController.delete);


module.exports = router;
