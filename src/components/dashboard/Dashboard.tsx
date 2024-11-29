import React from 'react';
import { motion } from 'framer-motion';
import { Routes, Route, Link } from 'react-router-dom';
import { WritingEditor } from '../writing/WritingEditor';
import { AIAssistant } from '../writing/AIAssistant';
import CharacterPanel from '../writing/CharacterPanel';
import PlotStructure from '../writing/PlotStructure';
import Timeline from '../writing/Timeline';
import SceneManager from '../writing/SceneManager';
import StoryboardGenerator from '../storyboard/StoryboardGenerator';
import AIStoryboardGenerator from '../storyboard/AIStoryboardGenerator';
import CharacterRelationships from '../writing/CharacterRelationships';
import SoundDesigner from '../audio/SoundDesigner';
import ProducerDashboard from '../producer/ProducerDashboard';
import { Brain, Pen, Camera, Music, Users, Star } from 'lucide-react';

const navItems = [
  { path: "/dashboard", label: "Writing", icon: Pen },
  { path: "/dashboard/storyboard", label: "Storyboard", icon: Camera },
  { path: "/dashboard/characters", label: "Characters", icon: Users },
  { path: "/dashboard/audio", label: "Sound Design", icon: Music },
  { path: "/dashboard/producer", label: "Producer Tools", icon: Star },
  { path: "/dashboard/ai", label: "AI Assistant", icon: Brain }
];

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-wrap gap-4">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      <Routes>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-8">
              <WritingEditor />
              <Timeline />
            </div>
            <div className="space-y-8">
              <AIAssistant />
              <CharacterPanel />
              <PlotStructure />
            </div>
          </motion.div>
        } />
        <Route path="/storyboard" element={
          <div className="space-y-8">
            <StoryboardGenerator />
            <AIStoryboardGenerator />
          </div>
        } />
        <Route path="/characters" element={
          <div className="space-y-8">
            <CharacterPanel />
            <CharacterRelationships />
          </div>
        } />
        <Route path="/audio" element={<SoundDesigner />} />
        <Route path="/producer" element={<ProducerDashboard />} />
      </Routes>
    </div>
  );
}