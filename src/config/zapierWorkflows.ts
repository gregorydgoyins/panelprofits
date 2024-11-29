export const ZAPIER_WORKFLOWS = {
  content: {
    blogPost: {
      trigger: 'new_story',
      steps: [
        {
          app: 'wordpress',
          action: 'create_post',
          config: {
            status: 'draft',
            categories: ['Writing Tips', 'Community Stories']
          }
        },
        {
          app: 'twitter',
          action: 'create_tweet',
          config: {
            template: '📝 New story from our community: {{title}} \n\nRead more at {{url}} #WritersRoom #Writing'
          }
        },
        {
          app: 'discord',
          action: 'send_message',
          config: {
            channel: 'community-stories'
          }
        }
      ]
    },
    milestone: {
      trigger: 'milestone_reached',
      steps: [
        {
          app: 'mailchimp',
          action: 'add_subscriber_tag',
          config: {
            tag: '{{milestone_type}}'
          }
        },
        {
          app: 'discord',
          action: 'send_message',
          config: {
            channel: 'achievements'
          }
        }
      ]
    }
  },
  automation: {
    contentSchedule: {
      trigger: 'schedule',
      frequency: 'weekly',
      steps: [
        {
          app: 'airtable',
          action: 'find_records',
          config: {
            base: 'Content Calendar',
            view: 'This Week'
          }
        },
        {
          app: 'wordpress',
          action: 'create_post',
          config: {
            status: 'scheduled'
          }
        }
      ]
    }
  }
};