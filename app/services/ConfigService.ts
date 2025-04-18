'use client';

export interface MosqueConfig {
  mosque: {
    name: string;
    location: string;
    cityCode: string;
    about: string;
  };
  settings: {
    theme: 'light' | 'dark';
    announcements: Array<{
      id: number;
      text: string;
      description: string;
      ustadz: string;
      schedule: string;
      isActive: boolean;
    }>;
    prayerTimeAdjustments: {
      fajr: number;
      dhuhr: number;
      asr: number;
      maghrib: number;
      isha: number;
    };
  };
}

class ConfigService {
  private async fetchConfig(): Promise<MosqueConfig> {
    try {
      const response = await fetch('/data/mosque-config.json');
      if (!response.ok) {
        throw new Error('Failed to fetch mosque configuration');
      }
      return response.json();
    } catch (error) {
      console.error('Error reading config:', error);
      throw new Error('Failed to read mosque configuration');
    }
  }

  public async getConfig(): Promise<MosqueConfig> {
    return this.fetchConfig();
  }

  public async getMosqueInfo() {
    const config = await this.getConfig();
    return config.mosque;
  }

  public async getAnnouncements() {
    const config = await this.getConfig();
    return config.settings.announcements.filter(a => a.isActive);
  }

  public async getPrayerTimeAdjustments() {
    const config = await this.getConfig();
    return config.settings.prayerTimeAdjustments;
  }
}

export const configService = new ConfigService(); 