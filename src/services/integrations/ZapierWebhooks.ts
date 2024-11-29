import { ZAPIER_CONFIG } from '../../config/zapierConfig';

export class ZapierWebhooks {
  private static instance: ZapierWebhooks;
  private webhooks: {
    storyPublished: string;
    communityMilestone: string;
    contentAutomation: string;
  };

  private constructor() {
    this.webhooks = {
      storyPublished: import.meta.env.VITE_ZAPIER_WEBHOOK_STORY_PUBLISHED,
      communityMilestone: import.meta.env.VITE_ZAPIER_WEBHOOK_COMMUNITY_MILESTONE,
      contentAutomation: import.meta.env.VITE_ZAPIER_WEBHOOK_CONTENT_AUTOMATION
    };
  }

  static getInstance(): ZapierWebhooks {
    if (!ZapierWebhooks.instance) {
      ZapierWebhooks.instance = new ZapierWebhooks();
    }
    return ZapierWebhooks.instance;
  }

  async triggerStoryPublished(story: {
    title: string;
    author: string;
    genre: string;
    wordCount: number;
    url: string;
  }) {
    return this.triggerWebhook('storyPublished', {
      ...story,
      timestamp: new Date().toISOString(),
      platform: ZAPIER_CONFIG.app.slug,
      eventType: 'story_published'
    });
  }

  async triggerCommunityMilestone(milestone: {
    userId: string;
    type: string;
    achievement: string;
    level: string;
  }) {
    return this.triggerWebhook('communityMilestone', {
      ...milestone,
      timestamp: new Date().toISOString(),
      platform: ZAPIER_CONFIG.app.slug,
      eventType: 'community_milestone'
    });
  }

  async triggerContentAutomation(content: {
    type: string;
    title: string;
    scheduledDate: string;
    platforms: string[];
  }) {
    return this.triggerWebhook('contentAutomation', {
      ...content,
      timestamp: new Date().toISOString(),
      platform: ZAPIER_CONFIG.app.slug,
      eventType: 'content_automation'
    });
  }

  private async triggerWebhook(type: keyof typeof this.webhooks, data: any) {
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
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Webhook trigger failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to trigger ${type} webhook:`, error);
      throw error;
    }
  }
}