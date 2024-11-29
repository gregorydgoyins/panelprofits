import { create } from 'zustand';

interface EnhancedProducerState {
  aiAnalysis: {
    gpt4: {
      enabled: boolean;
      credits: number;
      suggestions: string[];
    };
    claude: {
      enabled: boolean;
      credits: number;
      analysis: string[];
    };
    anthropic: {
      enabled: boolean;
      credits: number;
      ethicalGuidelines: string[];
    };
  };
  visualization: {
    threejs: {
      enabled: boolean;
      scenes: any[];
    };
    ar: {
      enabled: boolean;
      models: any[];
    };
    runwayml: {
      enabled: boolean;
      storyboards: any[];
    };
  };
  audio: {
    elevenlabs: {
      enabled: boolean;
      voices: any[];
      readings: any[];
    };
    ambient: {
      enabled: boolean;
      sounds: any[];
    };
    music: {
      enabled: boolean;
      suggestions: any[];
    };
  };
  research: {
    loc: {
      enabled: boolean;
      resources: any[];
    };
    ampas: {
      enabled: boolean;
      screenplays: any[];
    };
    tropes: {
      enabled: boolean;
      analysis: any[];
    };
  };
  gamification: {
    rewards: {
      points: number;
      badges: string[];
      achievements: string[];
    };
    challenges: {
      active: any[];
      completed: any[];
    };
    leaderboard: {
      global: any[];
      genre: any[];
    };
  };
}

export const useEnhancedProducerStore = create<EnhancedProducerState>(() => ({
  aiAnalysis: {
    gpt4: {
      enabled: true,
      credits: 100,
      suggestions: [],
    },
    claude: {
      enabled: true,
      credits: 100,
      analysis: [],
    },
    anthropic: {
      enabled: true,
      credits: 100,
      ethicalGuidelines: [],
    },
  },
  visualization: {
    threejs: {
      enabled: true,
      scenes: [],
    },
    ar: {
      enabled: true,
      models: [],
    },
    runwayml: {
      enabled: true,
      storyboards: [],
    },
  },
  audio: {
    elevenlabs: {
      enabled: true,
      voices: [],
      readings: [],
    },
    ambient: {
      enabled: true,
      sounds: [],
    },
    music: {
      enabled: true,
      suggestions: [],
    },
  },
  research: {
    loc: {
      enabled: true,
      resources: [],
    },
    ampas: {
      enabled: true,
      screenplays: [],
    },
    tropes: {
      enabled: true,
      analysis: [],
    },
  },
  gamification: {
    rewards: {
      points: 0,
      badges: [],
      achievements: [],
    },
    challenges: {
      active: [],
      completed: [],
    },
    leaderboard: {
      global: [],
      genre: [],
    },
  },
}));