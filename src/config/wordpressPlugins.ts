export const WORDPRESS_PLUGINS = {
  security: {
    wordfence: {
      license: 'f2d344928d8996e406d5c53d32b70dccb089f6522c046b12174a3c806388d9b20dfb4e31b1aa9f607e6651d91c30a45004e633dcaef09247b57e1f92ee731e84',
      settings: {
        liveTrafficEnabled: true,
        loginSecurityEnabled: true,
        advancedBlocking: true,
        countryBlocking: false
      }
    },
    wp2fa: {
      enforceForRoles: ['administrator', 'editor'],
      allowedMethods: ['totp', 'email'],
      gracePolicy: '7d'
    }
  },
  performance: {
    litespeed: {
      pageCache: true,
      browserCache: true,
      minification: {
        html: true,
        css: true,
        js: true
      },
      lazyload: {
        images: true,
        iframes: true
      }
    },
    smush: {
      autoOptimize: true,
      stripMetadata: true,
      resizeOriginal: true,
      maxWidth: 2560,
      maxHeight: 2560
    }
  },
  seo: {
    yoast: {
      contentAnalysis: true,
      xmlSitemap: true,
      robotsTxt: true,
      breadcrumbs: true
    }
  },
  integration: {
    zapier: {
      triggers: ['post_published', 'user_registered'],
      actions: ['create_post', 'update_user']
    },
    wpMailSmtp: {
      mailer: 'smtp',
      encryption: 'tls',
      auth: true
    }
  }
};