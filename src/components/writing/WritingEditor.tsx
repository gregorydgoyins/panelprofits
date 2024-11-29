import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Save, Share2, Brain } from 'lucide-react';
import { useWritingStore } from '../../store/useWritingStore';
import { useBotStore } from '../../services/bots/BotOrchestrator';

export function WritingEditor() {
  const { wordCount, updateWordCount } = useWritingStore();
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { getBotInstance } = useBotStore();

  useEffect(() => {
    const words = content.trim().split(/\s+/).length;
    updateWordCount(words);
  }, [content, updateWordCount]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsSaving(false);
    }
  };

  const handleGetSuggestions = async () => {
    const writingBot = getBotInstance('writing');
    if (writingBot) {
      const feedback = await writingBot.provideFeedback(content);
      setSuggestions(prev => [...prev, feedback]);
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
          <PenTool className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold">Story Editor</h2>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Words: {wordCount}</span>
          <button 
            onClick={handleGetSuggestions}
            className="p-2 text-gray-600 hover:text-indigo-600 rounded-full"
          >
            <Brain className="w-4 h-4" />
          </button>
          <button 
            onClick={handleSave}
            className="p-2 text-gray-600 hover:text-indigo-600 rounded-full"
            disabled={isSaving}
          >
            <Save className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 hover:text-indigo-600 rounded-full">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-[500px] p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          placeholder="Begin your story here..."
        />

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">AI Suggestions</h3>
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="p-3 bg-indigo-50 rounded-lg text-indigo-700 text-sm"
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}