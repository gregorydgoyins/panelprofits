import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { showToast } from '../../components/common/Toast';
import { Star, Zap, Brain, Crown } from 'lucide-react';
import Button from '../common/Button';

export default function PricingTiers() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleSelectTier = (tier: string, price: string) => {
    if (!isAuthenticated) {
      // Store selected tier in session storage for after login
      sessionStorage.setItem('selectedTier', tier);
      navigate('/login');
      return;
    }

    // If user is already subscribed, show upgrade/downgrade confirmation
    if (user?.subscription) {
      showToast.info(`You'll be switching from ${user.subscription} to ${tier}`);
    }

    // Navigate to checkout with selected tier
    navigate('/checkout', {
      state: { tier, price }
    });
  };

  const handleComparePlans = () => {
    navigate('/pricing/compare');
  };

  const handleEnterprise = () => {
    navigate('/enterprise');
  };

  const tiers = [
    {
      name: "Hemingway's Workshop",
      price: '$14.99',
      description: 'Perfect for beginners exploring their creativity',
      features: [
        'Basic AI Writing Assistant',
        'Character Development Tools',
        'Plot Structure Templates',
        '3 AI Scene Visualizations/month',
        'Basic Research Tools',
        'Community Forum Access',
        'Basic Analytics'
      ],
      icon: Star,
      color: 'bg-gray-100',
      textColor: 'text-gray-600'
    },
    {
      name: "Woolf's Studio",
      price: '$29.99',
      description: 'For dedicated writers ready to level up',
      features: [
        'Advanced AI Writing Assistant',
        'Full Character Development Suite',
        'Advanced Plot Analysis',
        '15 AI Scene Visualizations/month',
        'Voice Generation (100 credits)',
        'Advanced Research Tools',
        'Collaboration Tools',
        'Priority Support',
        'Advanced Analytics',
        'Market Trend Analysis'
      ],
      icon: Zap,
      color: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      popular: true
    },
    {
      name: "Asimov's Laboratory",
      price: '$49.99',
      description: 'Complete suite for industry professionals',
      features: [
        'Ultimate AI Writing Suite',
        'Unlimited Scene Visualization',
        'Full Voice Generation',
        'Real-time Collaboration',
        'Advanced Market Analysis',
        'Priority Support',
        'Custom Bot Training',
        'White-label Export',
        'API Access',
        'Custom Integrations',
        'Dedicated Success Manager'
      ],
      icon: Crown,
      color: 'bg-amber-100',
      textColor: 'text-amber-600'
    }
  ];

  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Choose Your Creative Journey
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600"
          >
            From aspiring writers to industry professionals, we have the perfect plan for you
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl shadow-xl overflow-hidden ${
                tier.popular ? 'ring-4 ring-indigo-500 ring-opacity-50' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 text-sm">
                  Popular
                </div>
              )}
              
              <div className="bg-white p-8">
                <div className={`inline-flex p-3 ${tier.color} rounded-2xl mb-4`}>
                  <tier.icon className={`w-6 h-6 ${tier.textColor}`} />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
                <p className="text-gray-600 mb-6">{tier.description}</p>
                
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Star className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSelectTier(tier.name, tier.price)}
                  variant={tier.popular ? 'primary' : 'secondary'}
                  className="w-full"
                >
                  Get Started
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600">
            All plans include a 15-day free trial. No credit card required.
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <Button
              onClick={handleComparePlans}
              variant="ghost"
            >
              Compare plans in detail
            </Button>
            <Button
              onClick={handleEnterprise}
              variant="ghost"
            >
              Enterprise solutions
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}