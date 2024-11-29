import { create } from 'zustand';

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'foundational' | 'intermediate' | 'advanced';
  aiTools: {
    id: string;
    name: string;
    description: string;
    type: 'analysis' | 'generation' | 'feedback' | 'visualization';
    memberOnly: boolean;
  }[];
  exercises: {
    id: string;
    title: string;
    type: 'practice' | 'analysis' | 'creation';
    description: string;
    aiAssisted: boolean;
  }[];
  resources: {
    id: string;
    title: string;
    type: 'video' | 'text' | 'template' | 'case-study' | 'ai-analysis';
    url: string;
    memberOnly: boolean;
  }[];
}

// Extended course data with AI integration
const ENHANCED_MODULES = [
  {
    id: 'story-foundations',
    title: 'Story Architecture Fundamentals',
    description: 'Master the core principles of storytelling with AI assistance',
    duration: '4 weeks',
    level: 'foundational',
    aiTools: [
      {
        id: 'story-analyzer',
        name: 'Story Structure Analyzer',
        description: 'AI analysis of your story structure against classic patterns',
        type: 'analysis',
        memberOnly: true
      },
      {
        id: 'plot-generator',
        name: 'Plot Point Generator',
        description: 'AI-powered plot development suggestions',
        type: 'generation',
        memberOnly: true
      }
    ],
    exercises: [
      {
        id: 'story-analysis',
        title: 'AI-Assisted Story Analysis',
        type: 'analysis',
        description: 'Analyze your story with our AI tools',
        aiAssisted: true
      }
    ],
    resources: [
      {
        id: 'ai-storytelling',
        title: 'AI in Modern Storytelling',
        type: 'video',
        url: '/courses/ai-storytelling',
        memberOnly: true
      }
    ]
  },
  {
    id: 'character-mastery',
    title: 'Character Development & Psychology',
    description: 'Create deep, memorable characters with psychological insights',
    duration: '6 weeks',
    level: 'intermediate',
    aiTools: [
      {
        id: 'character-analyzer',
        name: 'Character Consistency Checker',
        description: 'AI analysis of character behavior and development',
        type: 'analysis',
        memberOnly: true
      },
      {
        id: 'dialogue-enhancer',
        name: 'Dialogue Enhancement Tool',
        description: 'AI suggestions for natural, character-specific dialogue',
        type: 'generation',
        memberOnly: true
      }
    ],
    exercises: [
      {
        id: 'character-profile',
        title: 'AI-Enhanced Character Profiling',
        type: 'creation',
        description: 'Build detailed character profiles with AI assistance',
        aiAssisted: true
      }
    ],
    resources: []
  },
  {
    id: 'advanced-plotting',
    title: 'Advanced Plot Structures',
    description: 'Master complex plot structures and subplots',
    duration: '8 weeks',
    level: 'advanced',
    aiTools: [
      {
        id: 'plot-analyzer',
        name: 'Plot Complexity Analyzer',
        description: 'AI analysis of plot interconnections and pacing',
        type: 'analysis',
        memberOnly: true
      }
    ],
    exercises: [],
    resources: []
  },
  {
    id: 'visual-storytelling',
    title: 'Visual Storytelling & Storyboarding',
    description: 'Transform written scenes into visual narratives',
    duration: '6 weeks',
    level: 'intermediate',
    aiTools: [
      {
        id: 'scene-visualizer',
        name: 'AI Scene Visualizer',
        description: 'Generate storyboards from scene descriptions',
        type: 'visualization',
        memberOnly: true
      }
    ],
    exercises: [],
    resources: []
  },
  {
    id: 'market-analysis',
    title: 'Market Analysis & Positioning',
    description: 'Understand your audience and market position',
    duration: '4 weeks',
    level: 'advanced',
    aiTools: [
      {
        id: 'market-analyzer',
        name: 'Market Trend Analyzer',
        description: 'AI analysis of market trends and audience preferences',
        type: 'analysis',
        memberOnly: true
      }
    ],
    exercises: [],
    resources: []
  }
];

interface CourseState {
  modules: Module[];
  currentModule: string | null;
  progress: Record<string, number>;
  membership: {
    status: 'free' | 'premium' | 'enterprise';
    aiCredits: number;
    projectsAnalyzed: number;
  };
  setCurrentModule: (moduleId: string) => void;
  updateProgress: (moduleId: string, progress: number) => void;
  useAICredit: () => boolean;
  upgradeMembership: (level: 'premium' | 'enterprise') => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  modules: ENHANCED_MODULES,
  currentModule: null,
  progress: {},
  membership: {
    status: 'free',
    aiCredits: 0,
    projectsAnalyzed: 0
  },
  setCurrentModule: (moduleId) => set({ currentModule: moduleId }),
  updateProgress: (moduleId, progress) =>
    set((state) => ({
      progress: { ...state.progress, [moduleId]: progress }
    })),
  useAICredit: () => {
    const state = get();
    if (state.membership.aiCredits > 0) {
      set((state) => ({
        membership: {
          ...state.membership,
          aiCredits: state.membership.aiCredits - 1
        }
      }));
      return true;
    }
    return false;
  },
  upgradeMembership: (level) =>
    set((state) => ({
      membership: {
        ...state.membership,
        status: level,
        aiCredits: level === 'premium' ? 100 : 500
      }
    }))
}));