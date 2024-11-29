import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp, Gift, Award, Brain, Sparkles, Users } from 'lucide-react';
import { useProducerBotStore } from '../../store/useProducerBotStore';
import { useEnhancedProducerStore } from '../../store/useEnhancedProducerStore';

export default function ProducerDashboard() {
  const { currentScore, rewards, milestones } = useProducerBotStore();
  const enhancedStore = useEnhancedProducerStore();
  const [selectedTab, setSelectedTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Brain },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'insights', label: 'AI Insights', icon: Sparkles }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-xl p-6"
    >
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              selectedTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Daily Challenge Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white mb-8"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold mb-2">Daily Challenge</h3>
            <p className="text-purple-100">Create a character arc that subverts a common trope</p>
            <div className="mt-4 flex space-x-4">
              <button className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                Start Challenge
              </button>
              <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition-colors">
                View Details
              </button>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">500</div>
            <div className="text-purple-200">points</div>
          </div>
        </div>
      </motion.div>

      {/* Main Content based on selected tab */}
      <div className="space-y-8">
        {selectedTab === 'overview' && (
          <>
            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(currentScore.categories).map(([category, score]) => (
                <div key={category} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium capitalize">{category}</h4>
                    <div className="text-2xl font-bold text-indigo-600">{score}</div>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Insights Preview */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">AI Analysis Insights</h3>
              <div className="space-y-4">
                {currentScore.feedback.map((feedback, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Brain className="w-5 h-5 text-indigo-600 mt-1" />
                    <p className="text-gray-700">{feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedTab === 'challenges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enhancedStore.gamification.challenges.active.map((challenge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-6 hover:border-indigo-300 transition-colors"
              >
                <h4 className="font-semibold mb-2">{challenge.title}</h4>
                <p className="text-gray-600 mb-4">{challenge.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{challenge.deadline}</span>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Accept Challenge
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedTab === 'community' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Live Events</h3>
              <div className="space-y-4">
                {/* Live events content */}
                <div className="p-4 border rounded-lg bg-white">
                  <h4 className="font-medium">Screenwriting Workshop</h4>
                  <p className="text-gray-600">Join industry experts for a live workshop session</p>
                  <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg">
                    Join Now
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Community Leaderboard</h3>
              <div className="space-y-2">
                {/* Leaderboard entries */}
                {[1, 2, 3].map((position) => (
                  <div key={position} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-lg">{position}</span>
                      <div>
                        <div className="font-medium">User {position}</div>
                        <div className="text-sm text-gray-500">Score: {1000 - (position * 100)}</div>
                      </div>
                    </div>
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Market Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-medium mb-2">Genre Trends</h4>
                  <div className="space-y-2">
                    {['Sci-Fi', 'Drama', 'Thriller'].map((genre) => (
                      <div key={genre} className="flex items-center justify-between">
                        <span>{genre}</span>
                        <div className="w-32 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${Math.random() * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-medium mb-2">Audience Demographics</h4>
                  {/* Add demographic charts here */}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Story Recommendations</h3>
              <div className="space-y-4">
                {/* Add AI-powered story recommendations */}
                <div className="p-4 bg-white rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-medium">Based on your writing style</h4>
                  </div>
                  <p className="text-gray-600">Consider exploring themes of redemption and identity</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}