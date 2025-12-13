const profileService = require('../services/profile.service')
const cloudinary = require('../lib/cloudinary')

// GET /profile/me
exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id

        const profile = await profileService.getProfileById(userId)
        if (!profile) {
            return res.status(404).json({ error: 'User tidak ditemukan' })
        }

        res.json(profile)
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil profil' })
    }
}

// PUT /profile/me
exports.updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.id
        const { full_name, phone } = req.body

        let avatarUrl

        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
                {
                    folder: 'unify/avatars',
                    public_id: `user_${userId}`,
                    overwrite: true,
                    transformation: [
                        { width: 512, height: 512, crop: 'fill', gravity: 'face' },
                    ],
                }
            )

            avatarUrl = uploadResult.secure_url
        }

        const updated = await profileService.updateProfile(userId, {
            full_name,
            phone,
            avatar_url: avatarUrl,
        })

        res.json({
            message: 'Profil berhasil diperbarui',
            data: updated,
        })
    } catch (err) {
        res.status(500).json({ error: err.message || 'Gagal memperbarui profil' })
    }
}

// GET /profile/me/stats
exports.getMyStats = async (req, res) => {
    try {
        const userId = req.user.id
        const stats = await profileService.getUserStats(userId)

        res.json(stats)
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil statistik' })
    }
}

// GET /profile/me/badges
exports.getMyBadges = async (req, res) => {
    try {
        const userId = req.user.id
        const badges = await profileService.getUserBadges(userId)

        res.json(badges)
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil badge' })
    }
}

// GET /profile/me/missions
exports.getMyMissions = async (req, res) => {
    try {
        const userId = req.user.id
        const missions = await profileService.getUserMissions(userId)

        res.json(missions)
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil misi' })
    }
}
