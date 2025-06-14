import { create } from 'zustand';

export const useStoryCache = create(() => ({
  stories: [
    {
      id: 1,
      title: "Welcome to Panel Profits!",
      source: "System",
      timestamp: Date.now(),
    },
    {
      id: 2,
      title: "This ticker is running on dum-dum data.",
      source: "Test Feed",
      timestamp: Date.now() - 60000,
    },
    {
      id: 3,
      title: "Swap this out when you find your real storyCache.",
      source: "System",
      timestamp: Date.now() - 120000,
    },
  ],
}));
