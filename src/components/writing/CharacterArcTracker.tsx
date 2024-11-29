import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, User } from 'lucide-react';
import { useWritingStore } from '../../store/useWritingStore';

export default function CharacterArcTracker() {
  const { characters, scenes, plotPoints } = useWritingStore();

  const getCharacterScenes = (characterId: string) => {
    return scenes
      .filter(scene => scene.characters.includes(characterId))
      .sort((a, b) => {
        const aPlotPoint = plotPoints.find(p => p.id === a.plotPointId);
        const bPlotPoint = plotPoints.find(p => p.id === b.plotPointId);
        return (aPlotPoint?.order || 0) - (bPlotPoint?.order || 0);
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-xl p-6"
    >
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold">Character Arcs</h3>
      </div>

      <div className="space-y-8">
        {characters.map(character => {
          const characterScenes = getCharacterScenes(character.id);
          
          return (
            <div key={character.id} className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-indigo-600" />
                <h4 className="font-medium">{character.name}</h4>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                
                {characterScenes.map((scene, index) => {
                  const plotPoint = plotPoints.find(p => p.id === scene.plotPointId);
                  
                  return (
                    <motion.div
                      key={scene.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="ml-4 pl-8 pb-4 relative"
                    >
                      <div className="absolute left-0 top-3 w-4 h-4 rounded-full border-2 border-indigo-600 bg-white" />
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">{scene.title}</h5>
                          {plotPoint && (
                            <span className="text-xs text-indigo-600">
                              Act {plotPoint.act}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{scene.description}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          <span>{scene.location}</span> • <span>{scene.timeOfDay}</span> •{' '}
                          <span>{scene.mood}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}