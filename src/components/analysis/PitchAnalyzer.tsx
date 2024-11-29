import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, DollarSign, Users, Star, RefreshCw } from 'lucide-react';
import { useScriptAnalysisStore } from '../../store/useScriptAnalysisStore';

export default function PitchAnalyzer() {
  const { pitchAnalysis, isAnalyzing, analyzePitchProbability } = useScriptAnalysisStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Target className="w-6 h-6 text-indigo-600" />
          <div>
            <h2 className="text-xl font-bold">Pitch Probability Analyzer</h2>
            <p className="text-gray-600">Evaluate market potential and pitch readiness</p>
          </div>
        </div>
        <button
          onClick={() => analyzePitchProbability({})}
          disabled={isAnalyzing}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <TrendingUp className="w-4 h-4" />
          )}
          <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Pitch'}</span>
        </button>
      </div>

      {pitchAnalysis && (
        <div className="space-y-8">
          {/* Overall Score */}
          <div className="text-center">
            <div className="inline-block p-6 bg-indigo-50 rounded-full">
              <div className="text-4xl font-bold text-indigo-600">
                {pitchAnalysis.overallScore}%
              </div>
              <div className="text-sm text-indigo-600">Pitch Success Probability</div>
            </div>
          </div>

          {/* Market Fit */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
              Market Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Genre</div>
                <div className="font-medium">{pitchAnalysis.marketFit.genre}</div>
                <div className="mt-4">
                  <div className="text-sm text-gray-600 mb-1">Current Trend</div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${pitchAnalysis.marketFit.currentTrend * 10}%` }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Comparable Projects</div>
                <div className="space-y-1">
                  {pitchAnalysis.marketFit.comparableProjects.map((project) => (
                    <div key={project} className="text-sm">{project}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Unique Elements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pitchAnalysis.uniqueElements.map((element, index) => (
              <div key={index} className="bg-white border rounded-lg p-4">
                <h4 className="font-medium mb-2">{element.element}</h4>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Impact</div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${element.impact * 10}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Market Appeal</div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${element.marketAppeal * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                Key Strengths
              </h4>
              <ul className="space-y-2">
                {pitchAnalysis.strengths.map((strength, index) => (
                  <li key={index} className="text-sm">{strength}</li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2 text-indigo-600" />
                Target Demographics
              </h4>
              <ul className="space-y-2">
                {pitchAnalysis.targetDemographics.map((demo, index) => (
                  <li key={index} className="text-sm">{demo}</li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                Budget Range
              </h4>
              <div className="text-sm">
                ${(pitchAnalysis.estimatedBudgetRange.min / 1000000).toFixed(1)}M - 
                ${(pitchAnalysis.estimatedBudgetRange.max / 1000000).toFixed(1)}M
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}