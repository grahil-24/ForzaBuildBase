const nodemailer = require('nodemailer');

let transport: any;

// Initialize transport based on environment
if (process.env.NODE_ENV === 'production') {
  // Use Resend for production
  // transport = new Resend(process.env.RESEND_API_KEY);
  transport = nodemailer.createTransport({
    host: process.env.BREVO_HOST,
    port: 587,
    secure: true,
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

const sendVerificationMail = async (otp: string, username: string, email: string) => {
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
        .header {
          text-align: center;
          padding-bottom: 30px;
        }
        .header h1 {
          color: #333333;
          font-size: 24px;
          margin: 0;
        }
        .content {
          text-align: center;
          color: #666666;
          line-height: 1.6;
        }
        .greeting {
          font-size: 18px;
          color: #333333;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          margin-bottom: 30px;
        }
        .otp-container {
          background: #1a1a1a;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
          border: 2px solid #e0e0e0;
        }
        .otp-code {
          font-size: 28px;
          font-weight: bold;
          letter-spacing: 8px; 
          padding-left: 12px;
          color: #ffffff;
          user-select: all;
          -webkit-user-select: all;
          cursor: text;
          font-family: 'Courier New', monospace;
        }
        .otp-label {
          color: #cccccc;
          font-size: 13px;
          margin-top: 10px;
          opacity: 0.9;
        }
        .expiry-notice {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          text-align: left;
          color: #856404;
          font-size: 14px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eeeeee;
          text-align: center;
          color: #999999;
          font-size: 12px;
        }
        .warning {
          color: #dc3545;
          font-size: 14px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hello <strong>${username}</strong>,</p>
          
          <p class="message">
            Thank you for signing up! Please use the verification code below to complete your registration.
          </p>
          
          <div class="otp-container">
            <div class="otp-code">${otp}</div> 
            <p class="otp-label">Click to select and copy</p>
          </div>
          
          <div class="expiry-notice">
            <strong>Important:</strong> This code will expire in <strong>10 minutes</strong>
          </div>
          
          <p style="font-size: 14px; color: #666666;">
            Enter this code on the verification page to activate your account.
          </p>
          
          <p class="warning">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
        
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    if (process.env.NODE_ENV === 'production') {
      // Use brevo for production
      const { data, error } = await transport.sendMail({
        from: process.env.BREVO_SENDER,
        to: email,
        subject: 'Verify Your Email Address',
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
        subject: 'Verify Your Email Address',
        html: htmlContent
      });

      return { success: true, messageId: info.messageId };
    }
  } catch (error) {
    throw error;
  }
};

export { sendVerificationMail };