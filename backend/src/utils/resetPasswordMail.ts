import { catchAsync } from "./catchAsync";

const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

const sendPasswordResetMail = async(url: string, email: string, username: string) => {
    const mailOptions = {
        from: 'ForzaBuildBase <rahilganatra@gmail.com>',
        to: email,
        subject: 'Password reset link',
        html: 
        `
            <!DOCTYPE html>
            <html>
            <head>
            <style>
                .btn-primary {
                background-color: #1a1a1a;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                display: inline-block;
                margin: 20px 0;
                }
                .revoke-link {
                color: #dc3545;
                font-size: 12px;
                text-decoration: underline;
                }
            </style>
            </head>
            <body>
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <h1>Password Reset Request</h1>
                
                <p>Hello <strong>${username}</strong>,</p>
                
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                
                <a href="${url}" class="btn-primary">
                Reset Password
                </a>
                
                <p style="color: #666; font-size: 14px;">
                This link will expire in <strong>1 hour</strong>.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 13px;">
                If you didn't request this password reset, you can safely ignore this email
                </p>
            </div>
            </body>
            </html>
        `
    }

    try {
        const info = await transport.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        throw error;
    }
}

export {sendPasswordResetMail}