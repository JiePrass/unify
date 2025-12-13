const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const requireLogin = require('../middlewares/requireLogin');

router.use(requireLogin);

router.get('/', notificationController.list);
router.patch('/:id/read', notificationController.read);
router.patch('/read-all', notificationController.readAll);
router.delete('/:id', notificationController.delete);


module.exports = router;
