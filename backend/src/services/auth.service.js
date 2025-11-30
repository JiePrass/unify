const { PrismaClient, TokenType } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const { generateOtp } = require('../utils/otp');
const { generateToken } = require('../utils/token');
const crypto = require('crypto');
const mailer = require('../utils/mailer');
const axios = require("axios");

exports.register = async (data) => {
    const { full_name, email, phone, password } = data;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) throw new Error('Email sudah digunakan.');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            full_name,
            email,
            phone,
            password: hashedPassword
        }
    });

    const otp = generateOtp();

    await prisma.emailToken.create({
        data: {
            userId: user.id,
            otp,
            type: TokenType.VERIFICATION,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        }
    });

    const emailHtml = `
        <h3>Verifikasi Email</h3>
        <p>Halo ${full_name},</p>
        <p>Kode OTP untuk verifikasi akun Anda:</p>
        <h2>${otp}</h2>
        <p>Berlaku 5 menit. Jangan bagikan ke siapa pun.</p>
    `;

    await mailer(email, 'Verifikasi Email Unify', emailHtml);

    return { message: 'Akun dibuat. Silakan cek email untuk verifikasi.' };
};

exports.verifyEmail = async ({ email, otp }) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Email tidak ditemukan.');

    const tokenRecord = await prisma.emailToken.findFirst({
        where: {
            userId: user.id,
            otp: otp.toString(),
            type: TokenType.VERIFICATION
        },
        orderBy: { createdAt: 'desc' }
    });

    if (!tokenRecord) throw new Error('OTP tidak valid.');
    if (new Date() > tokenRecord.expiresAt) throw new Error('OTP sudah kedaluwarsa.');

    if (user.isVerified) return { message: 'Akun sudah diverifikasi.' };

    await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true }
    });

    await prisma.emailToken.delete({ where: { id: tokenRecord.id } });

    return { message: 'Email berhasil diverifikasi. Silakan login.' };
};

exports.login = async ({ email, password }) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Akun tidak ditemukan.');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Password salah.');

    const token = generateToken({
        id: user.id,
        role: user.role
    });

    return {
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '2h',
        user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            avatar_url: user.avatar_url,
            role: user.role
        }
    };
};

exports.requestPasswordReset = async ({ email }) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Email tidak ditemukan.');

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.emailToken.create({
        data: {
            userId: user.id,
            otp: token,
            type: TokenType.RESET,
            expiresAt: expiry
        }
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const emailHtml = `
        <h3>Reset Password</h3>
        <p>Permintaan reset password diterima.</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Link berlaku 1 jam.</p>
    `;

    await mailer(email, 'Reset Password Unify', emailHtml);

    return { message: 'Link reset password telah dikirim ke email.' };
};

exports.resetPassword = async ({ token, newPassword }) => {
    const tokenRecord = await prisma.emailToken.findFirst({
        where: { otp: token, type: TokenType.RESET },
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    });

    if (!tokenRecord) throw new Error('Token tidak valid.');
    if (new Date() > tokenRecord.expiresAt) throw new Error('Token sudah kedaluwarsa.');

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: tokenRecord.user.id },
        data: { password: hashed }
    });

    await prisma.emailToken.delete({ where: { id: tokenRecord.id } });

    return { message: 'Password berhasil direset.' };
};

exports.getUserById = async (userId) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            full_name: true,
            email: true,
            avatar_url: true,
            phone: true,
            points: true,
            reputation_score: true,
            role: true,
            created_at: true
        }
    });
};

exports.googleLogin = async ({ code }) => {
    const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
    const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

    try {
        const tokenRes = await axios.post(GOOGLE_TOKEN_URL, null, {
            params: {
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                grant_type: "authorization_code",
            },
        });

        const { access_token } = tokenRes.data;

        const userRes = await axios.get(GOOGLE_USERINFO_URL, {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const googleUser = userRes.data;

        if (!googleUser.email) {
            throw new Error("Email Google tidak tersedia");
        }

        let user = await prisma.user.findUnique({
            where: { email: googleUser.email },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    full_name: googleUser.name,
                    email: googleUser.email,
                    isVerified: true,
                    avatar_url: googleUser.picture
                },
            });
        }

        const token = generateToken({
            id: user.id,
            role: user.role,
        });

        return {
            message: "Login Google berhasil",
            token,
            expiresIn: process.env.JWT_EXPIRES_IN || "2h",
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                avatar_url: user.avatar_url
            },
        };
    } catch (err) {
        console.error("Google login error:", err.response?.data || err.message);
        throw new Error("Login dengan Google gagal");
    }
};

exports.resendVerificationEmail = async ({ email }) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User tidak ditemukan.');
    if (user.isVerified) throw new Error('Email sudah diverifikasi.');

    const otp = generateOtp();

    await prisma.emailToken.deleteMany({
        where: { userId: user.id, type: TokenType.VERIFICATION }
    });

    await prisma.emailToken.create({
        data: {
            userId: user.id,
            otp,
            type: TokenType.VERIFICATION,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
    });

    const emailHtml = `
        <h3>Verifikasi Email</h3>
        <p>Halo ${user.full_name},</p>
        <p>Kode OTP Anda:</p>
        <h2>${otp}</h2>
        <p>Berlaku 5 menit.</p>
    `;

    await mailer(user.email, 'Kode Verifikasi Unify', emailHtml);

    return { message: 'Kode verifikasi baru dikirim ke email.' };
};
