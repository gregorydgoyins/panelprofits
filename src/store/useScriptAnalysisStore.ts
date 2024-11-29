import { create } from 'zustand';

interface ClicheDetection {
  id: string;
  phrase: string;
  type: 'dialogue' | 'plot' | 'character' | 'scene';
  context: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
  lineNumber: number;
}

interface PitchAnalysis {
  overallScore: number;
  uniqueElements: {
    element: string;
    impact: number;
    marketAppeal: number;
  }[];
  marketFit: {
    genre: string;
    currentTrend: number;
    projectedTrend: number;
    comparableProjects: string[];
  };
  strengths: string[];
  improvements: string[];
  targetDemographics: string[];
  estimatedBudgetRange: {
    min: number;
    max: number;
  };
}

interface ScriptAnalysisState {
  cliches: ClicheDetection[];
  pitchAnalysis: PitchAnalysis | null;
  isAnalyzing: boolean;
  detectCliches: (content: string) => Promise<void>;
  analyzePitchProbability: (script: any) => Promise<void>;
  clearAnalysis: () => void;
}

export const useScriptAnalysisStore = create<ScriptAnalysisState>((set) => ({
  cliches: [],
  pitchAnalysis: null,
  isAnalyzing: false,

  detectCliches: async (content) => {
    set({ isAnalyzing: true });
    try {
      // Simulated API call - replace with actual API integration
      const detectedCliches: ClicheDetection[] = [
        {
          id: '1',
          phrase: "It was a dark and stormy night",
          type: 'scene',
          context: "Opening scene description",
          suggestion: "Consider a more unique weather description or different opening approach",
          severity: 'high',
          lineNumber: 1
        },
        {
          id: '2',
          phrase: "I've been expecting you",
          type: 'dialogue',
          context: "Villain's first appearance",
          suggestion: "Subvert the typical villain introduction with unexpected behavior",
          severity: 'medium',
          lineNumber: 45
        }
      ];
      set({ cliches: detectedCliches });
    } catch (error) {
      console.error('Error detecting cliches:', error);
    } finally {
      set({ isAnalyzing: false });
    }
  },

  analyzePitchProbability: async (script) => {
    set({ isAnalyzing: true });
    try {
      // Simulated API call - replace with actual API integration
      const analysis: PitchAnalysis = {
        overallScore: 85,
        uniqueElements: [
          {
            element: "Non-linear timeline structure",
            impact: 8.5,
            marketAppeal: 7.8
          },
          {
            element: "Genre-blending approach",
            impact: 9.0,
            marketAppeal: 8.2
          }
        ],
        marketFit: {
          genre: "Psychological Thriller",
          currentTrend: 8.5,
          projectedTrend: 9.2,
          comparableProjects: [
            "Inception",
            "Shutter Island",
            "Black Swan"
          ]
        },
        strengths: [
          "Strong character development",
          "Unique premise",
          "Commercial viability"
        ],
        improvements: [
          "Consider strengthening the third act",
          "Potential for more visual set pieces"
        ],
        targetDemographics: [
          "18-34 urban professionals",
          "Mystery/thriller enthusiasts",
          "Art-house cinema fans"
        ],
        estimatedBudgetRange: {
          min: 15000000,
          max: 35000000
        }
      };
      set({ pitchAnalysis: analysis });
    } catch (error) {
      console.error('Error analyzing pitch probability:', error);
    } finally {
      set({ isAnalyzing: false });
    }
  },

  clearAnalysis: () => set({ cliches: [], pitchAnalysis: null })
}));