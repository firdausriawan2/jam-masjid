'use client';

import { useState, useEffect } from 'react';
import { configService } from '../services/ConfigService';
import { MosqueData, KajianData } from '../types/config';

export function useConfig() {
  const [mosqueInfo, setMosqueInfo] = useState<MosqueData | null>(null);
  const [announcements, setAnnouncements] = useState<KajianData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await configService;
        const mosque = await config.getMosqueInfo();
        const announcements = await config.getAnnouncements();
        
        setMosqueInfo(mosque);
        setAnnouncements(announcements);
      } catch (error) {
        console.error('Error loading config:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const updateMosqueInfo = async (data: MosqueData) => {
    try {
      const config = await configService;
      await config.updateMosqueInfo(data);
      setMosqueInfo(data);
    } catch (error) {
      console.error('Error updating mosque info:', error);
      throw error;
    }
  };

  const addKajian = async (kajian: Omit<KajianData, 'id' | 'isActive'>) => {
    try {
      const config = await configService;
      await config.addKajian(kajian);
      const updatedAnnouncements = await config.getAnnouncements();
      setAnnouncements(updatedAnnouncements);
    } catch (error) {
      console.error('Error adding kajian:', error);
      throw error;
    }
  };

  const toggleKajianStatus = async (id: string) => {
    try {
      const config = await configService;
      await config.toggleKajianStatus(id);
      const updatedAnnouncements = await config.getAnnouncements();
      setAnnouncements(updatedAnnouncements);
    } catch (error) {
      console.error('Error toggling kajian status:', error);
      throw error;
    }
  };

  return {
    mosqueInfo,
    announcements,
    loading,
    updateMosqueInfo,
    addKajian,
    toggleKajianStatus
  };
} 