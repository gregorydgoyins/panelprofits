export const WORDPRESS_CONFIG = {
  api: {
    baseUrl: 'https://thewritersroom.app/wp-json/wp/v2',
    customEndpoints: {
      stories: '/writers_room_stories',
      authors: '/writers_room_authors',
      analytics: '/writers_room_analytics'
    }
  },
  customPostTypes: [
    {
      name: 'writers_room_stories',
      label: 'Stories',
      supports: ['title', 'editor', 'author', 'thumbnail', 'excerpt', 'comments'],
      taxonomies: ['genre', 'writing_style', 'target_audience']
    },
    {
      name: 'writers_room_courses',
      label: 'Courses',
      supports: ['title', 'editor', 'thumbnail', 'excerpt'],
      taxonomies: ['difficulty_level', 'course_category']
    }
  ],
  security: {
    ssl: true,
    backups: {
      frequency: 'daily',
      retention: 30 // days
    },
    firewall: {
      enabled: true,
      rules: ['block_xmlrpc', 'limit_login_attempts']
    }
  },
  performance: {
    caching: {
      enabled: true,
      type: 'page',
      expiry: 3600 // 1 hour
    },
    cdn: {
      enabled: true,
      provider: 'cloudflare'
    },
    optimization: {
      minifyHtml: true,
      minifyCss: true,
      minifyJs: true,
      lazyLoading: true,
      imageOptimization: true
    }
  }
};