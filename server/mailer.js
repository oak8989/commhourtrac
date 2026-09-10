import nodemailer from 'nodemailer';

/**
 * Real SMTP Mailer using Nodemailer
 * Handles actual email delivery via SMTP protocol
 */
class RealMailer {
  constructor() {
    this.transporter = null;
    this.config = null;
    this.lastHealthCheck = null;
    this.healthStatus = 'unconfigured';
  }

  /**
   * Configure SMTP transport with real credentials
   */
  configure(config) {
    this.config = {
      host: config.host || process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(config.port || process.env.SMTP_PORT || '587'),
      secure: config.port === 465 || process.env.SMTP_PORT === '465',
      auth: {
        user: config.user || process.env.SMTP_USER || '',
        pass: config.pass || process.env.SMTP_PASS || ''
      },
      from: config.from || process.env.SMTP_FROM || 'noreply@example.com',
      fromName: config.fromName || process.env.SMTP_FROM_NAME || 'VolunteerHub'
    };

    // Create real SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: this.config.auth.user ? this.config.auth : undefined,
      // TLS options for better compatibility
      tls: {
        rejectUnauthorized: false, // Allow self-signed certs in dev
        ciphers: 'SSLv3'
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    console.log(`✓ SMTP configured: ${this.config.host}:${this.config.port}`);
    return this.config;
  }

  /**
   * Verify SMTP connection with real server
   */
  async verifyConnection() {
    if (!this.transporter) {
      this.healthStatus = 'unconfigured';
      return { success: false, status: 'unconfigured', message: 'SMTP not configured' };
    }

    try {
      await this.transporter.verify();
      this.healthStatus = 'online';
      this.lastHealthCheck = new Date().toISOString();
      console.log('✓ SMTP connection verified');
      return { 
        success: true, 
        status: 'online', 
        message: 'SMTP server is reachable and accepting connections',
        checkedAt: this.lastHealthCheck
      };
    } catch (error) {
      this.healthStatus = 'offline';
      this.lastHealthCheck = new Date().toISOString();
      console.error('✗ SMTP connection failed:', error.message);
      return { 
        success: false, 
        status: 'offline', 
        message: error.message,
        checkedAt: this.lastHealthCheck
      };
    }
  }

  /**
   * Send real email via SMTP
   */
  async sendEmail({ to, subject, html, text, templateType }) {
    if (!this.transporter) {
      throw new Error('SMTP not configured. Please configure SMTP settings first.');
    }

    if (!this.config.auth.user || !this.config.auth.pass) {
      throw new Error('SMTP credentials missing. Please provide username and password.');
    }

    const mailOptions = {
      from: `"${this.config.fromName}" <${this.config.from}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback to plain text
      // Email headers for better deliverability
      headers: {
        'X-Mailer': 'VolunteerHub Email Server',
        'X-Priority': '1',
        'X-Template-Type': templateType || 'general',
        'List-Unsubscribe': `<mailto:${this.config.from}?subject=unsubscribe>`
      }
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✓ Email sent to ${to}: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected,
        sentAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`✗ Failed to send email to ${to}:`, error.message);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus() {
    return {
      status: this.healthStatus,
      config: this.config ? {
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        from: this.config.from,
        hasCredentials: !!(this.config.auth.user && this.config.auth.pass)
      } : null,
      lastHealthCheck: this.lastHealthCheck
    };
  }

  /**
   * Get transport info for debugging
   */
  getTransportInfo() {
    if (!this.transporter) return null;
    
    return {
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      authenticated: !!(this.config.auth.user && this.config.auth.pass)
    };
  }
}

// Export singleton instance
export const realMailer = new RealMailer();
export default realMailer;
