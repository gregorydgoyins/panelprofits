export const CONTENT_STRATEGY = {
  blog: {
    categories: [
      {
        name: 'Craft & Technique',
        automations: ['weekly-writing-tips', 'expert-interviews'],
        frequency: 'twice-weekly'
      },
      {
        name: 'AI & Writing',
        automations: ['tool-tutorials', 'ai-case-studies'],
        frequency: 'weekly'
      },
      {
        name: 'Industry Insights',
        automations: ['market-trends', 'success-stories'],
        frequency: 'weekly'
      },
      {
        name: 'Community Spotlight',
        automations: ['member-features', 'project-showcases'],
        frequency: 'weekly'
      }
    ],
    zapierAutomations: {
      recommended: 'Professional', // $49/mo plan
      workflows: [
        {
          trigger: 'New Community Success Story',
          actions: [
            'Create Blog Draft',
            'Schedule Social Posts',
            'Notify Community Manager',
            'Add to Newsletter'
          ]
        },
        {
          trigger: 'High-Performing Script Analysis',
          actions: [
            'Generate Case Study',
            'Create Tutorial Draft',
            'Schedule Community Workshop'
          ]
        },
        {
          trigger: 'Industry News Mention',
          actions: [
            'Create Expert Commentary Draft',
            'Schedule Social Discussion',
            'Update Resource Library'
          ]
        },
        {
          trigger: 'User Milestone Achievement',
          actions: [
            'Generate Success Story',
            'Schedule Social Celebration',
            'Add to Monthly Roundup'
          ]
        }
      ],
      integrations: [
        'WordPress',
        'Medium',
        'LinkedIn',
        'Twitter',
        'Discord',
        'Mailchimp',
        'Airtable'
      ]
    },
    communityEngagement: {
      userGenerated: {
        types: [
          'Writing Tips & Tricks',
          'Success Stories',
          'Tool Tutorials',
          'Industry Insights'
        ],
        rewards: {
          featured: 100, // points
          newsletter: 75,
          social: 50
        }
      },
      expertContent: {
        frequency: 'monthly',
        types: [
          'Masterclass Videos',
          'Industry AMAs',
          'Writing Workshops',
          'Market Analysis'
        ],
        compensation: {
          session: 250, // USD
          article: 150
        }
      },
      gamification: {
        badges: [
          'Content Creator',
          'Community Mentor',
          'Workshop Host',
          'Thought Leader'
        ],
        levels: [
          'Contributor',
          'Regular',
          'Expert',
          'Ambassador'
        ],
        perks: {
          'Contributor': ['Feature Consideration'],
          'Regular': ['Newsletter Feature', 'Social Mention'],
          'Expert': ['Workshop Opportunity', 'Paid Content'],
          'Ambassador': ['Platform Partnership', 'Revenue Share']
        }
      }
    }
  }
};