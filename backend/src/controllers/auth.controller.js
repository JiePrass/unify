const authService = require('../services/auth.service')

exports.register = async (req, res) => {
    try {
        const response = await authService.register(req.body)
        res.status(201).json(response)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

exports.verifyEmail = async (req, res) => {
    try {
        const response = await authService.verifyEmail(req.body)
        res.status(200).json(response)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

exports.login = async (req, res) => {
    try {
        const response = await authService.login(req.body)
        res.status(200).json(response)
    } catch (error) {
        res.status(401).json({ error: error.message })
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const result = await authService.requestPasswordReset(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const result = await authService.resetPassword(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.me = async (req, res) => {
    try {
        const user = await authService.getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "User tidak ditemukan" });
        }

        res.status(200).json({
            message: "Data user berhasil diambil",
            user,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const response = await authService.googleLogin(req.body);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.resendVerificationEmail = async (req, res) => {
    try {
        const response = await authService.resendVerificationEmail(req.body);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};