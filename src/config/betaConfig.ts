export const BETA_CONFIG = {
  features: {
    community: {
      enabled: true,
      restrictions: null
    },
    basicWritingTools: {
      enabled: true,
      restrictions: null
    },
    aiAssistant: {
      enabled: true,
      usageLimit: 10, // requests per day
      features: ['basic-suggestions', 'plot-help']
    },
    advancedFeatures: {
      enabled: false,
      whitelist: ['beta-testers'],
      features: ['limited-preview']
    }
  },
  analytics: {
    trackFeatureUsage: true,
    collectFeedback: true,
    performanceMetrics: true
  },
  betaGroups: {
    wave1: {
      size: 50,
      startDate: '2024-04-01',
      duration: '30d'
    },
    wave2: {
      size: 200,
      startDate: '2024-05-01',
      duration: '30d'
    }
  }
};