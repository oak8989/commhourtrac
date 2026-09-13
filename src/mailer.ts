import { v4 as uuidv4 } from 'uuid';
import { EmailMessage, AppState } from './types';

// Email Templates
export const EmailTemplates = {
  welcome: (orgName: string, userName: string) => ({
    subject: `Welcome to ${orgName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a5c3a;">Welcome, ${userName}!</h1>
        <p>Thank you for joining <strong>${orgName}</strong>. We're excited to have you as part of our volunteer community.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse and register for upcoming events</li>
          <li>Track your volunteer hours</li>
          <li>Earn achievement medals</li>
          <li>Connect with fellow volunteers</li>
        </ul>
        <p>Get started by exploring our upcoming events and finding opportunities that match your interests.</p>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This is an automated message from ${orgName}.
        </p>
      </div>
    `,
    text: `Welcome to ${orgName}!\n\nThank you for joining our volunteer community, ${userName}. You can now browse events, track hours, and earn medals.`
  }),

  registration: (orgName: string, eventTitle: string, eventDate: string, eventLocation: string) => ({
    subject: `Registration Confirmed: ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a5c3a;">Registration Confirmed</h1>
        <p>You're registered for <strong>${eventTitle}</strong>!</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Location:</strong> ${eventLocation}</p>
        </div>
        <p>Please arrive 10 minutes early. If you need to cancel, please do so at least 24 hours in advance.</p>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This is an automated message from ${orgName}.
        </p>
      </div>
    `,
    text: `Registration Confirmed: ${eventTitle}\n\nDate: ${eventDate}\nLocation: ${eventLocation}\n\nPlease arrive 10 minutes early.`
  }),

  receipt: (orgName: string, receiptId: string, amount: number, eventTitle: string) => ({
    subject: `Payment Receipt - ${receiptId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a5c3a;">Payment Receipt</h1>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Receipt ID:</strong> ${receiptId}</p>
          <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          <p><strong>Event:</strong> ${eventTitle}</p>
          <p><strong>Organization:</strong> ${orgName}</p>
        </div>
        <p>Thank you for your payment. This receipt serves as confirmation of your transaction.</p>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This is an automated message from ${orgName}.
        </p>
      </div>
    `,
    text: `Payment Receipt\n\nReceipt ID: ${receiptId}\nAmount: $${amount.toFixed(2)}\nEvent: ${eventTitle}\nOrganization: ${orgName}`
  }),

  passwordReset: (orgName: string, resetToken: string, resetUrl?: string) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a5c3a;">Password Reset</h1>
        <p>We received a request to reset your password for your ${orgName} account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl || '#'}" style="background: #1a5c3a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Reset token: <code>${resetToken}</code>
        </p>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this, please ignore this email. Your password will remain unchanged.
        </p>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This link will expire in 24 hours.
        </p>
      </div>
    `,
    text: `Password Reset\n\nReset token: ${resetToken}\n\nIf you didn't request this, please ignore this email.`
  }),

  checkIn: (orgName: string, eventTitle: string, hours: number) => ({
    subject: `Check-out Confirmation - ${hours} hours logged`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a5c3a;">Great Work!</h1>
        <p>You've successfully checked out from <strong>${eventTitle}</strong>.</p>
        <div style="background: #f0f9f4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="font-size: 36px; font-weight: bold; color: #1a5c3a; margin: 0;">${hours}h</p>
          <p style="color: #666; margin: 5px 0 0 0;">hours logged</p>
        </div>
        <p>Thank you for your contribution to ${orgName}!</p>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This is an automated message from ${orgName}.
        </p>
      </div>
    `,
    text: `Check-out Confirmation\n\nYou've logged ${hours} hours for ${eventTitle}.\n\nThank you for your contribution!`
  }),

  medal: (orgName: string, medalName: string, medalIcon: string, totalHours: number) => ({
    subject: `Congratulations! You earned the ${medalName} medal ${medalIcon}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <div style="font-size: 80px; margin: 20px 0;">${medalIcon}</div>
        <h1 style="color: #1a5c3a;">Congratulations!</h1>
        <p style="font-size: 24px; margin: 20px 0;">You've earned the <strong>${medalName}</strong> medal!</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 36px; font-weight: bold; color: #1a5c3a; margin: 0;">${totalHours}h</p>
          <p style="color: #666; margin: 5px 0 0 0;">total volunteer hours</p>
        </div>
        <p>Thank you for your dedication to ${orgName}. Your commitment makes a real difference in our community!</p>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This is an automated message from ${orgName}.
        </p>
      </div>
    `,
    text: `Congratulations!\n\nYou've earned the ${medalName} medal ${medalIcon}\n\nTotal volunteer hours: ${totalHours}h\n\nThank you for your dedication!`
  }),

  test: (orgName: string) => ({
    subject: 'Test Email from VolunteerHub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a5c3a;">Test Email</h1>
        <p>This is a test email from <strong>${orgName}</strong>'s VolunteerHub instance.</p>
        <p>If you received this email, your SMTP configuration is working correctly!</p>
        <div style="background: #f0f9f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #1a5c3a; font-weight: bold;">✓ Email delivery successful</p>
        </div>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          Sent at: ${new Date().toLocaleString()}
        </p>
      </div>
    `,
    text: `Test Email\n\nThis is a test email from ${orgName}'s VolunteerHub instance.\n\nIf you received this email, your SMTP configuration is working correctly!`
  })
};

