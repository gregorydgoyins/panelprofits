import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Award, TrendingUp, Users, Crown } from 'lucide-react';
import { useCommunityStore } from '../../store/useCommunityStore';
import { subscriptionTiers } from '../../config/subscriptionTiers';

export default function ReviewerRewards() {
  const { userMetrics, rewardsThreshold, checkRewardsEligibility, getLeaderboard } = useCommunityStore();
  const userId = "current-user-id"; // Replace with actual user ID
  const eligibility = checkRewardsEligibility(userId);
  const leaderboard = getLeaderboard();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-xl p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Trophy className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Reviewer Rewards</h2>
            <p className="text-gray-600">Help others, earn rewards</p>
          </div>
        </div>
        {eligibility.eligible && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-lg text-green-700">
            <Crown className="w-5 h-5" />
            <span>Reward Eligible!</span>
          </div>
        )}
      </div>

      {/* Progress Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Monthly Reviews</span>
            <Star className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-indigo-600">
            {userMetrics[userId]?.monthlyReviews || 0}
            <span className="text-sm text-gray-500 ml-2">/ {rewardsThreshold.reviewCount}</span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{
                width: `${Math.min(
                  ((userMetrics[userId]?.monthlyReviews || 0) / rewardsThreshold.reviewCount) * 100,
                  100
                )}%`
              }}
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Helpful Score</span>
            <Award className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-indigo-600">
            {(userMetrics[userId]?.helpfulnessScore || 0).toFixed(1)}
            <span className="text-sm text-gray-500 ml-2">/ 5.0</span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{
                width: `${((userMetrics[userId]?.helpfulnessScore || 0) / 5) * 100}%`
              }}
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Consecutive Months</span>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-indigo-600">
            {userMetrics[userId]?.consecutiveMonths || 0}
          </div>
        </div>
      </div>

      {/* Reward Status */}
      <div className="mb-8 p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Reward Status</h3>
        {eligibility.eligible ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <Crown className="w-5 h-5" />
              <span>You've earned a free month of {subscriptionTiers[eligibility.tier].name}!</span>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Claim Reward
            </button>
          </div>
        ) : (
          <div className="text-gray-600">
            <p>{eligibility.reason}</p>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Top Reviewers
        </h3>
        <div className="space-y-4">
          {leaderboard.slice(0, 5).map((entry) => (
            <div
              key={entry.userId}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <span className={`text-lg font-bold ${
                  entry.rank === 1 ? 'text-yellow-500' :
                  entry.rank === 2 ? 'text-gray-400' :
                  entry.rank === 3 ? 'text-amber-600' :
                  'text-gray-600'
                }`}>
                  #{entry.rank}
                </span>
                <div>
                  <div className="font-medium">User {entry.userId}</div>
                  <div className="text-sm text-gray-500">
                    {entry.metrics.monthlyReviews} reviews this month
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{entry.metrics.helpfulnessScore.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}