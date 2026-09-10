/**
 * Email API Client
 * Communicates with the real email server backend
 */

const API_BASE_URL = (import.meta as any).env?.VITE_EMAIL_API_URL || 'http://localhost:3001';

export interface EmailConfig {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  from?: string;
  fromName?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  sentAt?: string;
  error?: string;
  accepted?: string[];
  rejected?: string[];
}

export interface HealthStatus {
  status: 'online' | 'offline' | 'unconfigured';
  config?: {
    host: string;
    port: number;
    secure: boolean;
    from: string;
    hasCredentials: boolean;
  };
  lastHealthCheck?: string;
}

class EmailAPI {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_BASE_URL;
  }

  /**
   * Configure SMTP settings on the server
   */
  async configure(config: EmailConfig): Promise<{ success: boolean; config?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/email/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Configure error:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Verify SMTP connection
   */
  async verify(): Promise<HealthStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/email/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Verify error:', error);
      return { status: 'offline' };
    }
  }

  /**
   * Send an email
   */
  async send(to: string, subject: string, html: string, text?: string, templateType?: string): Promise<EmailResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html, text, templateType })
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Send error:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Send email using a template
   */
  async sendTemplate(to: string, template: string, args: any[]): Promise<EmailResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/email/send-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, template, args })
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Send template error:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Send a test email
   */
  async sendTest(to: string, orgName: string): Promise<EmailResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/email/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, orgName })
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Test error:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * Get health status
   */
  async getHealth(): Promise<HealthStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/email/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Health check error:', error);
      return { status: 'offline' };
    }
  }

  /**
   * Get available templates
   */
  async getTemplates(): Promise<{ templates: Array<{ name: string; description: string }> }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/email/templates`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get templates error:', error);
      return { templates: [] };
    }
  }

  /**
   * Get transport info
   */
  async getTransport(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/email/transport`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get transport error:', error);
      return { configured: false };
    }
  }
}

// Export singleton instance
export const emailAPI = new EmailAPI();
export default emailAPI;
