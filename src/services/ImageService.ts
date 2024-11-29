import { BRAND_CONFIG } from '../config/brandConfig';

export class ImageService {
  private static instance: ImageService;
  private accessKey: string;
  private appId: string;

  private constructor() {
    this.accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
    this.appId = import.meta.env.VITE_UNSPLASH_APP_ID;
  }

  static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  async searchImages(query: string, options: {
    page?: number;
    perPage?: number;
    orientation?: 'landscape' | 'portrait' | 'squarish';
    contentFilter?: 'low' | 'high';
  } = {}) {
    const params = new URLSearchParams({
      query,
      client_id: this.accessKey,
      page: (options.page || 1).toString(),
      per_page: (options.perPage || 30).toString(),
      content_filter: options.contentFilter || 'high',
      ...(options.orientation && { orientation: options.orientation })
    });

    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?${params}`);
      if (!response.ok) throw new Error('Failed to fetch images');
      
      const data = await response.json();
      return {
        results: data.results.map(this.formatImageData),
        total: data.total,
        total_pages: data.total_pages
      };
    } catch (error) {
      console.error('Error searching images:', error);
      throw error;
    }
  }

  async getRandomImage(options?: {
    query?: string;
    orientation?: 'landscape' | 'portrait' | 'squarish';
    contentFilter?: 'low' | 'high';
    collections?: string[];
  }) {
    const params = new URLSearchParams({
      client_id: this.accessKey,
      content_filter: options?.contentFilter || 'high',
      ...(options?.query && { query: options.query }),
      ...(options?.orientation && { orientation: options.orientation }),
      ...(options?.collections && { collections: options.collections.join(',') })
    });

    try {
      const response = await fetch(`https://api.unsplash.com/photos/random?${params}`);
      if (!response.ok) throw new Error('Failed to fetch random image');
      
      const data = await response.json();
      return this.formatImageData(data);
    } catch (error) {
      console.error('Error getting random image:', error);
      throw error;
    }
  }

  private formatImageData(image: any) {
    return {
      id: image.id,
      url: image.urls.regular,
      thumbnail: image.urls.thumb,
      description: image.description || image.alt_description,
      author: {
        name: image.user.name,
        username: image.user.username,
        portfolio: image.user.portfolio_url,
        profileUrl: image.user.links.html
      },
      downloadLocation: image.links.download_location,
      attribution: {
        required: true,
        format: `Photo by ${image.user.name} on Unsplash`,
        link: image.links.html,
        utmParams: {
          utm_source: BRAND_CONFIG.name.short,
          utm_medium: 'referral'
        }
      },
      license: {
        name: 'Unsplash License',
        url: 'https://unsplash.com/license',
        commercial_use: true,
        modify: true,
        private_use: true,
        share: true,
        requirements: [
          'Attribution is required when used in a significant way',
          'Cannot sell unaltered copies',
          'Cannot compile photos to replicate Unsplash service'
        ]
      }
    };
  }

  async trackDownload(downloadLocation: string) {
    try {
      const response = await fetch(downloadLocation, {
        headers: {
          Authorization: `Client-ID ${this.accessKey}`
        }
      });
      if (!response.ok) throw new Error('Failed to track download');
      
      const data = await response.json();
      return {
        url: data.url,
        attribution: {
          required: true,
          format: `Photo by ${data.user.name} on Unsplash`,
          link: data.links.html
        }
      };
    } catch (error) {
      console.error('Error tracking download:', error);
      throw error;
    }
  }

  getAttributionComponent(image: ReturnType<typeof this.formatImageData>) {
    return `<a href="${image.attribution.link}?${new URLSearchParams(image.attribution.utmParams)}" 
       target="_blank" 
       rel="noopener noreferrer" 
       className="text-sm text-gray-500 hover:text-gray-700">
      ${image.attribution.format}
    </a>`;
  }

  getRateLimit() {
    return {
      requests: {
        hourly: 50,
        demo: 50
      },
      downloads: {
        hourly: 30
      }
    };
  }
}