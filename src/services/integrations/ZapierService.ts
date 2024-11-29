import { ZAPIER_CONFIG } from '../../config/zapierConfig';

export class ZapierService {
  private static instance: ZapierService;
  private webhooks: {
    storyPublished: string;
    communityMilestone: string;
    contentAutomation: string;
  };

  private constructor() {
    this.webhooks = {
      storyPublished: import.meta.env.VITE_ZAPIER_WEBHOOK_STORY_PUBLISHED || '',
      communityMilestone: import.meta.env.VITE_ZAPIER_WEBHOOK_COMMUNITY_MILESTONE || '',
      contentAutomation: import.meta.env.VITE_ZAPIER_WEBHOOK_CONTENT_AUTOMATION || ''
    };
  }

  static getInstance(): ZapierService {
    if (!ZapierService.instance) {
      ZapierService.instance = new ZapierService();
    }
    return ZapierService.instance;
  }

  async triggerStoryPublished(data: {
    title: string;
    author: string;
    genre: string;
    wordCount: number;
    url: string;
  }) {
    return this.triggerWebhook('storyPublished', {
      ...data,
      eventType: 'story_published',
      platform: 'WritersRoom'
    });
  }

  async triggerCommunityMilestone(data: {
    userId: string;
    milestoneType: string;
    achievement: string;
    level: string;
  }) {
    return this.triggerWebhook('communityMilestone', {
      ...data,
      eventType: 'community_milestone',
      platform: 'WritersRoom'
    });
  }

  async triggerContentAutomation(data: {
    contentType: string;
    title: string;
    scheduledDate: string;
    platforms: string[];
  }) {
    return this.triggerWebhook('contentAutomation', {
      ...data,
      eventType: 'content_automation',
      platform: 'WritersRoom'
    });
  }

  private async triggerWebhook(type: 'storyPublished' | 'communityMilestone' | 'contentAutomation', data: any) {
    const webhookUrl = this.webhooks[type];
    if (!webhookUrl) {
      throw new Error(`No webhook URL configured for type: ${type}`);
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          source: ZAPIER_CONFIG.app.slug,
          version: ZAPIER_CONFIG.app.version
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook trigger failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Webhook trigger failed:', error);
      throw error;
    }
  }
}