// SMTP Configuration
export interface SMTPConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  fromName?: string;
  secure: boolean;
}

// Email Queue Item
interface EmailQueueItem {
  id: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  status: 'queued' | 'sending' | 'delivered' | 'failed';
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  sentAt?: string;
  error?: string;
  templateType?: string;
}

// Mailer Service
class MailerService {
  private queue: EmailQueueItem[] = [];
  private isProcessing: boolean = false;
  private config: SMTPConfig | null = null;
  private relayHealth: 'online' | 'offline' | 'unreachable' = 'offline';

  constructor() {
    // Simulate SMTP connection check
    this.checkRelayHealth();
  }

  // Configure SMTP
  configure(config: Partial<SMTPConfig>) {
    this.config = {
      host: config.host || 'smtp.gmail.com',
      port: config.port || 587,
      user: config.user || '',
      pass: config.pass || '',
      from: config.from || 'noreply@example.com',
      fromName: config.fromName || 'VolunteerHub',
      secure: config.secure ?? (config.port === 465),
    };
    
    // Simulate connection test
    this.checkRelayHealth();
  }

  // Check relay health (simulated)
  async checkRelayHealth(): Promise<'online' | 'offline' | 'unreachable'> {
    if (!this.config || !this.config.host) {
      this.relayHealth = 'offline';
      return 'offline';
    }

    // Simulate SMTP connection test with realistic delays
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 90% success rate when configured
        const hasCredentials = this.config?.user && this.config?.pass;
        if (hasCredentials) {
          const success = Math.random() > 0.1;
          this.relayHealth = success ? 'online' : 'unreachable';
        } else {
          this.relayHealth = 'offline';
        }
        resolve(this.relayHealth);
      }, 500 + Math.random() * 1000);
    });
  }

  getRelayHealth() {
    return this.relayHealth;
  }

  // Queue email for sending
  queueEmail(to: string, subject: string, html: string, text: string, templateType?: string): string {
    const id = uuidv4();
    const item: EmailQueueItem = {
      id,
      to,
      subject,
      html,
      text,
      status: 'queued',
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      templateType,
    };

    this.queue.push(item);
    this.processQueue();
    return id;
  }

  // Process email queue
  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];
      if (item.status === 'queued' || item.status === 'failed') {
        await this.sendEmail(item);
      }
      this.queue.shift();
      
      // Simulate rate limiting (max 10 emails per second)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  // Send email (simulated SMTP)
  private async sendEmail(item: EmailQueueItem): Promise<boolean> {
    item.status = 'sending';
    item.attempts++;

    // Simulate SMTP delivery with realistic behavior
    return new Promise((resolve) => {
      const delay = 500 + Math.random() * 2000; // 0.5-2.5 seconds
      
      setTimeout(() => {
        // Simulate delivery success/failure
        const hasCredentials = this.config?.user && this.config?.pass;
        
        if (!hasCredentials) {
          // No credentials = simulate local delivery (always succeeds)
          item.status = 'delivered';
          item.sentAt = new Date().toISOString();
          resolve(true);
          return;
        }

        // With credentials = simulate SMTP delivery
        const successRate = this.relayHealth === 'online' ? 0.95 : 0.5;
        const success = Math.random() < successRate;

        if (success) {
          item.status = 'delivered';
          item.sentAt = new Date().toISOString();
          resolve(true);
        } else {
          item.status = 'failed';
          item.error = item.attempts >= item.maxAttempts 
            ? 'Max retry attempts reached' 
            : 'SMTP delivery failed';
          
          // Re-queue if attempts remaining
          if (item.attempts < item.maxAttempts) {
            this.queue.push(item);
          }
          
          resolve(false);
        }
      }, delay);
    });
  }

  // Get queue status
  getQueueStatus() {
    return {
      total: this.queue.length,
      queued: this.queue.filter(i => i.status === 'queued').length,
      sending: this.queue.filter(i => i.status === 'sending').length,
      delivered: this.queue.filter(i => i.status === 'delivered').length,
      failed: this.queue.filter(i => i.status === 'failed').length,
    };
  }

  // Get queue items
  getQueue() {
    return [...this.queue];
  }

  // Retry failed email
  retryEmail(id: string) {
    const item = this.queue.find(i => i.id === id);
    if (item && item.status === 'failed') {
      item.status = 'queued';
      item.attempts = 0;
      item.error = undefined;
      this.processQueue();
      return true;
    }
    return false;
  }

  // Clear queue
  clearQueue() {
    this.queue = [];
  }
}

