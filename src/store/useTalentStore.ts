import { create } from 'zustand';

interface TalentProfile {
  id: string;
  name: string;
  type: 'actor' | 'director' | 'producer';
  tier: 'A-list' | 'B-list' | 'C-list';
  genres: string[];
  minScoreRequired: number;
  boxOfficeValue: number;
  specialties: string[];
  interests: string[];
  dealBreakers: string[];
  personality: {
    difficulty: number;
    traits: string[];
    quirks: string[];
  };
  image: string;
  recentWork: {
    title: string;
    year: number;
    role: string;
  }[];
  relationships: {
    talentId: string;
    type: 'rival' | 'collaborator' | 'mentor' | 'student';
    strength: number;
  }[];
}

interface TalentState {
  availableTalent: TalentProfile[];
  interestedTalent: TalentProfile[];
  committedTalent: TalentProfile[];
  currentScriptScore: number;
  updateScriptScore: (score: number) => void;
  refreshAvailableTalent: () => void;
  attractTalent: (scriptDetails: any) => void;
  commitTalent: (talentId: string) => void;
  removeTalent: (talentId: string) => void;
  checkTalentCompatibility: (talentId: string, existingTalentIds: string[]) => {
    compatible: boolean;
    issues: string[];
  };
}

// ... rest of the store implementation