import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Star, Users, Trophy, Zap } from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';

export default function CourseOverview() {
  const { course, progress } = useCourseStore();

  const features = [
    {
      icon: BookOpen,
      title: 'Comprehensive Curriculum',
      description: 'From ancient wisdom to modern application'
    },
    {
      icon: Users,
      title: 'Cross-Industry Application',
      description: 'Creative and business storytelling unified'
    },
    {
      icon: Zap,
      title: 'Practical Exercises',
      description: 'Real-world applications and case studies'
    },
    {
      icon: Trophy,
      title: 'Industry Recognition',
      description: 'Certificate of completion and portfolio building'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-900 mb-4"
        >
          The Story Architect
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 max-w-3xl mx-auto"
        >
          Master the art of storytelling for creative and business success through the wisdom of Campbell, Egri, Aristotle, and more.
        </motion.p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {Object.entries(course.price).map(([plan, price], index) => (
          <motion.div
            key={plan}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg p-6 ${
              plan === 'annual' 
                ? 'bg-indigo-600 text-white ring-4 ring-indigo-300' 
                : 'bg-white border'
            }`}
          >
            <h3 className="text-lg font-semibold mb-2 capitalize">{plan}</h3>
            <div className="text-3xl font-bold mb-4">
              ${price}
              <span className="text-sm font-normal">
                {plan === 'monthly' ? '/mo' : plan === 'annual' ? '/yr' : ' one-time'}
              </span>
            </div>
            <ul className="space-y-3 mb-6">
              {[
                'All course modules',
                'Practice exercises',
                'Community access',
                plan === 'enterprise' && 'Custom training',
                plan === 'enterprise' && 'Team analytics',
                plan !== 'monthly' && 'Priority support'
              ]
                .filter(Boolean)
                .map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    {feature}
                  </li>
                ))}
            </ul>
            <button
              className={`w-full py-2 rounded-lg ${
                plan === 'annual'
                  ? 'bg-white text-indigo-600 hover:bg-gray-50'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              } transition-colors`}
            >
              Get Started
            </button>
          </motion.div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="inline-block p-3 bg-indigo-100 rounded-lg mb-4">
              <feature.icon className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Module Overview */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-center mb-8">Course Modules</h2>
        {course.modules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{module.title}</h3>
                <p className="text-gray-600">{module.description}</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">{module.duration}</span>
                <div className="mt-1">
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-600">
                    {module.level}
                  </span>
                </div>
              </div>
            </div>
            {progress[module.id] && (
              <div className="mt-4">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${progress[module.id]}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500">
                  {progress[module.id]}% Complete
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}