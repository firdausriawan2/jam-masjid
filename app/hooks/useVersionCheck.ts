'use client';

import { useState, useEffect } from 'react';
import { VERSION_INFO } from '../version';

interface VersionInfo {
  version: string;
  gitHash: string;
  gitBranch: string;
  buildTime: string;
  buildTimestamp: number;
}

interface VersionCheckResult {
  currentVersion: VersionInfo;
  latestVersion: VersionInfo | null;
  updateAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  checkForUpdates: () => Promise<void>;
  applyUpdate: () => void;
}

export function useVersionCheck(): VersionCheckResult {
  const [latestVersion, setLatestVersion] = useState<VersionInfo | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkForUpdates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/version', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check for updates');
      }
      
      const data = await response.json();
      
      if (data.success && data.version) {
        setLatestVersion(data.version);
        
        // Compare versions
        const isNewerVersion = (
          data.version.buildTimestamp > VERSION_INFO.buildTimestamp ||
          data.version.gitHash !== VERSION_INFO.gitHash
        );
        
        setUpdateAvailable(isNewerVersion);
        
        // Store in localStorage for persistence
        localStorage.setItem('lastVersionCheck', JSON.stringify({
          timestamp: Date.now(),
          latestVersion: data.version,
          updateAvailable: isNewerVersion
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Version check failed');
      console.error('Version check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyUpdate = () => {
    // Clear cache and reload
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }
    
    // Clear application cache
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Clear localStorage (optional - keep user data)
    localStorage.removeItem('lastVersionCheck');
    
    // Force reload
    window.location.reload();
  };

  // Auto-check on mount and periodically
  useEffect(() => {
    // Check immediately
    checkForUpdates();
    
    // Check every 30 minutes
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCheck = localStorage.getItem('lastVersionCheck');
    if (savedCheck) {
      try {
        const parsed = JSON.parse(savedCheck);
        // If check was less than 1 hour ago, use cached result
        if (Date.now() - parsed.timestamp < 60 * 60 * 1000) {
          setLatestVersion(parsed.latestVersion);
          setUpdateAvailable(parsed.updateAvailable);
        }
      } catch (e) {
        console.error('Error loading cached version check:', e);
      }
    }
  }, []);

  return {
    currentVersion: VERSION_INFO,
    latestVersion,
    updateAvailable,
    isLoading,
    error,
    checkForUpdates,
    applyUpdate
  };
} 