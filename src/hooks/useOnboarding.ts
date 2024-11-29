import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Joyride, { Step } from 'react-joyride';
import { useAuthStore } from '../store/useAuthStore';

export function useOnboarding() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [run, setRun] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !user.hasCompletedOnboarding) {
      const currentSteps = getStepsForRoute(location.pathname);
      setSteps(currentSteps);
      setRun(true);
    }
  }, [location.pathname, user]);

  const getStepsForRoute = (path: string): Step[] => {
    switch (path) {
      case '/dashboard':
        return [
          {
            target: '.dashboard-overview',
            content: 'Welcome to your dashboard! Here you can see all your writing projects.',
            placement: 'center'
          },
          {
            target: '.ai-assistant',
            content: 'Your AI writing assistant is here to help with suggestions and feedback.',
            placement: 'right'
          }
          // Add more steps as needed
        ];
      // Add cases for other routes
      default:
        return [];
    }
  };

  const handleJoyrideCallback = (data: any) => {
    const { status, type } = data;
    if (status === 'finished' || status === 'skipped') {
      setRun(false);
      // Update user onboarding status
    }
  };

  return {
    run,
    steps,
    handleJoyrideCallback
  };
}