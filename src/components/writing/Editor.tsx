import React from 'react';
import { motion } from 'framer-motion';
import { useWritingStore } from '../../store/useWritingStore';
import { PenTool, Users, BookOpen } from 'lucide-react';

export default function Editor() {
  const { wordCount, updateWordCount } = useWritingStore();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const words = e.target.value.trim().split(/\s+/).length;
    updateWordCount(words);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <PenTool className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold">Story Editor</h2>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Words: {wordCount}</span>
          <button className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700">
            <Users className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      <textarea
        className="w-full h-96 p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Begin your story here..."
        onChange={handleTextChange}
      />

      <div className="mt-4 flex justify-between items-center">
        <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <BookOpen className="w-4 h-4" />
          <span>Save Draft</span>
        </button>
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition-colors">
            Preview
          </button>
          <button className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition-colors">
            Export
          </button>
        </div>
      </div>
    </motion.div>
  );
}