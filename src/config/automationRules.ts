export const AUTOMATION_RULES = {
  contentGeneration: {
    triggers: {
      userMilestone: {
        conditions: ['completed_course', 'script_milestone', 'community_achievement'],
        delay: '1d',
        approval: 'required'
      },
      communityTrend: {
        conditions: ['high_engagement', 'viral_discussion', 'popular_technique'],
        delay: '4h',
        approval: 'optional'
      },
      industryNews: {
        conditions: ['relevant_mention', 'market_update', 'technology_advancement'],
        delay: '2h',
        approval: 'required'
      }
    },
    workflows: {
      blogPost: [
        'research_topic',
        'generate_outline',
        'create_draft',
        'add_media',
        'schedule_review'
      ],
      socialMedia: [
        'extract_key_points',
        'create_graphics',
        'schedule_posts',
        'monitor_engagement'
      ],
      newsletter: [
        'curate_content',
        'personalize_segments',
        'schedule_delivery',
        'track_metrics'
      ]
    }
  }
};