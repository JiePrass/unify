const express = require('express')
const router = express.Router()
const profileController = require('../controllers/profile.controller')
const requireLogin = require('../middlewares/requireLogin')
const upload = require('../middlewares/upload')
router.use(requireLogin)

router.get('/me', profileController.getMyProfile)
router.put('/me', upload.single('avatar'), profileController.updateMyProfile)

router.get('/me/stats', profileController.getMyStats)
router.get('/me/badges', profileController.getMyBadges)
router.get('/me/missions', profileController.getMyMissions)

module.exports = router
