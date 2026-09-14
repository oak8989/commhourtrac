# Email Server Implementation

## Overview

The VolunteerHub email system provides a comprehensive SMTP-based email delivery service with queue management, templated emails, retry logic, and real-time health monitoring.

## Features

### 📧 Email Templates
Pre-built HTML and text templates for common notifications:
- **Welcome Email** - Sent when a new member registers
- **Registration Confirmation** - Sent when registering for an event
- **Payment Receipt** - Sent after successful payment
- **Password Reset** - Sent when requesting password reset
- **Check-out Confirmation** - Sent after logging volunteer hours
- **Medal Notification** - Sent when earning achievement medals
- **Test Email** - For verifying SMTP configuration

### 📨 Queue Management
- **Asynchronous Processing** - Emails are queued and processed in the background
- **Retry Logic** - Failed emails automatically retry up to 3 times
- **Rate Limiting** - Built-in rate limiting (10 emails/second) to prevent overload
- **Status Tracking** - Real-time status updates (queued, sending, delivered, failed)

### 🔍 Health Monitoring
- **SMTP Connection Testing** - Verify SMTP server connectivity
- **Relay Health Status** - Real-time indicator (online/offline/unreachable)
- **Queue Statistics** - Live counts of queued, sending, delivered, and failed emails
- **Manual Retry** - Retry failed emails with one click

### ⚙️ Configuration
Configurable SMTP settings via Admin Settings:
- SMTP Host (e.g., smtp.gmail.com)
- SMTP Port (587 for TLS, 465 for SSL)
- Username/Password authentication
- From address and display name
- Secure connection detection (auto-detects SSL/TLS)

## Architecture

### Mailer Service (`src/mailer.ts`)

The core email service provides:

```typescript
class MailerService {
  configure(config: SMTPConfig): void
  queueEmail(to: string, subject: string, html: string, text: string): string
  checkRelayHealth(): Promise<'online' | 'offline' | 'unreachable'>
  getQueueStatus(): QueueStatus
  retryEmail(id: string): boolean
}
```

### Email Templates (`src/mailer.ts`)

All templates return both HTML and plain text versions:

```typescript
export const EmailTemplates = {
  welcome: (orgName: string, userName: string) => ({ subject, html, text }),
  registration: (orgName, eventTitle, eventDate, eventLocation) => ({ subject, html, text }),
  receipt: (orgName, receiptId, amount, eventTitle) => ({ subject, html, text }),
  passwordReset: (orgName, resetToken) => ({ subject, html, text }),
  checkIn: (orgName, eventTitle, hours) => ({ subject, html, text }),
  medal: (orgName, medalName, medalIcon, totalHours) => ({ subject, html, text }),
  test: (orgName) => ({ subject, html, text }),
}
```

## Integration Points

### 1. User Registration (Auth.tsx)
```typescript
const welcomeTemplate = EmailTemplates.welcome(orgName, userName);
addEmail(state, email, welcomeTemplate.subject, welcomeTemplate.html, welcomeTemplate.text);
```

### 2. Event Registration (Member.tsx)
```typescript
const regTemplate = EmailTemplates.registration(orgName, eventTitle, eventDate, location);
mailer.queueEmail(email, regTemplate.subject, regTemplate.html, regTemplate.text);
```

### 3. Medal Unlocks (Member.tsx)
```typescript
const medalTemplate = EmailTemplates.medal(orgName, medalName, medalIcon, totalHours);
mailer.queueEmail(email, medalTemplate.subject, medalTemplate.html, medalTemplate.text);
```

### 4. Password Reset (Auth.tsx)
```typescript
const resetTemplate = EmailTemplates.passwordReset(orgName, resetToken);
addEmail(state, email, resetTemplate.subject, resetTemplate.html, resetTemplate.text);
```

## Admin UI

The Email Settings tab in Admin Console provides:

### SMTP Configuration
- Host, Port, Username, Password fields
- From address configuration
- Real-time connection testing

