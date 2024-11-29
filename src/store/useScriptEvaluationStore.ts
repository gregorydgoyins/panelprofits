import { create } from 'zustand';

interface ScriptMetrics {
  plot: number;
  characters: number;
  dialogue: number;
  pacing: number;
  originality: number;
  emotionalDepth: number;
  marketViability: number;
  genreAlignment: number;
}

interface GenreWeights {
  [key: string]: Partial<ScriptMetrics>;
}

interface EvaluationState {
  currentScript: {
    metrics: ScriptMetrics;
    genre: string;
    totalScore: number;
    listCategory: 'A' | 'B' | 'C' | null;
  };
  genreWeights: GenreWeights;
  benchmarks: {
    [genre: string]: {
      aList: ScriptMetrics;
      bList: ScriptMetrics;
    };
  };
  emotionalTrajectory: {
    scene: number;
    intensity: number;
    mood: string;
  }[];
  marketTrends: {
    genre: string;
    popularity: number;
    recentSuccesses: string[];
  }[];
  setMetrics: (metrics: Partial<ScriptMetrics>) => void;
  updateGenreWeights: (genre: string, weights: Partial<ScriptMetrics>) => void;
  calculateTotalScore: () => number;
  determineListCategory: () => 'A' | 'B' | 'C';
  addEmotionalDataPoint: (scene: number, intensity: number, mood: string) => void;
  updateMarketTrends: (trends: any[]) => void;
}

export const useScriptEvaluationStore = create<EvaluationState>((set, get) => ({
  currentScript: {
    metrics: {
      plot: 0,
      characters: 0,
      dialogue: 0,
      pacing: 0,
      originality: 0,
      emotionalDepth: 0,
      marketViability: 0,
      genreAlignment: 0
    },
    genre: '',
    totalScore: 0,
    listCategory: null
  },
  genreWeights: {
    drama: {
      emotionalDepth: 1.5,
      characters: 1.3,
      dialogue: 1.2
    },
    action: {
      pacing: 1.5,
      plot: 1.3,
      marketViability: 1.2
    },
    scifi: {
      originality: 1.5,
      worldBuilding: 1.3,
      marketViability: 1.2
    }
  },
  benchmarks: {
    drama: {
      aList: {
        plot: 90,
        characters: 95,
        dialogue: 92,
        pacing: 88,
        originality: 85,
        emotionalDepth: 95,
        marketViability: 88,
        genreAlignment: 90
      },
      bList: {
        plot: 75,
        characters: 80,
        dialogue: 78,
        pacing: 75,
        originality: 70,
        emotionalDepth: 80,
        marketViability: 75,
        genreAlignment: 78
      }
    }
  },
  emotionalTrajectory: [],
  marketTrends: [],

  setMetrics: (metrics) =>
    set((state) => ({
      currentScript: {
        ...state.currentScript,
        metrics: { ...state.currentScript.metrics, ...metrics }
      }
    })),

  updateGenreWeights: (genre, weights) =>
    set((state) => ({
      genreWeights: {
        ...state.genreWeights,
        [genre]: { ...state.genreWeights[genre], ...weights }
      }
    })),

  calculateTotalScore: () => {
    const state = get();
    const weights = state.genreWeights[state.currentScript.genre] || {};
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(state.currentScript.metrics).forEach(([key, value]) => {
      const weight = weights[key as keyof ScriptMetrics] || 1;
      totalScore += value * weight;
      totalWeight += weight;
    });

    return totalScore / totalWeight;
  },

  determineListCategory: () => {
    const state = get();
    const totalScore = state.calculateTotalScore();
    
    if (totalScore >= 85) return 'A';
    if (totalScore >= 70) return 'B';
    return 'C';
  },

  addEmotionalDataPoint: (scene, intensity, mood) =>
    set((state) => ({
      emotionalTrajectory: [
        ...state.emotionalTrajectory,
        { scene, intensity, mood }
      ]
    })),

  updateMarketTrends: (trends) =>
    set({ marketTrends: trends })
}));