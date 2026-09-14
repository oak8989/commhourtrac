import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { realMailer } from './mailer.js';
import { emailTemplates } from './templates.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting for email endpoints
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 emails per 15 minutes
  message: { error: 'Too many email requests, please try again later' }
});

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

/**
 * POST /api/email/configure
 * Configure SMTP settings
 */
app.post('/api/email/configure', (req, res) => {
  try {
    const { host, port, user, pass, from, fromName } = req.body;
    
    if (!host || !port) {
      return res.status(400).json({ 
        success: false, 
        error: 'Host and port are required' 
      });
    }

    const config = realMailer.configure({ host, port, user, pass, from, fromName });
    
    res.json({ 
      success: true, 
      message: 'SMTP configured successfully',
      config: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        from: config.from,
        hasCredentials: !!(config.auth.user && config.auth.pass)
      }
    });
  } catch (error) {
    console.error('Configuration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/email/verify
 * Verify SMTP connection
 */
app.post('/api/email/verify', async (req, res) => {
  try {
    const result = await realMailer.verifyConnection();
    res.json(result);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/email/send
 * Send an email
 */
app.post('/api/email/send', emailLimiter, async (req, res) => {
  try {
    const { to, subject, html, text, templateType } = req.body;

    // Validation
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject, and (html or text)' 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email address' 
      });
    }

    // Send email
    const result = await realMailer.sendEmail({ to, subject, html, text, templateType });
    
    res.json({
      success: true,
      messageId: result.messageId,
      sentAt: result.sentAt,
      accepted: result.accepted,
      rejected: result.rejected
    });
  } catch (error) {
    console.error('Send error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      sentAt: new Date().toISOString()
    });
  }
});

/**
 * POST /api/email/send-template
 * Send email using a template
 */
app.post('/api/email/send-template', emailLimiter, async (req, res) => {
  try {
    const { to, template, args } = req.body;

    if (!to || !template) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to and template' 
      });
    }

    // Get template function
    const templateFn = emailTemplates[template];
    if (!templateFn) {
      return res.status(400).json({ 
        success: false, 
        error: `Unknown template: ${template}` 
      });
    }

    // Generate email content from template
    const { subject, html, text } = templateFn(...(args || []));

    // Send email
    const result = await realMailer.sendEmail({ 
      to, 
      subject, 
      html, 
      text, 
      templateType: template 
    });
    
    res.json({
      success: true,
      messageId: result.messageId,
      template: template,
      sentAt: result.sentAt,
      accepted: result.accepted,
      rejected: result.rejected
    });
  } catch (error) {
    console.error('Template send error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      sentAt: new Date().toISOString()
    });
  }
});

/**
 * GET /api/email/health
 * Get email server health status
 */
app.get('/api/email/health', (req, res) => {
  const health = realMailer.getHealthStatus();
  res.json(health);
});

/**
 * GET /api/email/templates
 * List available email templates
 */
app.get('/api/email/templates', (req, res) => {
  const templates = Object.keys(emailTemplates).map(name => ({
    name,
    description: getTemplateDescription(name)
  }));
  
  res.json({ templates });
});

/**
 * POST /api/email/test
 * Send a test email
 */
app.post('/api/email/test', emailLimiter, async (req, res) => {
  try {
    const { to, orgName } = req.body;

    if (!to) {
      return res.status(400).json({ 
        success: false, 
        error: 'Recipient email address is required' 
      });
    }

    const { subject, html, text } = emailTemplates.test(orgName || 'VolunteerHub');
    const result = await realMailer.sendEmail({ to, subject, html, text, templateType: 'test' });
    
    res.json({
      success: true,
      messageId: result.messageId,
      message: 'Test email sent successfully',
      sentAt: result.sentAt
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/email/transport
 * Get transport configuration (for debugging)
 */
app.get('/api/email/transport', (req, res) => {
  const info = realMailer.getTransportInfo();
  
  if (!info) {
    return res.json({ configured: false });
  }
  
  res.json({ 
    configured: true,
    ...info
  });
});

// Helper function to get template descriptions
function getTemplateDescription(name) {
  const descriptions = {
    welcome: 'Welcome email for new members',
    registration: 'Event registration confirmation',
    receipt: 'Payment receipt',
    passwordReset: 'Password reset link',
    checkout: 'Volunteer check-out confirmation',
    medal: 'Medal achievement notification',
    test: 'Test email for SMTP verification'
  };
  return descriptions[name] || 'Custom email template';
}

// Serve frontend for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 VolunteerHub Email Server                            ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                          ║
║                                                           ║
║   API Endpoints:                                          ║
║   • POST /api/email/configure                             ║
║   • POST /api/email/verify                                ║
║   • POST /api/email/send                                  ║
║   • POST /api/email/send-template                         ║
║   • POST /api/email/test                                  ║
║   • GET  /api/email/health                                ║
║   • GET  /api/email/templates                             ║
║   • GET  /api/email/transport                             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Auto-configure from environment variables if available
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('📧 Auto-configuring SMTP from environment variables...');
    realMailer.configure({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || 'noreply@example.com',
      fromName: process.env.SMTP_FROM_NAME || 'VolunteerHub'
    });
  }
});

export default app;
