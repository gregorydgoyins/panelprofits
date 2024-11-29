import { WORDPRESS_CONFIG } from '../../config/wordpressConfig';
import apiFetch from '@wordpress/api-fetch';

export class WordPressService {
  private static instance: WordPressService;
  private baseUrl: string;
  private isInitialized: boolean = false;

  private constructor() {
    this.baseUrl = WORDPRESS_CONFIG.api.baseUrl;
    this.initialize();
  }

  static getInstance(): WordPressService {
    if (!WordPressService.instance) {
      WordPressService.instance = new WordPressService();
    }
    return WordPressService.instance;
  }

  private async initialize() {
    if (this.isInitialized) return;

    apiFetch.use(apiFetch.createRootURLMiddleware(this.baseUrl));
    apiFetch.use(apiFetch.createNonceMiddleware(import.meta.env.VITE_WORDPRESS_NONCE));
    
    this.isInitialized = true;
  }

  async createStory(story: {
    title: string;
    content: string;
    excerpt?: string;
    status?: 'draft' | 'publish';
    genre?: string[];
  }) {
    try {
      const response = await apiFetch({
        path: '/writers_room_stories',
        method: 'POST',
        data: {
          title: story.title,
          content: story.content,
          excerpt: story.excerpt,
          status: story.status || 'draft',
          genre: story.genre
        }
      });

      return response;
    } catch (error) {
      console.error('Failed to create story:', error);
      throw error;
    }
  }

  async getStories(params: {
    page?: number;
    perPage?: number;
    genre?: string;
    author?: number;
    status?: string;
  } = {}) {
    try {
      const queryString = new URLSearchParams({
        page: (params.page || 1).toString(),
        per_page: (params.perPage || 10).toString(),
        ...(params.genre && { genre: params.genre }),
        ...(params.author && { author: params.author.toString() }),
        ...(params.status && { status: params.status })
      }).toString();

      const response = await apiFetch({
        path: `/writers_room_stories?${queryString}`
      });

      return response;
    } catch (error) {
      console.error('Failed to fetch stories:', error);
      throw error;
    }
  }

  async updateStory(id: number, updates: {
    title?: string;
    content?: string;
    excerpt?: string;
    status?: 'draft' | 'publish';
    genre?: string[];
  }) {
    try {
      const response = await apiFetch({
        path: `/writers_room_stories/${id}`,
        method: 'PUT',
        data: updates
      });

      return response;
    } catch (error) {
      console.error('Failed to update story:', error);
      throw error;
    }
  }

  async deleteStory(id: number) {
    try {
      await apiFetch({
        path: `/writers_room_stories/${id}`,
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete story:', error);
      throw error;
    }
  }

  async createCourse(course: {
    title: string;
    content: string;
    excerpt?: string;
    status?: 'draft' | 'publish';
    category?: string[];
  }) {
    try {
      const response = await apiFetch({
        path: '/writers_room_courses',
        method: 'POST',
        data: {
          title: course.title,
          content: course.content,
          excerpt: course.excerpt,
          status: course.status || 'draft',
          course_category: course.category
        }
      });

      return response;
    } catch (error) {
      console.error('Failed to create course:', error);
      throw error;
    }
  }

  async getCourses(params: {
    page?: number;
    perPage?: number;
    category?: string;
    status?: string;
  } = {}) {
    try {
      const queryString = new URLSearchParams({
        page: (params.page || 1).toString(),
        per_page: (params.perPage || 10).toString(),
        ...(params.category && { course_category: params.category }),
        ...(params.status && { status: params.status })
      }).toString();

      const response = await apiFetch({
        path: `/writers_room_courses?${queryString}`
      });

      return response;
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      throw error;
    }
  }
}