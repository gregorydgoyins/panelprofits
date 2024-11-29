import { API_CONFIG } from '../config/apiConfig';

export class APIService {
  static async generateVoiceover(text: string, voiceId: string) {
    return fetch('https://api.elevenlabs.io/v1/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': API_CONFIG.elevenLabs.key
      },
      body: JSON.stringify({
        text,
        voice_id: voiceId,
        model_id: 'eleven_multilingual_v2'
      })
    }).then(res => res.json());
  }

  static async generateStoryboard(scene: string) {
    return fetch('https://api.runwayml.com/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.runwayML.key}`
      },
      body: JSON.stringify({
        prompt: scene,
        params: {
          style: 'cinematic',
          quality: 'high'
        }
      })
    }).then(res => res.json());
  }

  static async getStockAssets(query: string) {
    const [images, footage] = await Promise.all([
      // Unsplash Plus API call
      fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=20`, {
        headers: {
          'Authorization': `Client-ID ${API_CONFIG.unsplashPlus.key}`
        }
      }).then(res => res.json()),

      // Motion Array API call
      fetch(`https://api.motionarray.com/v1/stock-footage/search?q=${query}`, {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.motionArray.key}`
        }
      }).then(res => res.json())
    ]);

    return { images, footage };
  }

  static async getScreenplayResources(query: string) {
    return fetch(`https://www.loc.gov/manuscripts/?q=${query}&fo=json`, {
      headers: {
        'Authorization': `Bearer ${API_CONFIG.libraryOfCongress.key}`
      }
    }).then(res => res.json());
  }

  static async getBackgroundMusic(mood: string) {
    return fetch(`https://api.artlist.io/v1/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.artlist.key}`
      },
      body: JSON.stringify({
        mood,
        type: 'music',
        duration: '60-180'
      })
    }).then(res => res.json());
  }
}