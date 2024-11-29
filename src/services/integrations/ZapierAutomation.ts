import { ZapierWebhooks } from './ZapierWebhooks';
import { ZAPIER_WORKFLOWS } from '../../config/zapierWorkflows';

export class ZapierAutomation {
  private static instance: ZapierAutomation;
  private webhooks: ZapierWebhooks;

  private constructor() {
    this.webhooks = ZapierWebhooks.getInstance();
  }

  static getInstance(): ZapierAutomation {
    if (!ZapierAutomation.instance) {
      ZapierAutomation.instance = new ZapierAutomation();
    }
    return ZapierAutomation.instance;
  }

  async handleStoryPublication(story: any) {
    try {
      // Trigger the story publication workflow
      await this.webhooks.triggerStoryPublished({
        title: story.title,
        author: story.author,
        genre: story.genre,
        wordCount: story.wordCount,
        url: `https://thewritersroom.app/stories/${story.slug}`
      });

      // Log successful automation
      console.log('Story publication workflow triggered successfully');
    } catch (error) {
      console.error('Failed to trigger story publication workflow:', error);
      throw error;
    }
  }

  async handleCommunityMilestone(milestone: any) {
    try {
      // Trigger the community milestone workflow
      await this.webhooks.triggerCommunityMilestone({
        userId: milestone.userId,
        type: milestone.type,
        achievement: milestone.achievement,
        level: milestone.level
      });

      // Log successful automation
      console.log('Community milestone workflow triggered successfully');
    } catch (error) {
      console.error('Failed to trigger community milestone workflow:', error);
      throw error;
    }
  }

  async scheduleContent(content: any) {
    try {
      // Trigger the content automation workflow
      await this.webhooks.triggerContentAutomation({
        type: content.type,
        title: content.title,
        scheduledDate: content.scheduledDate,
        platforms: content.platforms
      });

      // Log successful automation
      console.log('Content automation workflow triggered successfully');
    } catch (error) {
      console.error('Failed to trigger content automation workflow:', error);
      throw error;
    }
  }
}