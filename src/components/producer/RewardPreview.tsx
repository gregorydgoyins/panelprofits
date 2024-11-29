import React from 'react';
import { motion } from 'framer-motion';
import { Play, Download, Share2 } from 'lucide-react';
import { useProducerBotStore } from '../../store/useProducerBotStore';

export default function RewardPreview({ rewardId }: { rewardId: string }) {
  const { rewards } = useProducerBotStore();
  const reward = rewards.find(r => r.id === rewardId);

  if (!reward) return null;

  const previewContent = {
    visualization: (
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <img
          src={reward.previewUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728'}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      </div>
    ),
    audio: (
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <button className="p-3 bg-indigo-600 rounded-full text-white">
            <Play className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-full w-1/3 bg-indigo-600 rounded-full" />
            </div>
            <div className="mt-2 flex justify-between text-sm text-gray-600">
              <span>0:00</span>
              <span>2:30</span>
            </div>
          </div>
        </div>
      </div>
    ),
    pitch: (
      <div className="grid grid-cols-2 gap-4">
        <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1485846234645-a62644f84728"
            alt="Pitch Preview"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
        </div>
      </div>
    ),
    analysis: (
      <div className="space-y-4">
        <div className="h-40 bg-gray-100 rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gray-100 rounded-lg" />
          <div className="h-20 bg-gray-100 rounded-lg" />
        </div>
      </div>
    )
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{reward.name}</h3>
          <p className="text-sm text-gray-600">{reward.description}</p>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-600 hover:text-indigo-600 rounded-full">
            <Download className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-indigo-600 rounded-full">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        {previewContent[reward.type]}
      </div>

      <div className="flex justify-end space-x-4">
        <button className="px-4 py-2 text-gray-600 hover:text-indigo-600">
          Preview
        </button>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Generate Full Version
        </button>
      </div>
    </motion.div>
  );
}