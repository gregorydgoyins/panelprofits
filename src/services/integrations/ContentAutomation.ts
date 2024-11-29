import { ZapierService } from './ZapierService';
import { ZAPIER_WORKFLOWS } from '../../config/zapierWorkflows';

export class ContentAutomation {
  private static instance: ContentAutomation;
  private zapier: ZapierService;

  private constructor() {
    this.zapier = ZapierService.getInstance();
  }

  static getInstance(): ContentAutomation {
    if (!ContentAutomation.instance) {
      ContentAutomation.instance = new ContentAutomation();
    }
    return ContentAutomation.instance;
  }

  async handleNewStory(story: any) {
    try {
      // Trigger the blog post workflow
      await this.zapier.createStoryTrigger({
        title: story.title,
        excerpt: story.excerpt,
        author: story.author,
        genre: story.genre,
        wordCount: story.wordCount,
        url: `https://${story.url}`,
        workflow: ZAPIER_WORKFLOWS.content.blogPost
      });
    } catch (error) {
      console.error('Failed to handle new story automation:', error);
      throw error;
    }
  }

  async handleMilestone(milestone: any) {
    try {
      // Trigger the milestone workflow
      await this.zapier.createMilestoneTrigger({
        userId: milestone.userId,
        type: milestone.type,
        achievement: milestone.achievement,
        level: milestone.level,
        workflow: ZAPIER_WORKFLOWS.content.milestone
      });
    } catch (error) {
      console.error('Failed to handle milestone automation:', error);
      throw error;
    }
  }

  async scheduleContent(content: any) {
    try {
      // Trigger the content scheduling workflow
      await this.zapier.createContentAction({
        type: content.type,
        title: content.title,
        body: content.body,
        scheduledDate: content.scheduledDate,
        platforms: content.platforms,
        workflow: ZAPIER_WORKFLOWS.automation.contentSchedule
      });
    } catch (error) {
      console.error('Failed to schedule content:', error);
      throw error;
    }
  }
}