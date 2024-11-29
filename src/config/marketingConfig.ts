export const MARKETING_CONFIG = {
  phases: {
    prelaunch: {
      duration: '30d',
      waitlist: {
        maxSize: 1000,
        earlyBirdDiscount: 0.40, // 40% off first year
        referralBonus: {
          referrer: 30, // days free
          referee: 0.15 // 15% off first year
        }
      },
      influencerProgram: {
        targetNiche: ['screenwriters', 'novelists', 'writing-teachers'],
        contentTypes: ['review', 'tutorial', 'comparison'],
        compensation: {
          affiliate: 0.30, // 30% commission
          duration: '12m'  // 12 month cookie
        }
      }
    },
    betaLaunch: {
      duration: '60d',
      maxUsers: 500,
      feedbackRewards: {
        bugReport: 100, // points
        featureSuggestion: 50,
        testimonial: 200
      }
    },
    fullLaunch: {
      initialPromo: {
        duration: '7d',
        discount: 0.25 // 25% off
      },
      referralProgram: {
        reward: {
          referrer: '2m', // 2 months free
          referee: '1m'   // 1 month free
        }
      }
    }
  }
}