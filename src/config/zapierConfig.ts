import { BRAND_CONFIG } from './brandConfig';

export const ZAPIER_CONFIG = {
  app: {
    title: BRAND_CONFIG.name.full,
    slug: 'writers-room',
    description: 'AI-powered writing platform integration',
    version: '1.0.0'
  },
  webhooks: {
    story: {
      url: import.meta.env.VITE_ZAPIER_WEBHOOK_STORY_PUBLISHED,
      description: 'Triggers when a new story is published',
      payload: {
        title: 'string',
        author: 'string',
        genre: 'string',
        wordCount: 'number',
        url: 'string'
      }
    },
    milestone: {
      url: import.meta.env.VITE_ZAPIER_WEBHOOK_COMMUNITY_MILESTONE,
      description: 'Triggers when a community milestone is achieved',
      payload: {
        userId: 'string',
        milestoneType: 'string',
        achievement: 'string',
        level: 'string'
      }
    },
    content: {
      url: import.meta.env.VITE_ZAPIER_WEBHOOK_CONTENT_AUTOMATION,
      description: 'Triggers content automation workflows',
      payload: {
        contentType: 'string',
        title: 'string',
        scheduledDate: 'string',
        platforms: 'string[]'
      }
    }
  },
  workflows: {
    story: {
      steps: [
        'Create WordPress post',
        'Schedule social media updates',
        'Send Discord notification',
        'Update content calendar'
      ]
    },
    milestone: {
      steps: [
        'Send congratulatory email',
        'Update community badges',
        'Create social celebration post',
        'Add to monthly highlights'
      ]
    },
    content: {
      steps: [
        'Generate content draft',
        'Schedule for review',
        'Prepare social media assets',
        'Update editorial calendar'
      ]
    }
  }
};