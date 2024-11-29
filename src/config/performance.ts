export const PERFORMANCE_CONFIG = {
  analytics: {
    maxStoredMetrics: 10000,
    retentionPeriod: '30d',
    batchSize: 100
  },
  seo: {
    minWordCount: 300,
    headingDepth: 3,
    metaDescriptionLength: {
      min: 120,
      max: 155
    },
    imageTags: {
      required: ['alt', 'title'],
      recommended: ['loading', 'decoding']
    }
  },
  accessibility: {
    minContrast: 4.5,
    focusVisible: true,
    ariaRequired: [
      'landmarks',
      'buttons',
      'inputs',
      'images'
    ],
    keyboardNav: true
  },
  caching: {
    strategies: {
      api: {
        ttl: 300, // 5 minutes
        staleWhileRevalidate: true
      },
      assets: {
        ttl: 86400, // 24 hours
        immutable: true
      }
    }
  }
};