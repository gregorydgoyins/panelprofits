import { create } from 'zustand';
import { subscriptionTiers } from '../config/subscriptionTiers';

interface Review {
  id: string;
  scriptId: string;
  reviewerId: string;
  authorId: string;
  content: string;
  rating: number;
  wordCount: number;
  helpfulVotes: number;
  createdAt: Date;
}

interface CommunityMetrics {
  monthlyReviews: number;
  totalWordCount: number;
  averageRating: number;
  helpfulnessScore: number;
  consecutiveMonths: number;
}

interface CommunityState {
  reviews: Review[];
  userMetrics: Record<string, CommunityMetrics>;
  rewardsThreshold: {
    reviewCount: number;
    minWordCount: number;
    minHelpfulScore: number;
  };
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  voteReviewHelpful: (reviewId: string) => void;
  checkRewardsEligibility: (userId: string) => {
    eligible: boolean;
    tier: string | null;
    reason?: string;
  };
  getLeaderboard: () => {
    userId: string;
    metrics: CommunityMetrics;
    rank: number;
  }[];
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  reviews: [],
  userMetrics: {},
  rewardsThreshold: {
    reviewCount: 10, // Reviews needed per month
    minWordCount: 200, // Minimum words per review
    minHelpfulScore: 4.0 // Minimum average helpful rating
  },

  addReview: (review) => set((state) => {
    const newReview = {
      ...review,
      id: Date.now().toString(),
      createdAt: new Date(),
      helpfulVotes: 0
    };

    // Update user metrics
    const userId = review.reviewerId;
    const currentMetrics = state.userMetrics[userId] || {
      monthlyReviews: 0,
      totalWordCount: 0,
      averageRating: 0,
      helpfulnessScore: 0,
      consecutiveMonths: 0
    };

    const updatedMetrics = {
      ...currentMetrics,
      monthlyReviews: currentMetrics.monthlyReviews + 1,
      totalWordCount: currentMetrics.totalWordCount + review.wordCount
    };

    return {
      reviews: [...state.reviews, newReview],
      userMetrics: {
        ...state.userMetrics,
        [userId]: updatedMetrics
      }
    };
  }),

  voteReviewHelpful: (reviewId) => set((state) => {
    const updatedReviews = state.reviews.map(review => {
      if (review.id === reviewId) {
        const newHelpfulVotes = review.helpfulVotes + 1;
        
        // Update reviewer metrics
        const reviewerMetrics = state.userMetrics[review.reviewerId];
        if (reviewerMetrics) {
          state.userMetrics[review.reviewerId] = {
            ...reviewerMetrics,
            helpfulnessScore: (reviewerMetrics.helpfulnessScore * reviewerMetrics.monthlyReviews + 1) / 
                             (reviewerMetrics.monthlyReviews)
          };
        }

        return { ...review, helpfulVotes: newHelpfulVotes };
      }
      return review;
    });

    return { ...state, reviews: updatedReviews };
  }),

  checkRewardsEligibility: (userId) => {
    const state = get();
    const metrics = state.userMetrics[userId];
    
    if (!metrics) {
      return { eligible: false, tier: null, reason: 'No review history found' };
    }

    const {
      monthlyReviews,
      totalWordCount,
      helpfulnessScore,
      consecutiveMonths
    } = metrics;

    const averageWordCount = totalWordCount / monthlyReviews;

    // Check basic eligibility
    if (monthlyReviews < state.rewardsThreshold.reviewCount) {
      return {
        eligible: false,
        tier: null,
        reason: `Need ${state.rewardsThreshold.reviewCount - monthlyReviews} more reviews this month`
      };
    }

    if (averageWordCount < state.rewardsThreshold.minWordCount) {
      return {
        eligible: false,
        tier: null,
        reason: 'Reviews need more detailed feedback'
      };
    }

    if (helpfulnessScore < state.rewardsThreshold.minHelpfulScore) {
      return {
        eligible: false,
        tier: null,
        reason: 'Helpful score needs improvement'
      };
    }

    // Determine reward tier based on performance
    let rewardTier = 'hemingway';
    if (consecutiveMonths >= 3 && monthlyReviews >= 20) {
      rewardTier = 'woolf';
    }
    if (consecutiveMonths >= 6 && monthlyReviews >= 30) {
      rewardTier = 'asimov';
    }

    return {
      eligible: true,
      tier: rewardTier
    };
  },

  getLeaderboard: () => {
    const state = get();
    const leaderboardEntries = Object.entries(state.userMetrics)
      .map(([userId, metrics]) => ({
        userId,
        metrics,
        score: metrics.monthlyReviews * metrics.helpfulnessScore * 
               (metrics.consecutiveMonths + 1)
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        userId: entry.userId,
        metrics: entry.metrics,
        rank: index + 1
      }));

    return leaderboardEntries;
  }
}));