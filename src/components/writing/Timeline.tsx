import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Flag } from 'lucide-react';
import { useWritingStore } from '../../store/useWritingStore';

export default function Timeline() {
  const { plotPoints } = useWritingStore();

  const acts = [1, 2, 3].map(act => ({
    number: act,
    points: plotPoints.filter(point => point.act === act)
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-xl p-6"
    >
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold">Story Timeline</h3>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        {acts.map((act, actIndex) => (
          <div key={act.number} className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                {act.number}
              </div>
              <h4 className="ml-4 font-medium">Act {act.number}</h4>
            </div>
            
            {act.points.map((point, pointIndex) => (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: pointIndex * 0.1 }}
                className="ml-4 pl-8 pb-4 relative"
              >
                <div className="absolute left-0 top-3 w-4 h-4 rounded-full border-2 border-indigo-600 bg-white" />
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium">{point.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{point.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ))}

        <div className="absolute left-2 bottom-0">
          <Flag className="w-6 h-6 text-indigo-600" />
        </div>
      </div>
    </motion.div>
  );
}