import { useState } from 'react';
import { KajianData } from '../types/config';
import { configService } from '../services/ConfigService';

export function useKajian() {
  const [announcements, setAnnouncements] = useState<KajianData[]>([]);

  const loadAnnouncements = async () => {
    try {
      const config = await configService;
      const activeAnnouncements = await config.getAnnouncements();
      setAnnouncements(activeAnnouncements);
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const addKajian = async (kajian: Omit<KajianData, 'id' | 'isActive'>) => {
    try {
      const config = await configService;
      await config.addKajian(kajian);
      await loadAnnouncements();
    } catch (error) {
      console.error('Error adding kajian:', error);
      throw error;
    }
  };

  const toggleKajianStatus = async (id: string) => {
    try {
      const config = await configService;
      await config.toggleKajianStatus(id);
      await loadAnnouncements();
    } catch (error) {
      console.error('Error toggling kajian status:', error);
      throw error;
    }
  };

  return {
    announcements,
    addKajian,
    toggleKajianStatus,
    loadAnnouncements
  };
} 