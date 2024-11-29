import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Activity, Power, BarChart2 } from 'lucide-react';
import { useBotStore } from '../services/bots/BotOrchestrator';

export default function BotManager() {
  const { bots, activeBots, activateBot, deactivateBot } = useBotStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bot className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold">AI Assistant Network</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-green-500" />
          <span className="text-sm text-gray-600">
            {activeBots.length} Active Bots
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <motion.div
            key={bot.id}
            className="border rounded-lg p-4 hover:border-indigo-300 transition-all"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{bot.name}</h3>
              <button
                onClick={() => 
                  activeBots.includes(bot.id) 
                    ? deactivateBot(bot.id)
                    : activateBot(bot.id)
                }
                className={`p-2 rounded-lg ${
                  activeBots.includes(bot.id)
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Power className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {bot.capabilities.map((capability, index) => (
                <div
                  key={index}
                  className="text-sm text-gray-600 flex items-center space-x-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>{capability}</span>
                </div>
              ))}
            </div>

            {bot.lastActive && (
              <div className="text-xs text-gray-500">
                Last active: {new Date(bot.lastActive).toLocaleString()}
              </div>
            )}

            {activeBots.includes(bot.id) && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-medium">
                    {(bot.metrics.successRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Tasks Completed</span>
                  <span className="font-medium">{bot.metrics.tasksCompleted}</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <BarChart2 className="w-5 h-5 text-indigo-600" />
          <span>Network Performance</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total Tasks</div>
            <div className="text-2xl font-bold text-indigo-600">
              {bots.reduce((acc, bot) => acc + bot.metrics.tasksCompleted, 0)}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Avg. Response Time</div>
            <div className="text-2xl font-bold text-indigo-600">
              {(bots.reduce((acc, bot) => acc + bot.metrics.averageResponseTime, 0) / bots.length).toFixed(0)}ms
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Network Health</div>
            <div className="text-2xl font-bold text-green-600">98.5%</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}