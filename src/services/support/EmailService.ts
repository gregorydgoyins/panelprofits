import { SUPPORT_CONFIG } from '../../config/supportConfig';
import { ZapierService } from '../integrations/ZapierService';

export class EmailService {
  private static instance: EmailService;
  private zapier: ZapierService;

  private constructor() {
    this.zapier = ZapierService.getInstance();
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async forwardToSupport(email: {
    from: string;
    subject: string;
    body: string;
    category?: string;
  }) {
    const supportEmail = this.determineForwardingAddress(email.category);
    const priority = this.determinePriority(email);

    await this.zapier.triggerWebhook('email_forward', {
      to: supportEmail,
      from: email.from,
      subject: `[${priority.toUpperCase()}] ${email.subject}`,
      body: email.body,
      metadata: {
        category: email.category || 'general',
        priority,
        received: new Date().toISOString()
      }
    });

    // Send auto-response
    await this.sendAutoResponse(email);
  }

  private determineForwardingAddress(category?: string): string {
    const addresses = SUPPORT_CONFIG.email.forwardingAddresses;
    return addresses[category as keyof typeof addresses] || addresses.general;
  }

  private determinePriority(email: { subject: string; body: string }): string {
    // Implement priority determination logic
    return 'normal';
  }

  private async sendAutoResponse(email: { from: string; category?: string }) {
    const template = this.getAutoResponseTemplate(email.category);
    
    await this.zapier.triggerWebhook('auto_response', {
      to: email.from,
      template,
      metadata: {
        category: email.category || 'general',
        sent: new Date().toISOString()
      }
    });
  }

  private getAutoResponseTemplate(category?: string) {
    const responders = SUPPORT_CONFIG.email.autoResponders;
    return responders[category as keyof typeof responders] || responders.general;
  }
}