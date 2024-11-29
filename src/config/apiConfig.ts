export const API_CONFIG = {
  // AI Models
  openai: {
    key: import.meta.env.VITE_OPENAI_API_KEY,
    models: {
      gpt4: 'gpt-4-turbo-preview',
      analysis: 'gpt-4-1106-preview'
    }
  },
  
  // Visual Assets
  unsplash: {
    accessKey: import.meta.env.VITE_UNSPLASH_ACCESS_KEY,
    appId: import.meta.env.VITE_UNSPLASH_APP_ID
  },

  // Video Content
  pexels: {
    key: import.meta.env.VITE_PEXELS_API_KEY,
    endpoints: {
      search: 'https://api.pexels.com/videos/search',
      popular: 'https://api.pexels.com/videos/popular'
    }
  },

  // Audio Content
  pixabayAudio: {
    endpoints: {
      search: 'https://pixabay.com/api/',
      music: '/music',
      sfx: '/sound-effects'
    }
  },

  // WordPress REST API
  wordpress: {
    baseUrl: `${import.meta.env.VITE_WORDPRESS_API_URL}`,
    auth: {
      username: import.meta.env.VITE_WORDPRESS_USERNAME,
      password: import.meta.env.VITE_WORDPRESS_APP_PASSWORD
    },
    endpoints: {
      posts: '/posts',
      media: '/media',
      categories: '/categories',
      tags: '/tags',
      customPost: `/writers_room_stories`
    }
  }
};