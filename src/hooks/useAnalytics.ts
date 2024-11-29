import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnalyticsService } from '../services/analytics/AnalyticsService';

export function useAnalytics() {
  const location = useLocation();
  const analytics = AnalyticsService.getInstance();

  useEffect(() => {
    // Track page views
    analytics.trackPageView(location.pathname);
  }, [location]);

  const trackInteraction = (action: string, data: any) => {
    analytics.trackInteraction(action, data);
  };

  const trackAIUsage = (botType: string, operation: string, duration: number) => {
    analytics.trackAIUsage(botType, operation, duration);
  };

  const trackError = (error: Error, context: any) => {
    analytics.trackError(error, context);
  };

  return {
    trackInteraction,
    trackAIUsage,
    trackError
  };
}