export const subscriptionTiers = {
  hemingway: {
    name: "Hemingway's Workshop",
    price: {
      monthly: 14.99,
      annual: 149.99, // 2 months free
      trial: 15
    },
    features: [
      "Basic AI Writing Assistant",
      "Character Development Tools",
      "Plot Structure Templates",
      "3 AI Scene Visualizations/month",
      "Basic Research Tools",
      "Community Forum Access",
      "Basic Analytics"
    ],
    botAccess: {
      writingCoach: "basic",
      research: "limited",
      visual: "basic",
      audio: "none",
      optimization: "none"
    }
  },
  woolf: {
    name: "Woolf's Studio",
    price: {
      monthly: 29.99,
      annual: 299.99, // 2 months free
      trial: 15
    },
    features: [
      "Advanced AI Writing Assistant",
      "Full Character Development Suite",
      "Advanced Plot Analysis",
      "15 AI Scene Visualizations/month",
      "Voice Generation (100 credits)",
      "Advanced Research Tools",
      "Collaboration Tools",
      "Priority Support",
      "Advanced Analytics",
      "Market Trend Analysis"
    ],
    botAccess: {
      writingCoach: "advanced",
      research: "full",
      visual: "advanced",
      audio: "basic",
      optimization: "basic"
    }
  },
  asimov: {
    name: "Asimov's Laboratory",
    price: {
      monthly: 49.99,
      annual: 499.99, // 2 months free
      trial: 15
    },
    features: [
      "Ultimate AI Writing Suite",
      "Unlimited Scene Visualization",
      "Full Voice Generation",
      "Real-time Collaboration",
      "Advanced Market Analysis",
      "Priority Support",
      "Custom Bot Training",
      "White-label Export",
      "API Access",
      "Custom Integrations",
      "Dedicated Success Manager"
    ],
    botAccess: {
      writingCoach: "unlimited",
      research: "unlimited",
      visual: "unlimited",
      audio: "unlimited",
      optimization: "unlimited"
    }
  }
};