// Global mailer instance
export const mailer = new MailerService();

// Helper function to send templated emails
export function sendTemplatedEmail(
  to: string,
  template: keyof typeof EmailTemplates,
  ...args: any[]
): string {
  const templateFn = EmailTemplates[template];
  if (!templateFn) {
    throw new Error(`Unknown email template: ${template}`);
  }

  const { subject, html, text } = (templateFn as any)(...args);
  return mailer.queueEmail(to, subject, html, text, template);
}

// Helper to send welcome email
export function sendWelcomeEmail(to: string, orgName: string, userName: string) {
  return sendTemplatedEmail(to, 'welcome', orgName, userName);
}

// Helper to send registration confirmation
export function sendRegistrationEmail(
  to: string,
  orgName: string,
  eventTitle: string,
  eventDate: string,
  eventLocation: string
) {
  return sendTemplatedEmail(to, 'registration', orgName, eventTitle, eventDate, eventLocation);
}

// Helper to send payment receipt
export function sendReceiptEmail(
  to: string,
  orgName: string,
  receiptId: string,
  amount: number,
  eventTitle: string
) {
  return sendTemplatedEmail(to, 'receipt', orgName, receiptId, amount, eventTitle);
}

// Helper to send password reset
export function sendPasswordResetEmail(to: string, orgName: string, resetToken: string) {
  return sendTemplatedEmail(to, 'passwordReset', orgName, resetToken);
}

// Helper to send check-out confirmation
export function sendCheckOutEmail(to: string, orgName: string, eventTitle: string, hours: number) {
  return sendTemplatedEmail(to, 'checkIn', orgName, eventTitle, hours);
}

// Helper to send medal notification
export function sendMedalEmail(
  to: string,
  orgName: string,
  medalName: string,
  medalIcon: string,
  totalHours: number
) {
  return sendTemplatedEmail(to, 'medal', orgName, medalName, medalIcon, totalHours);
}

// Helper to send test email
export function sendTestEmail(to: string, orgName: string) {
  return sendTemplatedEmail(to, 'test', orgName);
}

// Convert EmailQueueItem to EmailMessage for state
export function queueItemToEmailMessage(item: EmailQueueItem): EmailMessage {
  return {
    id: item.id,
    to: item.to,
    subject: item.subject,
    status: item.status === 'delivered' ? 'delivered' : item.status === 'failed' ? 'failed' : 'queued',
    createdAt: item.createdAt,
  };
}
