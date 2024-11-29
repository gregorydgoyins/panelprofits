import OpenAI from 'openai';
import { useBotStore } from './BotOrchestrator';
import { PERFORMANCE_CONFIG } from '../../config/performance';

export class ResearchBot {
  private openai: OpenAI;
  private botId = 'research-bot';

  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  async initialize() {
    // Initialization logic
    return true;
  }

  async analyzeScript(content: string): Promise<string> {
    const { updateBotMetrics } = useBotStore.getState();
    const startTime = Date.now();

    try {
      if (!this.isWithinRateLimit()) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert script analyst. Analyze the following script content for genre alignment, market potential, and narrative strength."
          },
          {
            role: "user",
            content
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const responseTime = Date.now() - startTime;
      updateBotMetrics(this.botId, {
        tasksCompleted: 1,
        successRate: 1,
        averageResponseTime: responseTime
      });

      return completion.choices[0].message.content || "No analysis available";
    } catch (error) {
      updateBotMetrics(this.botId, {
        successRate: 0
      });
      console.error('Error analyzing script:', error);
      throw this.handleError(error);
    }
  }

  private isWithinRateLimit(): boolean {
    // Implement rate limiting logic using PERFORMANCE_CONFIG
    return true;
  }

  private handleError(error: any): Error {
    if (error instanceof Error) {
      if (error.message.includes('Rate limit exceeded')) {
        return new Error('You have reached the maximum number of requests. Please try again later.');
      }
      if (error.message.includes('insufficient_quota')) {
        return new Error('API quota exceeded. Please try again later.');
      }
      return error;
    }
    return new Error('An unexpected error occurred. Please try again.');
  }
}