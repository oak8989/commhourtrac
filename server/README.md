# VolunteerHub Email Server - Real SMTP Implementation

This is a production-ready email server for VolunteerHub that uses real SMTP delivery via Nodemailer.

## 🚀 Features

- **Real SMTP Delivery**: Sends actual emails via SMTP servers (Gmail, Outlook, SendGrid, etc.)
- **Template System**: Pre-built HTML email templates for all notification types
- **REST API**: Full-featured API for email configuration, sending, and health checks
- **Rate Limiting**: Built-in protection against email spam
- **Health Monitoring**: Real-time SMTP connection verification
- **Docker Support**: Ready for containerized deployment
- **Production Ready**: Includes error handling, logging, and security features

## 📦 Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React/Vite)  │
└────────┬────────┘
         │ HTTP/REST API
         ▼
┌─────────────────┐
│  Email Server   │
│  (Express.js)   │
└────────┬────────┘
         │ SMTP Protocol
         ▼
┌─────────────────┐
│  SMTP Provider  │
│ (Gmail/SendGrid)│
└─────────────────┘
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and configure your SMTP settings:

```bash
cp .env.example .env
```

Edit `.env` with your SMTP credentials:

```env
# Gmail Example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
SMTP_FROM_NAME=VolunteerHub
```

**Important for Gmail:**
- Enable 2-factor authentication on your Google account
- Generate an App Password: https://myaccount.google.com/apppasswords
- Use the App Password (not your regular password) in `SMTP_PASS`

### 3. Start the Email Server

**Development:**
```bash
cd server
npm run dev
```

**Production:**
```bash
cd server
npm start
```

The server will start on `http://localhost:3001`

### 4. Configure Frontend

Update the frontend to point to your email server. In your frontend environment:

```env
VITE_EMAIL_API_URL=http://localhost:3001
```

Or configure it dynamically in the Admin Settings panel.

## 🐳 Docker Deployment

### Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Build Docker Image Manually

```bash
# Build the image
docker build -t volunteerhub-email-server .

# Run the container
docker run -d \
  -p 3001:3001 \
  -e SMTP_HOST=smtp.gmail.com \
  -e SMTP_PORT=587 \
  -e SMTP_USER=your-email@gmail.com \
  -e SMTP_PASS=your-app-password \
  -e SMTP_FROM=noreply@yourdomain.com \
  --name volunteerhub-email \
  volunteerhub-email-server
```

## 📡 API Endpoints

### Email Configuration

**POST /api/email/configure**
```bash
curl -X POST http://localhost:3001/api/email/configure \
  -H "Content-Type: application/json" \
  -d '{
    "host": "smtp.gmail.com",
    "port": 587,
    "user": "your-email@gmail.com",
    "pass": "your-app-password",
    "from": "noreply@yourdomain.com",
    "fromName": "VolunteerHub"
  }'
```

### Send Email

**POST /api/email/send**
```bash
curl -X POST http://localhost:3001/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello</h1><p>This is a test email</p>",
    "text": "Hello\n\nThis is a test email",
    "templateType": "general"
  }'
```

### Send Template Email

**POST /api/email/send-template**
```bash
curl -X POST http://localhost:3001/api/email/send-template \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "template": "welcome",
    "args": ["VolunteerHub", "John Doe"]
  }'
```

### Health Check

**GET /api/email/health**
```bash
curl http://localhost:3001/api/email/health
```

### Verify SMTP Connection

**POST /api/email/verify**
```bash
curl -X POST http://localhost:3001/api/email/verify
```

### Send Test Email

**POST /api/email/test**
```bash
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@gmail.com",
    "orgName": "VolunteerHub"
  }'
```

## 📧 Email Templates

Available templates:

1. **welcome** - Welcome email for new members
   - Args: `[orgName, userName]`

2. **registration** - Event registration confirmation
   - Args: `[orgName, eventTitle, eventDate, eventLocation]`

3. **receipt** - Payment receipt
   - Args: `[orgName, receiptId, amount, eventTitle, userName]`

4. **passwordReset** - Password reset link
   - Args: `[orgName, resetToken, resetUrl]`

5. **checkout** - Volunteer check-out confirmation
   - Args: `[orgName, userName, hours, eventTitle]`

6. **medal** - Medal achievement notification
   - Args: `[orgName, userName, medalName, medalIcon, totalHours]`

7. **test** - Test email for SMTP verification
   - Args: `[orgName]`

## 🔒 Security Features

- **Rate Limiting**: 50 emails per 15 minutes per IP
- **CORS Protection**: Configurable cross-origin restrictions
- **Input Validation**: Email format validation
- **Error Handling**: Secure error messages (no sensitive data leakage)
- **Environment Variables**: Credentials stored securely in env vars
- **HTTPS Ready**: Configure for production with SSL/TLS

## 📊 Monitoring & Logging

The server provides comprehensive logging:

```
✓ SMTP configured: smtp.gmail.com:587
✓ SMTP connection verified
✓ Email sent to user@example.com: <message-id>
✗ Failed to send email to user@example.com: Authentication failed
```

Check health status via API:
```bash
curl http://localhost:3001/api/email/health
```

## 🧪 Testing

### Test with MailHog (Local SMTP Server)

For development testing without sending real emails:

```bash
# Start MailHog
docker-compose --profile testing up -d

# Configure to use MailHog
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
```

Access MailHog web UI: http://localhost:8025

### Test with Real SMTP

1. Configure your SMTP credentials in `.env`
2. Start the server: `npm run dev`
3. Send a test email:
```bash
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@gmail.com", "orgName": "Test"}'
```
4. Check your inbox!

## 🌐 SMTP Provider Configuration

### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

## 🚨 Troubleshooting

### Authentication Failed
- Verify username and password
- For Gmail, ensure you're using an App Password (not regular password)
- Check that 2FA is enabled for Gmail

### Connection Timeout
- Verify SMTP host and port
- Check firewall settings
- Try different port (587 for TLS, 465 for SSL)

### Emails Not Sending
- Check server logs for errors
- Verify SMTP configuration via `/api/email/verify`
- Ensure rate limits haven't been exceeded

### CORS Errors
- Update CORS configuration in `server/index.js`
- Add your frontend domain to allowed origins

## 📈 Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=3001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
SMTP_FROM_NAME=VolunteerHub
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=50
```

### Process Management (PM2)
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server/index.js --name volunteerhub-email

# Monitor
pm2 monit

# View logs
pm2 logs volunteerhub-email
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name email.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📝 License

MIT

## 🤝 Support

For issues and questions:
- Check the troubleshooting section
- Review server logs
- Test SMTP connection via API
- Verify environment variables

---

**Built with Node.js, Express, and Nodemailer**
