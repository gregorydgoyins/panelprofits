import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, Brain, Loader } from 'lucide-react';
import { useBotStore } from '../../services/bots/BotOrchestrator';

export function AIAssistant() {
  const { bots, activeBots, activateBot, isInitialized, initializeBots } = useBotStore();
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      const initBots = async () => {
        try {
          await initializeBots();
        } catch (error) {
          setInitError('Some features may be limited. Please try again later.');
          console.error('Bot initialization error:', error);
        }
      };
      initBots();
    }
  }, [isInitialized, initializeBots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const writingBot = bots.find(bot => bot.id === 'writing-coach');
      if (writingBot && !activeBots.includes(writingBot.id)) {
        activateBot(writingBot.id);
      }

      const botInstance = useBotStore.getState().getBotInstance('writing');
      if (!botInstance) {
        throw new Error('Writing assistant unavailable');
      }

      const response = await botInstance.provideFeedback(message);
      setSuggestions(prev => [...prev, response]);
    } catch (error) {
      console.error('Error processing message:', error);
      setSuggestions(prev => [...prev, 'Sorry, I encountered an error. Please try again.']);
    } finally {
      setIsProcessing(false);
      setMessage('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold">AI Assistant</h2>
        </div>
        {isProcessing && (
          <div className="flex items-center space-x-2 text-indigo-600">
            <Loader className="w-4 h-4 animate-spin" />
            <span className="text-sm">Processing...</span>
          </div>
        )}
      </div>

      {initError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          {initError}
        </div>
      )}

      <div className="space-y-4 mb-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="p-4 bg-indigo-50 rounded-lg"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="font-medium text-indigo-900">AI Suggestion</span>
            </div>
            <p className="text-indigo-700">{suggestion}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-gray-600" />
          <span className="font-medium">Chat with AI</span>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me anything about your story..."
            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !message.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </motion.div>
  );
}