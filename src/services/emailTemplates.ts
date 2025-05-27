interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export const createVerificationEmailTemplate = (verificationLink: string): EmailTemplate => ({
  subject: 'Verify Your Urban Sole Store Account',
  text: `
Welcome to Urban Sole Store!

Please verify your email address by clicking the link below:
${verificationLink}

This link will expire in 24 hours.

If you didn't create an account with us, you can safely ignore this email.

Best regards,
The Urban Sole Store Team
  `.trim(),
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    .button {
      background-color: #4F46E5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      display: inline-block;
      margin: 16px 0;
    }
  </style>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #111827;">Welcome to Urban Sole Store!</h2>
  <p>Please verify your email address by clicking the button below:</p>
  <a href="${verificationLink}" class="button">Verify Email Address</a>
  <p style="color: #6B7280; font-size: 14px;">This link will expire in 24 hours.</p>
  <p style="color: #6B7280; font-size: 14px;">If you didn't create an account with us, you can safely ignore this email.</p>
  <p>Best regards,<br>The Urban Sole Store Team</p>
</body>
</html>
  `.trim()
});

export const createPasswordResetTemplate = (resetLink: string): EmailTemplate => ({
  subject: 'Reset Your Urban Sole Store Password',
  text: `
You requested to reset your password for Urban Sole Store.

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
The Urban Sole Store Team
  `.trim(),
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    .button {
      background-color: #4F46E5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      display: inline-block;
      margin: 16px 0;
    }
  </style>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #111827;">Reset Your Password</h2>
  <p>You requested to reset your password for Urban Sole Store.</p>
  <p>Click the button below to reset your password:</p>
  <a href="${resetLink}" class="button">Reset Password</a>
  <p style="color: #6B7280; font-size: 14px;">This link will expire in 1 hour.</p>
  <p style="color: #6B7280; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
  <p>Best regards,<br>The Urban Sole Store Team</p>
</body>
</html>
  `.trim()
});
