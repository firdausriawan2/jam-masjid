// PrayerTimeService.ts
// Service untuk menangani waktu shalat dari MyQuran API v2
// Dokumentasi: https://documenter.getpostman.com/view/841292/2s9YsGittd

export interface City {
  id: string;
  lokasi: string;
}

interface MyQuranCityResponse {
  status: boolean;
  data: Array<{
    id: string;
    lokasi: string;
  }>;
}

interface MyQuranSingleCityResponse {
  status: boolean;
  data: {
    id: string;
    lokasi: string;
  };
}

export interface PrayerTime {
  name: string;
  time: string;
}

export class PrayerTimeService {
  private static instance: PrayerTimeService;
  private cityId: string = '1301'; // Default ke Jakarta
  private prayerTimes: PrayerTime[] = [];
  private lastUpdated: Date | null = null;

  // Daftar waktu shalat yang akan diambil
  private prayerNames: PrayerTime[] = [
    { name: 'Subuh', time: '' },
    { name: 'Dzuhur', time: '' },
    { name: 'Ashar', time: '' },
    { name: 'Maghrib', time: '' },
    { name: 'Isya', time: '' },
    { name: 'Terbit', time: '' }
  ];

  private constructor() {}

  public static getInstance(): PrayerTimeService {
    if (!PrayerTimeService.instance) {
      PrayerTimeService.instance = new PrayerTimeService();
    }
    return PrayerTimeService.instance;
  }

  public async searchCities(query: string): Promise<City[]> {
    try {
      const response = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${query}`);
      const data = await response.json() as MyQuranCityResponse;
      
      if (data.status && Array.isArray(data.data)) {
        return data.data.map((city) => ({
          id: city.id,
          lokasi: city.lokasi
        }));
      }
      return [];
    } catch (error) {
      console.error('Error searching cities:', error);
      return [];
    }
  }

  public async getCityById(id: string): Promise<City> {
    try {
      const response = await fetch(`https://api.myquran.com/v2/sholat/kota/id/${id}`);
      const data = await response.json() as MyQuranSingleCityResponse;
      
      if (data.status && data.data) {
        return {
          id: data.data.id,
          lokasi: data.data.lokasi
        };
      }
      throw new Error('City not found');
    } catch (error) {
      console.error('Error getting city:', error);
      throw error;
    }
  }

  public async getCurrentCityInfo(): Promise<City> {
    return this.getCityById(this.cityId);
  }

  public async getPrayerTimes(): Promise<PrayerTime[]> {
    // Cek apakah data perlu direfresh
    if (this.shouldRefreshData()) {
      await this.fetchPrayerTimes();
    }
    return this.prayerTimes;
  }

  public async getNextPrayer(): Promise<{ name: string; time: string }> {
    const times = await this.getPrayerTimes();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Konversi waktu saat ini ke menit
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    // Cari waktu shalat berikutnya
    for (const prayer of times) {
      const [prayerHour, prayerMinute] = prayer.time.split(':').map(Number);
      const prayerTimeInMinutes = prayerHour * 60 + prayerMinute;
      
      if (prayerTimeInMinutes > currentTimeInMinutes) {
        return prayer;
      }
    }
    
    // Jika tidak ada waktu shalat berikutnya hari ini, kembalikan waktu shalat pertama
    return times[0];
  }

  private shouldRefreshData(): boolean {
    // Jika belum ada data
    if (!this.lastUpdated || this.prayerTimes.length === 0) {
      return true;
    }
    
    // Jika data dari hari yang berbeda
    const now = new Date();
    const lastUpdate = new Date(this.lastUpdated);
    if (now.getDate() !== lastUpdate.getDate() ||
        now.getMonth() !== lastUpdate.getMonth() ||
        now.getFullYear() !== lastUpdate.getFullYear()) {
      return true;
    }
    
    return false;
  }

  private async fetchPrayerTimes(): Promise<void> {
    try {
      const now = new Date();
      const dateString = now.toISOString().split('T')[0].replace(/-/g, '/');
      
      // Fetch data untuk hari ini menggunakan API v2
      const response = await fetch(
        `https://api.myquran.com/v2/sholat/jadwal/${this.cityId}/${dateString}`
      );
      
      const data = await response.json();
      
      if (data.status && data.data && data.data.jadwal) {
        const jadwal = data.data.jadwal;
        
        // Update waktu shalat
        this.prayerTimes = this.prayerNames.map(prayer => ({
          name: prayer.name,
          time: jadwal[prayer.name.toLowerCase()] || ''
        }));
        
        this.lastUpdated = now;
        this.saveToLocalStorage();
        
        console.log('Prayer times updated:', this.prayerTimes);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      // Gunakan data yang ada di localStorage jika ada
      if (this.prayerTimes.length === 0) {
        this.loadFromLocalStorage();
      }
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('prayerTimesData', JSON.stringify({
        times: this.prayerTimes,
        cityId: this.cityId,
        lastUpdated: this.lastUpdated?.toISOString()
      }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const savedData = localStorage.getItem('prayerTimesData');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.prayerTimes = data.times;
        this.cityId = data.cityId;
        this.lastUpdated = data.lastUpdated ? new Date(data.lastUpdated) : null;
        console.log('Prayer times loaded from localStorage:', this.prayerTimes);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  public async getCities(keyword: string): Promise<City[]> {
    if (keyword.length < 3) return [];
    
    try {
      const response = await fetch(
        `https://api.myquran.com/v2/sholat/kota/cari/${keyword}`
      );
      
      const data = await response.json();
      
      if (data.status) {
        return data.data.map((city: { id: string; lokasi: string }) => ({
          id: city.id,
          lokasi: city.lokasi
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error searching cities:', error);
      return [];
    }
  }
} 