import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Brain, Sparkles, Users, Wand2, BookOpen, PenTool, MessageSquare } from 'lucide-react';
import { useWritingStore } from '../store/useWritingStore';

export default function InteractiveDemo() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [activeStep, setActiveStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<string[]>([]);

  const demoSteps = [
    {
      title: "AI-Powered Brainstorming",
      description: "Watch as AI helps develop your story concept in real-time",
      icon: Brain,
      preview: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=2400&q=80",
      placeholder: "Enter a story concept or idea...",
      sampleOutput: [
        "Consider exploring themes of redemption and identity",
        "The protagonist's internal conflict could mirror external chaos",
        "Try incorporating elements of magical realism",
        "Build tension through environmental symbolism"
      ]
    },
    {
      title: "Character Development",
      description: "Create deep, consistent characters with AI assistance",
      icon: Users,
      preview: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2400&q=80",
      placeholder: "Describe your character's basic traits...",
      sampleOutput: [
        "Consider their childhood influences",
        "Add a unique personality quirk",
        "Develop a meaningful internal conflict",
        "Create a signature behavioral pattern"
      ]
    },
    {
      title: "Scene Analysis",
      description: "Get instant feedback on your scene structure",
      icon: MessageSquare,
      preview: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=2400&q=80",
      placeholder: "Write a brief scene description...",
      sampleOutput: [
        "Strong visual imagery in the opening",
        "Consider adding more sensory details",
        "Good pacing, but tension could be heightened",
        "Try incorporating more character reactions"
      ]
    }
  ];

  const handleGenerate = async () => {
    if (!userInput.trim()) return;

    setIsGenerating(true);
    setFeedback([]);
    
    // Simulate AI generation with progressive feedback
    const outputs = demoSteps[activeStep].sampleOutput;
    for (let i = 0; i < outputs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setFeedback(prev => [...prev, outputs[i]]);
    }
    
    setIsGenerating(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 to-indigo-900" id="demo">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Experience AI-Powered Writing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300"
          >
            See how our AI transforms your writing process in real-time
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Interactive Demo Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
          >
            <div className="flex items-center space-x-4 mb-8">
              {demoSteps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveStep(index);
                    setFeedback([]);
                    setUserInput('');
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeStep === index
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                  <span className="hidden md:inline">{step.title}</span>
                </button>
              ))}
            </div>

            <div className="relative h-[400px] rounded-xl overflow-hidden">
              <img
                src={demoSteps[activeStep].preview}
                alt={demoSteps[activeStep].title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white">
                      {demoSteps[activeStep].title}
                    </h3>
                    <p className="text-gray-200">
                      {demoSteps[activeStep].description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Live Demo Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ delay: 0.8 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Live Preview</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-gray-300 text-sm">AI Active</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Your Input</label>
                <textarea
                  value={userInput}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder={demoSteps[activeStep].placeholder}
                  className="w-full h-32 bg-white/5 rounded-lg p-4 border border-white/10 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm">AI Suggestions</label>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 min-h-[200px]">
                  {isGenerating ? (
                    <div className="flex items-center justify-center h-24">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {feedback.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="flex items-start space-x-2"
                        >
                          <Sparkles className="w-4 h-4 text-indigo-400 mt-1" />
                          <p className="text-gray-200">{suggestion}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={isGenerating || !userInput.trim()}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>{isGenerating ? 'Generating...' : 'Generate Suggestions'}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}