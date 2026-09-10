/**
 * Email Templates for VolunteerHub
 * Returns HTML and plain text versions of emails
 */

export const emailTemplates = {
  /**
   * Welcome email for new members
   */
  welcome: (orgName, userName) => ({
    subject: `Welcome to ${orgName}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a5c3a 0%, #2d7a4f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #1a5c3a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${orgName}!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Thank you for joining our volunteer community! We're excited to have you on board.</p>
            <p>With your new account, you can:</p>
            <ul>
              <li>Browse and register for upcoming volunteer events</li>
              <li>Track your volunteer hours and progress</li>
              <li>Earn achievement medals as you contribute</li>
              <li>Connect with other volunteers in your community</li>
            </ul>
            <p>Get started by exploring our upcoming events and finding opportunities that match your interests and schedule.</p>
            <p>Thank you for making a difference!</p>
            <p>Best regards,<br>The ${orgName} Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message from ${orgName}. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to ${orgName}!\n\nHi ${userName},\n\nThank you for joining our volunteer community! We're excited to have you on board.\n\nWith your new account, you can:\n- Browse and register for upcoming volunteer events\n- Track your volunteer hours and progress\n- Earn achievement medals as you contribute\n- Connect with other volunteers in your community\n\nGet started by exploring our upcoming events and finding opportunities that match your interests and schedule.\n\nThank you for making a difference!\n\nBest regards,\nThe ${orgName} Team\n\n---\nThis is an automated message from ${orgName}. Please do not reply to this email.`
  }),

  /**
   * Event registration confirmation
   */
  registration: (orgName, eventTitle, eventDate, eventLocation) => ({
    subject: `Registration Confirmed: ${eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a5c3a 0%, #2d7a4f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a5c3a; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Registration Confirmed!</h1>
          </div>
          <div class="content">
            <p>You're all set for <strong>${eventTitle}</strong>!</p>
            <div class="event-details">
              <p><strong>Event:</strong> ${eventTitle}</p>
              <p><strong>Date:</strong> ${eventDate}</p>
              <p><strong>Location:</strong> ${eventLocation}</p>
            </div>
            <p><strong>What to bring:</strong></p>
            <ul>
              <li>Water bottle</li>
              <li>Comfortable clothing and shoes</li>
              <li>Sunscreen and hat (if outdoors)</li>
              <li>Enthusiasm and positive attitude!</li>
            </ul>
            <p>Please arrive 10-15 minutes early to check in. If you need to cancel, please do so at least 24 hours in advance so we can offer your spot to another volunteer.</p>
            <p>We look forward to seeing you there!</p>
            <p>Best regards,<br>The ${orgName} Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message from ${orgName}. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Registration Confirmed: ${eventTitle}\n\nYou're all set for ${eventTitle}!\n\nEvent: ${eventTitle}\nDate: ${eventDate}\nLocation: ${eventLocation}\n\nWhat to bring:\n- Water bottle\n- Comfortable clothing and shoes\n- Sunscreen and hat (if outdoors)\n- Enthusiasm and positive attitude!\n\nPlease arrive 10-15 minutes early to check in. If you need to cancel, please do so at least 24 hours in advance.\n\nWe look forward to seeing you there!\n\nBest regards,\nThe ${orgName} Team\n\n---\nThis is an automated message from ${orgName}. Please do not reply to this email.`
  }),

  /**
   * Payment receipt
   */
  receipt: (orgName, receiptId, amount, eventTitle, userName) => ({
    subject: `Payment Receipt #${receiptId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a5c3a 0%, #2d7a4f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .receipt-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #1a5c3a; }
          .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .receipt-row:last-child { border-bottom: none; font-weight: bold; font-size: 18px; color: #1a5c3a; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Receipt</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Thank you for your payment. Here's your receipt:</p>
            <div class="receipt-box">
              <div class="receipt-row">
                <span>Receipt Number:</span>
                <span>#${receiptId}</span>
              </div>
              <div class="receipt-row">
                <span>Event:</span>
                <span>${eventTitle}</span>
              </div>
              <div class="receipt-row">
                <span>Date:</span>
                <span>${new Date().toLocaleDateString()}</span>
              </div>
              <div class="receipt-row">
                <span>Amount Paid:</span>
                <span>$${amount.toFixed(2)}</span>
              </div>
            </div>
            <p>Your payment has been successfully processed. Please keep this receipt for your records.</p>
            <p>If you have any questions about this payment, please contact us.</p>
            <p>Thank you for your support!</p>
            <p>Best regards,<br>The ${orgName} Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message from ${orgName}. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Payment Receipt #${receiptId}\n\nHi ${userName},\n\nThank you for your payment. Here's your receipt:\n\nReceipt Number: #${receiptId}\nEvent: ${eventTitle}\nDate: ${new Date().toLocaleDateString()}\nAmount Paid: $${amount.toFixed(2)}\n\nYour payment has been successfully processed. Please keep this receipt for your records.\n\nIf you have any questions about this payment, please contact us.\n\nThank you for your support!\n\nBest regards,\nThe ${orgName} Team\n\n---\nThis is an automated message from ${orgName}. Please do not reply to this email.`
  }),

  /**
   * Password reset email
   */
  passwordReset: (orgName, resetToken, resetUrl) => ({
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a5c3a 0%, #2d7a4f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #1a5c3a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>We received a request to reset the password for your ${orgName} account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: white; padding: 10px; border-radius: 4px; font-size: 12px;">${resetUrl}</p>
            <div class="warning">
              <strong>Security Notice:</strong> This link will expire in 24 hours. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </div>
            <p>For security, this request was received from your account. If you didn't make this request, please change your password immediately.</p>
            <p>Best regards,<br>The ${orgName} Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message from ${orgName}. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Password Reset Request\n\nWe received a request to reset the password for your ${orgName} account.\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't request a password reset, please ignore this email or contact support if you have concerns.\n\nFor security, this request was received from your account. If you didn't make this request, please change your password immediately.\n\nBest regards,\nThe ${orgName} Team\n\n---\nThis is an automated message from ${orgName}. Please do not reply to this email.`
  }),

  /**
   * Check-out confirmation with hours logged
   */
  checkout: (orgName, userName, hours, eventTitle) => ({
    subject: `Great work! You logged ${hours} volunteer hours`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a5c3a 0%, #2d7a4f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .hours-box { background: white; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #1a5c3a; }
          .hours-number { font-size: 48px; font-weight: bold; color: #1a5c3a; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Volunteering!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Great job at <strong>${eventTitle}</strong>! Your hours have been logged:</p>
            <div class="hours-box">
              <p style="margin: 0; color: #666;">Hours Logged</p>
              <div class="hours-number">${hours} hours</div>
              <p style="margin: 0; color: #666; font-size: 14px;">Event: ${eventTitle}</p>
            </div>
            <p>Your contribution makes a real difference in our community. Keep up the amazing work!</p>
            <p>As you accumulate more hours, you'll earn achievement medals to recognize your dedication.</p>
            <p>Thank you for being an awesome volunteer!</p>
            <p>Best regards,<br>The ${orgName} Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message from ${orgName}. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Thank You for Volunteering!\n\nHi ${userName},\n\nGreat job at ${eventTitle}! Your hours have been logged:\n\nHours Logged: ${hours} hours\nEvent: ${eventTitle}\n\nYour contribution makes a real difference in our community. Keep up the amazing work!\n\nAs you accumulate more hours, you'll earn achievement medals to recognize your dedication.\n\nThank you for being an awesome volunteer!\n\nBest regards,\nThe ${orgName} Team\n\n---\nThis is an automated message from ${orgName}. Please do not reply to this email.`
  }),

  /**
   * Medal achievement notification
   */
  medal: (orgName, userName, medalName, medalIcon, totalHours) => ({
    subject: `🎉 Congratulations! You earned the ${medalName} medal!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #333; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; text-align: center; }
          .medal-display { font-size: 80px; margin: 20px 0; }
          .medal-name { font-size: 32px; font-weight: bold; color: #1a5c3a; margin: 10px 0; }
          .hours-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #ffd700; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Achievement Unlocked!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Congratulations! You've earned a new achievement medal:</p>
            <div class="medal-display">${medalIcon}</div>
            <div class="medal-name">${medalName} Medal</div>
            <div class="hours-box">
              <p style="margin: 0; color: #666;">Total Volunteer Hours</p>
              <p style="font-size: 36px; font-weight: bold; color: #1a5c3a; margin: 10px 0;">${totalHours} hours</p>
            </div>
            <p>Your dedication and commitment to volunteering is truly inspiring. You're making a real difference in our community!</p>
            <p>Keep up the great work and continue earning more achievements!</p>
            <p>Best regards,<br>The ${orgName} Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message from ${orgName}. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `🎉 Achievement Unlocked!\n\nHi ${userName},\n\nCongratulations! You've earned a new achievement medal:\n\n${medalIcon} ${medalName} Medal\n\nTotal Volunteer Hours: ${totalHours} hours\n\nYour dedication and commitment to volunteering is truly inspiring. You're making a real difference in our community!\n\nKeep up the great work and continue earning more achievements!\n\nBest regards,\nThe ${orgName} Team\n\n---\nThis is an automated message from ${orgName}. Please do not reply to this email.`
  }),

  /**
   * Test email for SMTP verification
   */
  test: (orgName) => ({
    subject: '✓ Test Email from VolunteerHub',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a5c3a 0%, #2d7a4f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Email Test Successful</h1>
          </div>
          <div class="content">
            <div class="success-box">
              <h2 style="color: #155724; margin-top: 0;">✓ SMTP Configuration Working!</h2>
              <p style="margin-bottom: 0;">Your email server is properly configured and ready to send emails.</p>
            </div>
            <div class="info-box">
              <h3>Test Details</h3>
              <p><strong>Organization:</strong> ${orgName}</p>
              <p><strong>Sent At:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Status:</strong> Delivered Successfully</p>
            </div>
            <p>Your VolunteerHub email system is now fully operational. You can start sending:</p>
            <ul>
              <li>Welcome emails to new members</li>
              <li>Event registration confirmations</li>
              <li>Payment receipts</li>
              <li>Medal achievement notifications</li>
              <li>Password reset links</li>
            </ul>
            <p>Thank you for setting up VolunteerHub!</p>
          </div>
          <div class="footer">
            <p>This is an automated test message from ${orgName}.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `✓ Email Test Successful\n\nYour email server is properly configured and ready to send emails.\n\nTest Details:\nOrganization: ${orgName}\nSent At: ${new Date().toLocaleString()}\nStatus: Delivered Successfully\n\nYour VolunteerHub email system is now fully operational. You can start sending:\n- Welcome emails to new members\n- Event registration confirmations\n- Payment receipts\n- Medal achievement notifications\n- Password reset links\n\nThank you for setting up VolunteerHub!\n\n---\nThis is an automated test message from ${orgName}.`
  })
};

export default emailTemplates;
