import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Play, Lock, Star, Trophy, Brain } from 'lucide-react';
import { useCourseStore } from '../../store/useCourseStore';

export default function CourseModule() {
  const { modules, currentModule, progress, membership } = useCourseStore();

  const isLocked = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    return module?.level !== 'foundational' && membership.status === 'free';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Brain className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Story Architecture</h2>
                <p className="text-gray-600">Master the fundamentals of storytelling</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {Object.keys(progress).length} / {modules.length} completed
              </div>
              <Trophy className={`w-5 h-5 ${
                Object.keys(progress).length === modules.length
                  ? 'text-yellow-500'
                  : 'text-gray-300'
              }`} />
            </div>
          </div>

          <div className="grid gap-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-lg border ${
                  isLocked(module.id)
                    ? 'bg-gray-50 border-gray-200'
                    : 'border-indigo-100 hover:border-indigo-300'
                } transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{module.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        module.level === 'foundational'
                          ? 'bg-green-100 text-green-700'
                          : module.level === 'intermediate'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {module.level}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{module.description}</p>
                    
                    {/* AI Tools Section */}
                    {module.aiTools.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">AI Assistance</h4>
                        <div className="flex flex-wrap gap-2">
                          {module.aiTools.map(tool => (
                            <div
                              key={tool.id}
                              className="flex items-center space-x-1 px-2 py-1 bg-indigo-50 rounded-full"
                            >
                              <Brain className="w-3 h-3 text-indigo-600" />
                              <span className="text-xs text-indigo-700">{tool.name}</span>
                              {tool.memberOnly && <Lock className="w-3 h-3 text-indigo-400" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources Preview */}
                    <div className="flex flex-wrap gap-3">
                      {module.resources.slice(0, 3).map(resource => (
                        <div
                          key={resource.id}
                          className="flex items-center space-x-2 text-sm text-gray-600"
                        >
                          {resource.type === 'video' ? (
                            <Play className="w-4 h-4" />
                          ) : (
                            <BookOpen className="w-4 h-4" />
                          )}
                          <span>{resource.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col items-end">
                    {isLocked(module.id) ? (
                      <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
                        <Lock className="w-4 h-4" />
                        <span>Upgrade to Access</span>
                      </button>
                    ) : (
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        {progress[module.id] ? 'Continue' : 'Start Module'}
                      </button>
                    )}
                    {progress[module.id] && (
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${progress[module.id]}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">
                          {progress[module.id]}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}