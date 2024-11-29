import { create } from 'zustand';

interface ScriptScore {
  total: number;
  categories: {
    plot: number;
    characters: number;
    dialogue: number;
    structure: number;
    pacing: number;
  };
  feedback: string[];
}

interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'visualization' | 'audio' | 'pitch' | 'analysis';
  requiredScore: number;
  unlocked: boolean;
  previewUrl?: string;
}

interface ProducerBotState {
  currentScore: ScriptScore;
  rewards: Reward[];
  milestones: {
    current: number;
    next: number;
    progress: number;
  };
  updateScore: (newScore: Partial<ScriptScore>) => void;
  checkRewards: () => Reward[];
  unlockReward: (rewardId: string) => void;
  getNextMilestone: () => number;
}

export const useProducerBotStore = create<ProducerBotState>((set, get) => ({
  currentScore: {
    total: 0,
    categories: {
      plot: 0,
      characters: 0,
      dialogue: 0,
      structure: 0,
      pacing: 0
    },
    feedback: []
  },
  rewards: [
    {
      id: 'basic-storyboard',
      name: 'Basic Storyboard Generation',
      description: 'Generate simple storyboards for key scenes using RunwayML',
      type: 'visualization',
      requiredScore: 60,
      unlocked: false
    },
    {
      id: 'character-voices',
      name: 'Character Voice Generation',
      description: 'Create unique voices for your characters using ElevenLabs',
      type: 'audio',
      requiredScore: 70,
      unlocked: false
    },
    {
      id: 'advanced-storyboard',
      name: 'Advanced Storyboard Suite',
      description: 'Full scene visualization with advanced RunwayML features',
      type: 'visualization',
      requiredScore: 75,
      unlocked: false
    },
    {
      id: 'pitch-deck',
      name: 'AI-Enhanced Pitch Deck',
      description: 'Professional pitch deck with Unsplash Plus imagery',
      type: 'pitch',
      requiredScore: 80,
      unlocked: false
    },
    {
      id: 'scene-preview',
      name: 'Scene Preview Generator',
      description: 'Generate short video previews using Motion Array',
      type: 'visualization',
      requiredScore: 85,
      unlocked: false
    },
    {
      id: 'full-table-read',
      name: 'Full Table Read Experience',
      description: 'Complete table read with ElevenLabs character voices',
      type: 'audio',
      requiredScore: 88,
      unlocked: false
    },
    {
      id: 'premium-pitch',
      name: 'Premium Pitch Package',
      description: 'Complete pitch package with video, audio, and visuals',
      type: 'pitch',
      requiredScore: 92,
      unlocked: false
    },
    {
      id: 'executive-suite',
      name: 'Executive Production Suite',
      description: 'Full production visualization and presentation package',
      type: 'pitch',
      requiredScore: 95,
      unlocked: false
    }
  ],
  milestones: {
    current: 0,
    next: 60,
    progress: 0
  },

  updateScore: (newScore) => {
    set((state) => {
      const updatedScore = {
        ...state.currentScore,
        ...newScore,
        categories: {
          ...state.currentScore.categories,
          ...(newScore.categories || {})
        }
      };

      // Calculate progress to next milestone
      const nextMilestone = state.rewards.find(r => !r.unlocked)?.requiredScore || 100;
      const progress = (updatedScore.total / nextMilestone) * 100;

      return {
        currentScore: updatedScore,
        milestones: {
          current: state.milestones.current,
          next: nextMilestone,
          progress: Math.min(progress, 100)
        }
      };
    });
  },

  checkRewards: () => {
    const state = get();
    const { currentScore, rewards } = state;
    
    return rewards.filter(reward => 
      currentScore.total >= reward.requiredScore && !reward.unlocked
    );
  },

  unlockReward: (rewardId) => {
    set((state) => ({
      rewards: state.rewards.map(reward =>
        reward.id === rewardId ? { ...reward, unlocked: true } : reward
      )
    }));
  },

  getNextMilestone: () => {
    const state = get();
    const nextReward = state.rewards.find(r => !r.unlocked);
    return nextReward?.requiredScore || 100;
  }
}));