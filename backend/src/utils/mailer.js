// utils/mailer.js
const { Resend } = require("resend");

if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY belum diset di environment variables");
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, html) {
    try {
        const resp = await resend.emails.send({
            from: "UNIFY <noreply@simkas.highfiveindonesia.com>",
            to,
            subject,
            html,
        });

        return resp;
    } catch (err) {
        console.error("Resend send email error:", err);
        throw err;
    }
}

module.exports = sendEmail;
