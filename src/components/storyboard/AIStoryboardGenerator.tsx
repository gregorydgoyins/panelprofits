import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Wand2, Sparkles, Film, Music, Brain } from 'lucide-react';
import { useStoryboardStore } from '../../store/useStoryboardStore';
import { useAudioStore } from '../../store/useAudioStore';

export default function AIStoryboardGenerator() {
  const { frames, addFrame } = useStoryboardStore();
  const { playBackgroundMusic } = useAudioStore();
  const [selectedScene, setSelectedScene] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateEnhancedScene = async (scene) => {
    setIsGenerating(true);
    try {
      // Multi-modal generation
      const [visualResponse, audioResponse] = await Promise.all([
        // Generate visual with RunwayML
        fetch('https://api.runwayml.com/v1/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_RUNWAYML_API_KEY}`
          },
          body: JSON.stringify({
            prompt: scene.description,
            style: 'cinematic',
            params: {
              quality: 'ultra_high',
              num_frames: 1,
              guidance_scale: 8.5,
              enhance_face: true,
              enhance_lighting: true
            }
          })
        }),
        // Generate ambient soundscape
        fetch('/api/generate-soundscape', {
          method: 'POST',
          body: JSON.stringify({
            mood: scene.mood,
            intensity: scene.intensity
          })
        })
      ]);

      const [visualData, audioData] = await Promise.all([
        visualResponse.json(),
        audioResponse.json()
      ]);

      if (visualData.output && audioData.url) {
        addFrame({
          id: Date.now().toString(),
          sceneId: scene.id,
          imageUrl: visualData.output,
          audioUrl: audioData.url,
          prompt: scene.description,
          enhancedMetadata: {
            moodScore: visualData.moodScore,
            visualImpact: visualData.impactMetrics,
            audioAlignment: audioData.moodAlignment
          }
        });

        await playBackgroundMusic(audioData.url);
      }
    } catch (error) {
      console.error('Error generating enhanced scene:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-xl shadow-2xl p-8 text-white"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-600 rounded-lg">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Scene Generator</h2>
            <p className="text-indigo-200">Ultra-high fidelity scene visualization</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
            onClick={() => selectedScene && generateEnhancedScene(selectedScene)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Wand2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate Scene'}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            <Film className="w-4 h-4" />
            <span>Preview</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {frames.map((frame) => (
          <motion.div
            key={frame.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
            <img
              src={frame.imageUrl}
              alt={frame.prompt}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Music className="w-4 h-4" />
                  <span className="text-sm">Ambient Audio</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">Ultra HD</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}