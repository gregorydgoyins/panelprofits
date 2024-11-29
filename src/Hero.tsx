import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Pen, BookOpen, Users, Wand2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const FloatingIcon = ({ Icon, delay, x, y }: { Icon: React.ElementType; delay: number; x: number; y: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.2, 1],
      x: [x, x + Math.random() * 50 - 25, x],
      y: [y, y + Math.random() * 50 - 25, y],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay: delay,
    }}
    className="absolute"
    style={{
      left: `${x}%`,
      top: `${y}%`,
    }}
  >
    <Icon className="w-8 h-8 text-indigo-400/30" />
  </motion.div>
);

export default function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleDemoClick = () => {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
      demoSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const floatingIcons = [
    { Icon: Brain, delay: 0, x: 20, y: 30 },
    { Icon: Sparkles, delay: 0.8, x: 80, y: 20 },
    { Icon: Pen, delay: 1.6, x: 30, y: 70 },
    { Icon: BookOpen, delay: 2.4, x: 70, y: 60 },
    { Icon: Users, delay: 3.2, x: 50, y: 40 }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900/90" />
        <video
          autoPlay
          muted
          loop
          playsInline
          className="object-cover w-full h-full opacity-40"
        >
          <source src="https://videos.ctfassets.net/your-video-id/writer-inspiration.mp4" type="video/mp4" />
          <img 
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
            alt="Writer's workspace"
            className="object-cover w-full h-full"
          />
        </video>
      </div>

      <div className="absolute inset-0 z-10">
        {floatingIcons.map((icon, i) => (
          <FloatingIcon key={i} {...icon} />
        ))}
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-12 items-center"
        >
          <div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white"
            >
              <span className="block mb-2">Transform</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient">
                Your Writing Journey
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-xl md:text-2xl text-gray-300 max-w-3xl font-light leading-relaxed"
            >
              Harness the power of AI to bring your stories to life. From concept to completion, create with intelligent assistance that understands your creative vision.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row gap-6 lg:justify-start justify-center"
            >
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/25 text-lg"
              >
                <Wand2 className="w-6 h-6" />
                <span>Start Creating</span>
              </button>

              <button
                onClick={handleDemoClick}
                className="px-8 py-4 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transform hover:scale-105 transition-all flex items-center justify-center space-x-2 border border-gray-700 text-lg"
              >
                <BookOpen className="w-6 h-6" />
                <span>Watch Demo</span>
              </button>
            </motion.div>
          </div>

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-12 lg:mt-0"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-20 animate-pulse" />
              <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Brain className="w-5 h-5" />
                    <span>AI Assistant Active</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                      className="h-4 bg-gray-700 rounded"
                      style={{ width: ['75%', '50%', '85%'][i] }}
                    />
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 p-4 bg-indigo-500/20 rounded-lg border border-indigo-500/30"
                >
                  <div className="flex items-center space-x-2 text-indigo-300 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm">AI Suggestion</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Consider adding more emotional depth to this scene...
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}