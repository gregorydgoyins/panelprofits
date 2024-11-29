import { create } from 'zustand';

interface ResearchResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'course' | 'example' | 'template' | 'analysis';
  category: 'screenwriting' | 'character' | 'plot' | 'dialogue' | 'genre' | 'structure';
  content: string;
  url?: string;
  tags: string[];
  aiSummary?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  relevanceScore?: number;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  resources: string[];
  progress: number;
  completed: boolean;
}

interface ResearchState {
  resources: ResearchResource[];
  learningPaths: LearningPath[];
  currentGenre?: string;
  currentTopic?: string;
  searchHistory: string[];
  recommendations: ResearchResource[];
  addResource: (resource: ResearchResource) => void;
  addLearningPath: (path: LearningPath) => void;
  updateProgress: (pathId: string, progress: number) => void;
  setCurrentGenre: (genre: string) => void;
  setCurrentTopic: (topic: string) => void;
  searchResources: (query: string) => Promise<ResearchResource[]>;
  getRecommendations: () => ResearchResource[];
}

// Sample data for demonstration
const sampleResources: ResearchResource[] = [
  {
    id: '1',
    title: 'Character Development Masterclass',
    type: 'course',
    category: 'character',
    content: 'Learn advanced techniques for creating memorable characters that resonate with audiences.',
    tags: ['character development', 'psychology', 'writing'],
    aiSummary: 'This comprehensive course covers character psychology, arc development, and dialogue crafting.',
    difficulty: 'intermediate',
    relevanceScore: 95
  },
  {
    id: '2',
    title: 'Plot Structure Analysis: Breaking Bad',
    type: 'video',
    category: 'plot',
    content: 'Deep dive analysis of Breaking Bad\'s intricate plot structure and character development.',
    tags: ['plot structure', 'analysis', 'case study'],
    difficulty: 'advanced',
    relevanceScore: 88
  },
  {
    id: '3',
    title: 'Dialogue Writing Workshop',
    type: 'course',
    category: 'dialogue',
    content: 'Master the art of writing natural, compelling dialogue for any genre.',
    tags: ['dialogue', 'writing', 'screenwriting'],
    aiSummary: 'Practical exercises and techniques for crafting authentic character voices.',
    difficulty: 'intermediate',
    relevanceScore: 92
  }
];

const sampleLearningPaths: LearningPath[] = [
  {
    id: '1',
    title: 'Screenplay Fundamentals',
    description: 'Master the basics of screenplay writing from concept to final draft.',
    resources: ['1', '2', '3'],
    progress: 65,
    completed: false
  },
  {
    id: '2',
    title: 'Advanced Character Creation',
    description: 'Deep dive into creating complex, memorable characters.',
    resources: ['4', '5', '6'],
    progress: 30,
    completed: false
  }
];

export const useResearchStore = create<ResearchState>((set, get) => ({
  resources: sampleResources,
  learningPaths: sampleLearningPaths,
  searchHistory: [],
  recommendations: [],

  addResource: (resource) =>
    set((state) => ({
      resources: [...state.resources, resource],
    })),

  addLearningPath: (path) =>
    set((state) => ({
      learningPaths: [...state.learningPaths, path],
    })),

  updateProgress: (pathId, progress) =>
    set((state) => ({
      learningPaths: state.learningPaths.map((path) =>
        path.id === pathId
          ? { ...path, progress, completed: progress === 100 }
          : path
      ),
    })),

  setCurrentGenre: (genre) => set({ currentGenre: genre }),
  
  setCurrentTopic: (topic) => set({ currentTopic: topic }),

  searchResources: async (query) => {
    const state = get();
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const searchTerms = query.toLowerCase().split(' ');
    
    return state.resources.filter((resource) =>
      searchTerms.every(
        (term) =>
          resource.title.toLowerCase().includes(term) ||
          resource.tags.some((tag) => tag.toLowerCase().includes(term))
      )
    );
  },

  getRecommendations: () => {
    const state = get();
    const { currentGenre, currentTopic } = state;
    
    return state.resources
      .filter((resource) =>
        (currentGenre && resource.tags.includes(currentGenre.toLowerCase())) ||
        (currentTopic && resource.tags.includes(currentTopic.toLowerCase()))
      )
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  },
}));