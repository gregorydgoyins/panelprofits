export const BETA_PROGRAM = {
  wave1: {
    size: 50,
    duration: '30d',
    features: {
      writing: true,
      ai: true,
      community: true,
      advanced: false
    },
    requirements: {
      minWritingExp: '1y',
      weeklyCommitment: '3h',
      feedbackFrequency: 'weekly'
    },
    incentives: {
      freePeriod: '90d',
      earlyAdopterDiscount: 0.50,
      referralBonus: '30d'
    },
    feedback: {
      channels: ['in-app', 'email', 'discord'],
      scheduled: {
        initial: 'day3',
        weekly: 'friday',
        final: 'day30'
      }
    }
  }
};