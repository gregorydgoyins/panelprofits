import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Music, Volume2, Play, Square, Plus, Trash2, Settings, Waveform } from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';
import WaveSurfer from 'wavesurfer.js';

const ARTLIST_CATEGORIES = {
  music: ['Dramatic', 'Uplifting', 'Tense', 'Emotional', 'Epic'],
  foley: ['Footsteps', 'Doors', 'Nature', 'Urban', 'Objects'],
  ambient: ['Room Tone', 'Cityscape', 'Nature', 'Weather', 'Machinery']
};

export default function SoundDesigner() {
  const {
    tracks,
    addTrack,
    removeTrack,
    playTrack,
    stopTrack,
    setTrackVolume,
    toggleLoop,
    playAll,
    stopAll
  } = useAudioStore();

  const [selectedCategory, setSelectedCategory] = useState('music');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const waveformRefs = useRef<{ [key: string]: WaveSurfer }>({});

  const initializeWaveform = (trackId: string, audioUrl: string) => {
    if (waveformRefs.current[trackId]) return;

    const wavesurfer = WaveSurfer.create({
      container: `#waveform-${trackId}`,
      waveColor: '#4F46E5',
      progressColor: '#818CF8',
      cursorColor: '#4F46E5',
      barWidth: 2,
      barRadius: 3,
      responsive: true,
      height: 60,
    });

    wavesurfer.load(audioUrl);
    waveformRefs.current[trackId] = wavesurfer;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Music className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">Sound Designer</h3>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => playAll()}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Play className="w-4 h-4" />
            <span>Play All</span>
          </button>
          <button
            onClick={() => stopAll()}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Square className="w-4 h-4" />
            <span>Stop</span>
          </button>
        </div>
      </div>

      {/* Category Selection */}
      <div className="flex space-x-4 mb-6">
        {Object.keys(ARTLIST_CATEGORIES).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Subcategory Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ARTLIST_CATEGORIES[selectedCategory].map((subcat) => (
          <button
            key={subcat}
            onClick={() => setSelectedSubcategory(subcat)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedSubcategory === subcat
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {subcat}
          </button>
        ))}
      </div>

      {/* Track List */}
      <div className="space-y-4">
        {tracks.map((track) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="border rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => playTrack(track.id)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
                >
                  <Play className="w-4 h-4" />
                </button>
                <div>
                  <h4 className="font-medium">{track.name}</h4>
                  <span className="text-sm text-gray-500">{track.type}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={track.volume}
                    onChange={(e) => setTrackVolume(track.id, parseFloat(e.target.value))}
                    className="w-24"
                  />
                </div>
                <button
                  onClick={() => toggleLoop(track.id)}
                  className={`p-2 rounded-full ${
                    track.loop ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-indigo-600'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeTrack(track.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div
              id={`waveform-${track.id}`}
              className="w-full"
              onMouseEnter={() => initializeWaveform(track.id, track.url)}
            />
          </motion.div>
        ))}
      </div>

      {/* Add Track Button */}
      <button
        onClick={() => {
          // This would typically open a modal or trigger the Artlist API
          console.log('Add track from', selectedCategory, selectedSubcategory);
        }}
        className="mt-6 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-300 hover:text-indigo-600 flex items-center justify-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>Add {selectedCategory} Track</span>
      </button>
    </motion.div>
  );
}