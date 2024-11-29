import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Film, Music, Plus, RefreshCw, Check, X, Video, Palette, Wand2 } from 'lucide-react';
import { useWritingStore } from '../../store/useWritingStore';
import { useStoryboardStore } from '../../store/useStoryboardStore';

const RUNWAY_API_KEY = "key_6d11ee1dfdf60aa92318b7afe328405c9b3d9ef8a771915e2f2b320acdf1fa04c89684ff80d5983700c732278b001c20c5397c5cc731af81be32d76d80093658";

export default function StoryboardGenerator() {
  const { scenes } = useWritingStore();
  const { frames, addFrame, updateFrame } = useStoryboardStore();
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStyle, setGenerationStyle] = useState('cinematic');

  const styleOptions = [
    { value: 'cinematic', label: 'Cinematic', description: 'Hollywood-style frames' },
    { value: 'anime', label: 'Anime', description: 'Japanese animation style' },
    { value: 'noir', label: 'Film Noir', description: 'Classic black & white' },
    { value: 'experimental', label: 'Experimental', description: 'AI-driven artistic fusion' }
  ];

  const generateStoryboardFrame = async (sceneId: string) => {
    setIsGenerating(true);
    const scene = scenes.find(s => s.id === sceneId);
    
    try {
      if (!scene) return;

      const response = await fetch('https://api.runwayml.com/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RUNWAY_API_KEY}`
        },
        body: JSON.stringify({
          prompt: scene.description,
          style: generationStyle,
          params: {
            quality: 'high',
            num_frames: 1,
            guidance_scale: 7.5
          }
        })
      });

      const data = await response.json();

      if (data.output) {
        addFrame({
          id: Date.now().toString(),
          sceneId,
          imageUrl: data.output,
          prompt: scene.description,
          description: scene.description,
          notes: '',
          status: 'generated'
        });
      }
    } catch (error) {
      console.error('Error generating storyboard:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">AI Storyboard Generator</h3>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={generationStyle}
            onChange={(e) => setGenerationStyle(e.target.value)}
            className="p-2 border rounded-lg text-sm"
          >
            {styleOptions.map(style => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => selectedScene && generateStoryboardFrame(selectedScene)}
            disabled={!selectedScene || isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            <span>Generate Frame</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenes.map(scene => (
          <div
            key={scene.id}
            onClick={() => setSelectedScene(scene.id)}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedScene === scene.id ? 'border-indigo-500 bg-indigo-50' : 'hover:border-indigo-200'
            }`}
          >
            <h4 className="font-medium mb-2">{scene.title}</h4>
            <p className="text-sm text-gray-600 mb-4">{scene.description}</p>
            {frames.filter(f => f.sceneId === scene.id).map(frame => (
              <div key={frame.id} className="relative aspect-video rounded-lg overflow-hidden">
                <img
                  src={frame.imageUrl}
                  alt={frame.description}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}