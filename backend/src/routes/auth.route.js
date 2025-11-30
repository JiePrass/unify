const express = require('express')
const router = express.Router()
const requireLogin = require('../middlewares/requireLogin')
const authController = require('../controllers/auth.controller')
const requireUserId = require('../middlewares/requireUserId')

router.post('/register', authController.register)
router.post('/verify-email', authController.verifyEmail)
router.post('/resend-verification', authController.resendVerificationEmail);
router.post('/login', authController.login)
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', requireLogin, requireUserId, authController.me)
router.post("/google", authController.googleLogin);

module.exports = router
