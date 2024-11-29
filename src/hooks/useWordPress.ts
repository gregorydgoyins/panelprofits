import { useState } from 'react';
import { WordPressService } from '../services/wordpress/WordPressService';

export function useWordPress() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wordpress = WordPressService.getInstance();

  const createStory = async (story: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await wordpress.createStory(story);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create story');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getStories = async (params?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const stories = await wordpress.getStories(params);
      return stories;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stories');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createCourse = async (course: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await wordpress.createCourse(course);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getCourses = async (params?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const courses = await wordpress.getCourses(params);
      return courses;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createStory,
    getStories,
    createCourse,
    getCourses
  };
}