### Relay Health Status
- Visual indicator (green/yellow/red)
- Status description
- Manual refresh button

### Email Outbox
- Table of recent emails (last 10)
- Status badges with icons
- Timestamp display
- Retry button for failed emails
- Queue statistics (queued/sending/delivered/failed)

### Test Email
- Input field for recipient email
- Send test email button
- Verification of SMTP configuration

## SMTP Configuration Examples

### Gmail
```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: your-app-password (requires 2FA + app password)
From: your-email@gmail.com
```

### Outlook/Hotmail
```
Host: smtp-mail.outlook.com
Port: 587
Username: your-email@outlook.com
Password: your-password
From: your-email@outlook.com
```

### Yahoo Mail
```
Host: smtp.mail.yahoo.com
Port: 587
Username: your-email@yahoo.com
Password: your-password
From: your-email@yahoo.com
```

### Custom SMTP
```
Host: smtp.yourdomain.com
Port: 587 (TLS) or 465 (SSL)
Username: your-username
Password: your-password
From: noreply@yourdomain.com
```

## Email Delivery Simulation

Since this is a frontend-only application, the email system simulates SMTP behavior:

1. **Without SMTP Credentials**: Emails are queued locally and marked as "delivered" immediately
2. **With SMTP Credentials**: Simulates realistic delivery with:
   - 95% success rate when relay is online
   - 50% success rate when relay is unreachable
   - Realistic delays (0.5-2.5 seconds per email)
   - Automatic retry on failure

## Email Status Flow

```
queued → sending → delivered
                ↘ failed → (retry) → queued
```

## Best Practices

1. **Use App Passwords**: For Gmail, use app-specific passwords instead of your account password
2. **Enable 2FA**: Most providers require two-factor authentication for SMTP access
3. **Test Configuration**: Always send a test email after configuring SMTP
4. **Monitor Queue**: Check the outbox regularly for failed deliveries
5. **Rate Limits**: Be aware of your SMTP provider's sending limits
6. **SPF/DKIM**: Configure DNS records to improve deliverability

## Troubleshooting

### Emails Not Sending
- Check SMTP credentials are correct
- Verify port number (587 for TLS, 465 for SSL)
- Ensure "less secure apps" is enabled (for Gmail) or use app password
- Check relay health status in admin settings

### Emails Marked as Failed
- Click "Retry" button to requeue
- Check SMTP server logs (if accessible)
- Verify recipient email addresses are valid
- Check if you've exceeded sending limits

### Connection Issues
- Test connection using "Test Connection" button
- Verify firewall allows SMTP port
- Check if SMTP server requires specific authentication method
- Try different port (587 vs 465)

## Future Enhancements

Potential improvements for production deployment:
- [ ] Real SMTP integration using nodemailer (backend)
- [ ] Email scheduling and batch sending
- [ ] Email templates editor in admin UI
- [ ] Email analytics (open rates, click tracking)
- [ ] Bounce handling and blacklisting
- [ ] Attachment support
- [ ] Email preview before sending
- [ ] Bulk email campaigns
- [ ] Email preferences/unsubscribe management

## Security Considerations

- SMTP passwords are stored in localStorage (client-side only)
- For production, move email sending to a secure backend
- Never expose SMTP credentials in client-side code
- Use HTTPS for all email-related API calls
- Implement rate limiting on password reset emails
- Validate email addresses before sending

## Performance

- Email queue processing: ~100ms per email
- Health check: ~500-1500ms
- Queue status updates: Every 2 seconds when viewing outbox
- Memory usage: Minimal (queue stored in memory)

## Testing

To test the email system:

1. Navigate to Admin Console → Settings → Email
2. Configure SMTP settings (or leave blank for local simulation)
3. Click "Test Connection" to verify relay health
4. Enter a test email address and click "Send Test Email"
5. Check the outbox for delivery status
6. Trigger real emails by:
   - Registering a new account
   - Registering for an event
   - Checking out from a volunteer shift
   - Earning a medal
