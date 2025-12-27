const badgeService = require('../services/badge.service');
const cloudinary = require('../lib/cloudinary');

// CREATE
exports.createBadge = async (req, res) => {
    try {
        const { name, tier } = req.body;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Icon file is required',
            });
        }

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
            {
                folder: 'unify/badges',
                transformation: [
                    { width: 256, height: 256, crop: 'fill' },
                ],
            }
        );

        const badge = await badgeService.createBadge({
            name,
            tier,
            icon_url: uploadResult.secure_url,
        });

        return res.status(201).json({
            success: true,
            data: badge,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// READ ALL
exports.getAllBadges = async (req, res) => {
    try {
        const userId = req.user.id;
        const badges = await badgeService.getAllBadges(userId);
        return res.json({
            success: true,
            data: badges,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// READ ONE
exports.getBadgeById = async (req, res) => {
    try {
        const badgeId = Number(req.params.id);
        const badge = await badgeService.getBadgeById(badgeId);
        return res.json({
            success: true,
            data: badge,
        });
    } catch (err) {
        return res.status(404).json({
            success: false,
            message: err.message,
        });
    }
};

// UPDATE
exports.updateBadge = async (req, res) => {
    try {
        const badgeId = Number(req.params.id);
        const { name, tier } = req.body;
        
        let icon_url;
        
        // If new icon file uploaded
        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
                {
                    folder: 'unify/badges',
                    transformation: [
                        { width: 256, height: 256, crop: 'fill' },
                    ],
                }
            );
            icon_url = uploadResult.secure_url;
        }
        
        const badge = await badgeService.updateBadge(badgeId, {
            name,
            tier,
            icon_url,
        });
        
        return res.json({
            success: true,
            data: badge,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// DELETE
exports.deleteBadge = async (req, res) => {
    try {
        const badgeId = Number(req.params.id);
        await badgeService.deleteBadge(badgeId);
        return res.json({
            success: true,
            message: 'Badge deleted successfully',
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
