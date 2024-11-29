import { useState } from 'react';
import { ZapierAutomation } from '../services/integrations/ZapierAutomation';

export function useZapier() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const automation = ZapierAutomation.getInstance();

  const publishStory = async (story: any) => {
    setIsProcessing(true);
    setError(null);
    try {
      await automation.handleStoryPublication(story);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish story');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerMilestone = async (milestone: any) => {
    setIsProcessing(true);
    setError(null);
    try {
      await automation.handleCommunityMilestone(milestone);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger milestone');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const scheduleContent = async (content: any) => {
    setIsProcessing(true);
    setError(null);
    try {
      await automation.scheduleContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule content');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    error,
    publishStory,
    triggerMilestone,
    scheduleContent
  };
}