import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Lightbulb, BookMarked, Trophy, Brain, Filter, Clock } from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';

export default function ResearchHub() {
  const {
    resources,
    learningPaths,
    searchResources,
    getRecommendations,
    setCurrentGenre,
    setCurrentTopic,
  } = useResearchStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('discover');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    genres: [] as string[],
    topics: [] as string[],
    difficulty: 'all',
  });

  const genres = [
    'Thriller',
    'Romance',
    'Sci-Fi',
    'Drama',
    'Comedy',
    'Horror',
    'Action',
  ];

  const topics = [
    'Character Development',
    'Plot Structure',
    'Dialogue Writing',
    'Scene Setting',
    'World Building',
    'Story Arcs',
  ];

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const results = await searchResources(searchQuery);
      // Additional processing if needed
    } finally {
      setIsLoading(false);
    }
  };

  const recommendations = getRecommendations();
  const searchResults = searchQuery ? searchResources(searchQuery) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-xl overflow-hidden"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/10 rounded-lg">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Research & Learning Hub</h2>
                <p className="text-indigo-100">Discover resources and enhance your craft</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {genres.slice(0, 5).map((genre) => (
              <button
                key={genre}
                onClick={() => setCurrentGenre(genre)}
                className="px-3 py-1 rounded-full bg-white/10 text-sm text-white hover:bg-white/20 transition-colors"
              >
                {genre}
              </button>
            ))}
            <button className="px-3 py-1 rounded-full bg-white/10 text-sm text-white hover:bg-white/20 transition-colors">
              More...
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Tabs */}
          <div className="flex space-x-2 mb-8">
            {['discover', 'learning paths', 'saved', 'recent'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                } transition-colors`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(searchQuery ? searchResults : recommendations).map((resource) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border rounded-lg p-6 hover:border-indigo-300 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      resource.type === 'video' 
                        ? 'bg-red-100 text-red-600'
                        : resource.type === 'course'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {resource.type}
                    </span>
                    <h3 className="text-lg font-semibold mt-2">{resource.title}</h3>
                  </div>
                  <div className="p-2 bg-gray-100 rounded-full group-hover:bg-indigo-100 transition-colors">
                    <BookMarked className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{resource.content}</p>

                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {resource.aiSummary && (
                  <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-indigo-600 text-sm mb-1">
                      <Brain className="w-4 h-4" />
                      <span className="font-medium">AI Summary</span>
                    </div>
                    <p className="text-sm text-indigo-700">{resource.aiSummary}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Learning Paths Section */}
          {activeTab === 'learning paths' && (
            <div className="mt-8 space-y-6">
              {learningPaths.map((path) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-6 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{path.title}</h3>
                      <p className="text-gray-600">{path.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        Progress: {path.progress}%
                      </div>
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${path.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    {path.progress > 0 ? 'Continue Learning' : 'Start Path'}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}