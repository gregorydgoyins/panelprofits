import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Sparkles, GitBranch, Brain, UserSquare2, LayoutPanelTop, MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from './common/Button';
import { showToast } from './common/Toast';

export default function Features() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleFeatureClick = (feature: string) => {
    if (!isAuthenticated) {
      showToast.info('Please log in to access this feature');
      navigate('/login');
      return;
    }

    switch (feature) {
      case 'brainstorming':
        navigate('/dashboard/ai');
        break;
      case 'character':
        navigate('/dashboard/characters');
        break;
      case 'plot':
        navigate('/dashboard/writing');
        break;
      case 'collaboration':
        navigate('/dashboard/collaborate');
        break;
      case 'version':
        navigate('/dashboard/versions');
        break;
      case 'community':
        navigate('/community');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const features = [
    {
      id: 'brainstorming',
      name: 'Brainstorming',
      description: 'Generate ideas with AI-powered prompts and collaborative mind mapping tools.',
      icon: Brain,
      path: '/dashboard/ai'
    },
    {
      id: 'character',
      name: 'Character Development',
      description: 'Create deep, consistent characters with detailed bio templates and trait libraries.',
      icon: UserSquare2,
      path: '/dashboard/characters'
    },
    {
      id: 'plot',
      name: 'Plot Structuring',
      description: 'Organize your story with timeline tools and flexible act structures.',
      icon: LayoutPanelTop,
      path: '/dashboard/writing'
    },
    {
      id: 'collaboration',
      name: 'Real-time Collaboration',
      description: 'Work together seamlessly with live editing and instant feedback.',
      icon: Users,
      path: '/dashboard/collaborate'
    },
    {
      id: 'version',
      name: 'Version Control',
      description: 'Track changes and explore different story variations safely.',
      icon: GitBranch,
      path: '/dashboard/versions'
    },
    {
      id: 'community',
      name: 'Community Feedback',
      description: 'Get constructive feedback from a supportive writing community.',
      icon: MessageSquare,
      path: '/community'
    }
  ];

  return (
    <div className="py-24 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to write your story
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Powerful tools designed to support every stage of your writing process, from initial concept to final draft.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="relative"
              >
                <Button
                  onClick={() => handleFeatureClick(feature.id)}
                  variant="ghost"
                  className="w-full text-left"
                >
                  <div className="flow-root bg-white px-6 pb-8 rounded-lg border border-gray-100 hover:border-indigo-100 transition-colors">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                          <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.name}</h3>
                      <p className="mt-5 text-base text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}