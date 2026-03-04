const nodemailer = require('nodemailer');

let transport: any;

// Initialize transport based on environment
if (process.env.NODE_ENV === 'production') {
  // Use Resend for production
  // transport = new Resend(process.env.RESEND_API_KEY);
  transport = nodemailer.createTransport({
    host: process.env.BREVO_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASSWORD
    },
  });
} else {
  // Use Mailtrap for development
  transport = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS
    }
  });
}

const sendPasswordResetMail = async (url: string, email: string, username: string) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Arial', sans-serif;
          background-color: #f4f4f4;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 40px 20px;
        }
        .btn-primary {
          background-color: #1a1a1a;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
        }
        .expiry-info {
          color: #666;
          font-size: 14px;
          margin: 20px 0;
        }
        .divider {
          border: none;
          border-top: 1px solid #eee;
          margin: 30px 0;
        }
        .footer-text {
          color: #999;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <h1>Password Reset Request</h1>
        
        <p>Hello <strong>${username}</strong>,</p>
        
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        
        <a href="${url}" class="btn-primary">
          Reset Password
        </a>
        
        <p class="expiry-info">
          This link will expire in <strong>1 hour</strong>.
        </p>
        
        <hr class="divider">
        
        <p class="footer-text">
          If you didn't request this password reset, you can safely ignore this email
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    if (process.env.NODE_ENV === 'production') {
      // Use Resend for production
      const { data, error } = await transport.sendMail({
        from: process.env.BREVO_SENDER,
        to: email,
        subject: 'Password Reset Link',
        html: htmlContent
      });

      if (error) {
        throw error;
      }

      return { success: true, messageId: data.id };
    } else {
      // Use Mailtrap for development
      const info = await transport.sendMail({
        from: 'ForzaBuildBase <rahilganatra@gmail.com>',
        to: email,
        subject: 'Password Reset Link',
        html: htmlContent
      });

      return { success: true, messageId: info.messageId };
    }
  } catch (error) {
    throw error;
  }
};

export { sendPasswordResetMail };