import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Lightbulb, ThumbsUp } from 'lucide-react';
import { useScriptAnalysisStore } from '../../store/useScriptAnalysisStore';

export default function ClicheDetector() {
  const { cliches, isAnalyzing, detectCliches } = useScriptAnalysisStore();

  const severityColors = {
    low: 'text-yellow-600 bg-yellow-100',
    medium: 'text-orange-600 bg-orange-100',
    high: 'text-red-600 bg-red-100'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-indigo-600" />
          <div>
            <h2 className="text-xl font-bold">Cliché Detector</h2>
            <p className="text-gray-600">Identify and improve overused elements</p>
          </div>
        </div>
        <button
          onClick={() => detectCliches("script content")}
          disabled={isAnalyzing}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Script'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {cliches.map((cliche) => (
          <motion.div
            key={cliche.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="border rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className={`inline-block px-2 py-1 rounded-full text-sm ${severityColors[cliche.severity]}`}>
                  {cliche.type.charAt(0).toUpperCase() + cliche.type.slice(1)}
                </span>
                <h3 className="text-lg font-semibold mt-2">{cliche.phrase}</h3>
              </div>
              <span className="text-sm text-gray-500">Line {cliche.lineNumber}</span>
            </div>
            
            <p className="text-gray-600 mb-4">{cliche.context}</p>
            
            <div className="flex items-start space-x-3 bg-indigo-50 p-4 rounded-lg">
              <Lightbulb className="w-5 h-5 text-indigo-600 mt-1" />
              <div>
                <h4 className="font-medium text-indigo-900">Suggestion</h4>
                <p className="text-indigo-700">{cliche.suggestion}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {cliches.length === 0 && !isAnalyzing && (
          <div className="text-center py-12">
            <ThumbsUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg text-gray-600">No clichés detected! Your script appears to be original.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}