export const SUPPORT_CONFIG = {
  email: {
    forwardingAddresses: {
      general: 'support@thewritersroom.app',
      billing: 'billing@thewritersroom.app',
      feedback: 'feedback@thewritersroom.app'
    },
    autoResponders: {
      general: {
        subject: 'We received your message',
        template: 'support-confirmation'
      },
      feedback: {
        subject: 'Thanks for your feedback',
        template: 'feedback-confirmation'
      }
    },
    responseTime: '24h',
    priorities: ['urgent', 'high', 'normal', 'low']
  },
  chat: {
    initialResponse: 'Welcome to Writers\' Room! How can I assist you today?',
    availableHours: '24/7',
    categories: [
      'Technical Support',
      'Account Issues',
      'Billing Questions',
      'Feature Requests',
      'Writing Help'
    ],
    quickResponses: {
      pricing: 'Our pricing plans start at $14.99/month. Would you like to see the full pricing details?',
      trial: 'Yes! We offer a 15-day free trial with full access to all features.',
      features: 'Our platform includes AI writing assistance, story development tools, and collaboration features.'
    }
  }
};