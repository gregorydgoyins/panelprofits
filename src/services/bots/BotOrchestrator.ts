import { create } from 'zustand';
import { WritingCoachBot } from './WritingCoachBot';
import { ResearchBot } from './ResearchBot';
import { AudioBot } from './AudioBot';
import { VisualBot } from './VisualBot';
import { OptimizationBot } from './OptimizationBot';

interface BotMetrics {
  tasksCompleted: number;
  successRate: number;
  averageResponseTime: number;
}

interface Bot {
  id: string;
  name: string;
  type: 'research' | 'writing' | 'analysis' | 'audio' | 'visual' | 'optimization';
  status: 'idle' | 'active' | 'learning' | 'error';
  capabilities: string[];
  lastActive: Date | null;
  metrics: BotMetrics;
}

interface BotState {
  bots: Bot[];
  activeBots: string[];
  isInitialized: boolean;
  initializeBots: () => Promise<void>;
  activateBot: (id: string) => void;
  deactivateBot: (id: string) => void;
  updateBotMetrics: (id: string, metrics: Partial<BotMetrics>) => void;
  getBotInstance: (type: Bot['type']) => any;
}

const botInstances = {
  writing: new WritingCoachBot(),
  research: new ResearchBot(),
  audio: new AudioBot(),
  visual: new VisualBot(),
  optimization: new OptimizationBot()
};

export const useBotStore = create<BotState>((set, get) => ({
  bots: [
    {
      id: 'writing-coach',
      name: 'Writing Coach',
      type: 'writing',
      status: 'idle',
      capabilities: [
        'Style suggestions',
        'Grammar checking',
        'Plot hole detection',
        'Character consistency'
      ],
      lastActive: null,
      metrics: {
        tasksCompleted: 0,
        successRate: 0,
        averageResponseTime: 0
      }
    },
    {
      id: 'research',
      name: 'Research Assistant',
      type: 'research',
      status: 'idle',
      capabilities: [
        'Market analysis',
        'Genre research',
        'Trend identification',
        'Comparative analysis'
      ],
      lastActive: null,
      metrics: {
        tasksCompleted: 0,
        successRate: 0,
        averageResponseTime: 0
      }
    },
    {
      id: 'audio',
      name: 'Audio Engineer',
      type: 'audio',
      status: 'idle',
      capabilities: [
        'Voice synthesis',
        'Soundtrack generation',
        'Sound effects',
        'Audio mixing'
      ],
      lastActive: null,
      metrics: {
        tasksCompleted: 0,
        successRate: 0,
        averageResponseTime: 0
      }
    },
    {
      id: 'visual',
      name: 'Visual Director',
      type: 'visual',
      status: 'idle',
      capabilities: [
        'Character design',
        'Location scouting',
        'Scene visualization',
        'Storyboard generation'
      ],
      lastActive: null,
      metrics: {
        tasksCompleted: 0,
        successRate: 0,
        averageResponseTime: 0
      }
    }
  ],
  activeBots: [],
  isInitialized: false,

  initializeBots: async () => {
    try {
      // Initialize bots in parallel with a timeout
      await Promise.race([
        Promise.all(
          Object.values(botInstances).map(bot => 
            Promise.resolve(bot.initialize()).catch(err => {
              console.error('Bot initialization error:', err);
              return false;
            })
          )
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Bot initialization timeout')), 5000)
        )
      ]);

      set({ isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize bots:', error);
      // Continue with partial initialization
      set({ isInitialized: true });
    }
  },

  activateBot: (id) => set((state) => ({
    activeBots: [...state.activeBots, id],
    bots: state.bots.map(bot => 
      bot.id === id 
        ? { ...bot, status: 'active', lastActive: new Date() }
        : bot
    )
  })),

  deactivateBot: (id) => set((state) => ({
    activeBots: state.activeBots.filter(botId => botId !== id),
    bots: state.bots.map(bot =>
      bot.id === id
        ? { ...bot, status: 'idle' }
        : bot
    )
  })),

  updateBotMetrics: (id, metrics) => set((state) => ({
    bots: state.bots.map(bot =>
      bot.id === id
        ? {
            ...bot,
            metrics: { ...bot.metrics, ...metrics }
          }
        : bot
    )
  })),

  getBotInstance: (type) => {
    return botInstances[type] || null;
  }
}));