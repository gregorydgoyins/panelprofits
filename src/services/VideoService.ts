import { BRAND_CONFIG } from '../config/brandConfig';

export class VideoService {
  private static instance: VideoService;
  private apiKey: string;

  private constructor() {
    this.apiKey = import.meta.env.VITE_PEXELS_API_KEY;
  }

  static getInstance(): VideoService {
    if (!VideoService.instance) {
      VideoService.instance = new VideoService();
    }
    return VideoService.instance;
  }

  async searchVideos(query: string, options: {
    page?: number;
    perPage?: number;
    orientation?: 'landscape' | 'portrait';
    size?: 'small' | 'medium' | 'large';
    locale?: string;
  } = {}) {
    const params = new URLSearchParams({
      query,
      per_page: (options.perPage || 15).toString(),
      page: (options.page || 1).toString(),
      ...(options.orientation && { orientation: options.orientation }),
      ...(options.size && { size: options.size }),
      ...(options.locale && { locale: options.locale })
    });

    try {
      const response = await fetch(`https://api.pexels.com/videos/search?${params}`, {
        headers: {
          Authorization: this.apiKey
        }
      });

      if (!response.ok) throw new Error('Failed to fetch videos');
      
      const data = await response.json();
      return {
        videos: data.videos.map(this.formatVideoData),
        total_results: data.total_results,
        next_page: data.next_page
      };
    } catch (error) {
      console.error('Error searching videos:', error);
      throw error;
    }
  }

  async getPopularVideos(options: {
    page?: number;
    perPage?: number;
    minDuration?: number;
    maxDuration?: number;
  } = {}) {
    const params = new URLSearchParams({
      per_page: (options.perPage || 15).toString(),
      page: (options.page || 1).toString(),
      ...(options.minDuration && { min_duration: options.minDuration.toString() }),
      ...(options.maxDuration && { max_duration: options.maxDuration.toString() })
    });

    try {
      const response = await fetch(`https://api.pexels.com/videos/popular?${params}`, {
        headers: {
          Authorization: this.apiKey
        }
      });

      if (!response.ok) throw new Error('Failed to fetch popular videos');
      
      const data = await response.json();
      return {
        videos: data.videos.map(this.formatVideoData),
        total_results: data.total_results,
        next_page: data.next_page
      };
    } catch (error) {
      console.error('Error fetching popular videos:', error);
      throw error;
    }
  }

  private formatVideoData(video: any) {
    return {
      id: video.id,
      width: video.width,
      height: video.height,
      duration: video.duration,
      thumbnail: video.image,
      description: video.url.split('/').pop()?.replace(/-/g, ' ') || '',
      author: {
        name: video.user.name,
        url: video.user.url
      },
      files: video.video_files.map((file: any) => ({
        quality: file.quality,
        width: file.width,
        height: file.height,
        url: file.link,
        format: file.file_type
      })),
      attribution: {
        required: true,
        format: `Video by ${video.user.name} from Pexels`,
        link: video.url,
        utmParams: {
          utm_source: BRAND_CONFIG.name.short,
          utm_medium: 'referral'
        }
      },
      license: {
        name: 'Pexels License',
        url: 'https://www.pexels.com/license/',
        commercial_use: true,
        modify: true,
        private_use: true,
        share: true,
        requirements: [
          'Attribution is not required but appreciated',
          'Cannot sell unmodified copies',
          'Cannot claim ownership of unmodified content'
        ]
      }
    };
  }

  getAttributionComponent(video: ReturnType<typeof this.formatVideoData>) {
    return `<a href="${video.attribution.link}?${new URLSearchParams(video.attribution.utmParams)}" 
       target="_blank" 
       rel="noopener noreferrer" 
       className="text-sm text-gray-500 hover:text-gray-700">
      ${video.attribution.format}
    </a>`;
  }

  getRateLimit() {
    return {
      requests: {
        monthly: 20000,
        hourly: 200
      }
    };
  }
}