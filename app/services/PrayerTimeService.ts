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

interface JadwalSholat {
  date: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface PrayerTime {
  name: string;
  time: string;
}

interface DailyPrayerTimes {
  date: string;
  prayers: PrayerTime[];
}

export class PrayerTimeService {
  private static instance: PrayerTimeService;
  private cityId: string = '0315'; // Sesuai dengan mosque-config.json
  private prayerTimes: PrayerTime[] = [];
  private monthlyPrayerTimes: DailyPrayerTimes[] = []; // NEW: Menyimpan 1 bulan data
  private lastUpdated: Date | null = null;

  // Daftar waktu shalat yang akan diambil dengan nama yang sesuai API
  private prayerNames: PrayerTime[] = [
    { name: 'Subuh', time: '' },
    { name: 'Terbit', time: '' },
    { name: 'Dzuhur', time: '' },
    { name: 'Ashar', time: '' },
    { name: 'Maghrib', time: '' },
    { name: 'Isya', time: '' }
  ];

  // Daftar kota statis untuk fallback
  private static readonly CITIES: { [key: string]: City } = {
    '0315': { id: '0315', lokasi: 'KOTA PADANGPANJANG' },
    '0314': { id: '0314', lokasi: 'KOTA PADANG' },
    '0316': { id: '0316', lokasi: 'KOTA PARIAMAN' }
  };

  private constructor() {
    // Load konfigurasi kota dari localStorage jika ada
    const config = localStorage.getItem('mosque_config');
    if (config) {
      try {
        const mosqueConfig = JSON.parse(config);
        if (mosqueConfig.mosque && mosqueConfig.mosque.cityCode) {
          this.cityId = mosqueConfig.mosque.cityCode;
        }
      } catch (error) {
        console.error('Error parsing mosque config:', error);
      }
    }
  }

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
      // Coba ambil dari daftar statis dulu
      if (PrayerTimeService.CITIES[id]) {
        return PrayerTimeService.CITIES[id];
      }

      // Jika tidak ada di daftar statis, coba ambil dari API
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${id}/2024/04`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          
          if (data.status && data.data) {
            return {
              id: id,
              lokasi: data.data.lokasi
            };
          }
        } catch (fetchError) {
          console.error(`Attempt ${attempt + 1} failed:`, fetchError);
          if (attempt === 2) throw fetchError;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      throw new Error('City not found');
    } catch (error) {
      console.error('Error getting city:', error);
      // Jika masih ada di daftar statis, gunakan itu
      if (PrayerTimeService.CITIES[id]) {
        return PrayerTimeService.CITIES[id];
      }
      throw error;
    }
  }

  public async getCurrentCityInfo(): Promise<City> {
    return this.getCityById(this.cityId);
  }

  public async getPrayerTimes(): Promise<PrayerTime[]> {
    // Cek apakah data perlu direfresh
    if (this.shouldRefreshData()) {
      try {
        await this.fetchPrayerTimes();
      } catch (error) {
        console.warn('Failed to fetch new data, using existing data:', error);
      }
    }
    
    // Jika ada data monthly, gunakan untuk hari ini
    const today = new Date();
    if (this.monthlyPrayerTimes.length > 0) {
      const todayPrayers = this.getPrayerTimesByDate(today);
      if (todayPrayers && todayPrayers.length > 0 && todayPrayers[0].time !== '05:00') {
        this.prayerTimes = todayPrayers;
      }
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
    
    // Jika data dari bulan yang berbeda (refresh monthly)
    const now = new Date();
    const lastUpdate = new Date(this.lastUpdated);
    if (now.getMonth() !== lastUpdate.getMonth() ||
        now.getFullYear() !== lastUpdate.getFullYear()) {
      return true;
    }
    
    return false;
  }

  private async fetchPrayerTimes(): Promise<void> {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');

      // Retry mechanism for fetching prayer times
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await fetch(
            `https://api.myquran.com/v2/sholat/jadwal/${this.cityId}/${year}/${month}`
          );
          
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          
          if (data.status && data.data && data.data.jadwal) {
            // NEW: Simpan semua data bulan
            this.monthlyPrayerTimes = data.data.jadwal.map((jadwal: JadwalSholat) => ({
              date: jadwal.date,
              prayers: this.prayerNames.map(prayer => {
                const apiName = this.getApiPrayerName(prayer.name);
                return {
                  name: prayer.name,
                  time: jadwal[apiName as keyof JadwalSholat] || ''
                };
              })
            }));

            // Set jadwal hari ini untuk kompatibilitas
            const today = now.getDate();
            const todaySchedule = this.monthlyPrayerTimes.find(schedule => {
              const scheduleDate = new Date(schedule.date).getDate();
              return scheduleDate === today;
            });
            
            if (!todaySchedule) throw new Error('Jadwal not found for today');
            
            this.prayerTimes = todaySchedule.prayers;
            this.lastUpdated = now;
            this.saveToLocalStorage();
            return;
          }
        } catch (fetchError) {
          console.error(`Attempt ${attempt + 1} failed:`, fetchError);
          if (attempt === 2) throw fetchError;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      throw new Error('Failed to fetch prayer times after 3 attempts');
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      
      // Fallback ke data yang tersimpan di localStorage
      this.loadFromLocalStorage();
      
      // Jika masih tidak ada data, gunakan fallback default
      if (this.prayerTimes.length === 0) {
        console.warn('Using fallback prayer times');
        this.prayerTimes = this.getFallbackPrayerTimes();
        this.lastUpdated = new Date();
      }
      
      throw error;
    }
  }

  // Helper untuk mendapatkan nama waktu shalat yang sesuai dengan API
  private getApiPrayerName(prayerName: string): string {
    const mapping: { [key: string]: string } = {
      'Subuh': 'subuh',
      'Terbit': 'terbit',
      'Dzuhur': 'dzuhur',
      'Ashar': 'ashar',
      'Maghrib': 'maghrib',
      'Isya': 'isya'
    };
    return mapping[prayerName] || prayerName.toLowerCase();
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('prayerTimesData', JSON.stringify({
        times: this.prayerTimes,
        monthlyTimes: this.monthlyPrayerTimes,
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
        this.prayerTimes = data.times || [];
        this.monthlyPrayerTimes = data.monthlyTimes || [];
        this.cityId = data.cityId;
        this.lastUpdated = data.lastUpdated ? new Date(data.lastUpdated) : null;
        console.log('Prayer times loaded from localStorage:', this.prayerTimes);
        console.log('Monthly prayer times loaded:', this.monthlyPrayerTimes.length, 'days');
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

  // Fallback prayer times jika API tidak tersedia
  private getFallbackPrayerTimes(): PrayerTime[] {
    return [
      { name: 'Subuh', time: '05:00' },
      { name: 'Terbit', time: '06:15' },
      { name: 'Dzuhur', time: '12:00' },
      { name: 'Ashar', time: '15:00' },
      { name: 'Maghrib', time: '18:00' },
      { name: 'Isya', time: '19:15' }
    ];
  }

  // NEW: Get prayer times for specific date
  public getPrayerTimesByDate(targetDate: Date): PrayerTime[] {
    const dateString = targetDate.toISOString().split('T')[0];
    const schedule = this.monthlyPrayerTimes.find(schedule => 
      schedule.date.startsWith(dateString)
    );
    
    if (schedule) {
      return schedule.prayers;
    }
    
    // Fallback jika tanggal tidak ditemukan
    return this.getFallbackPrayerTimes();
  }

  // NEW: Check if we have data for specific date
  public hasDataForDate(targetDate: Date): boolean {
    const dateString = targetDate.toISOString().split('T')[0];
    return this.monthlyPrayerTimes.some(schedule => 
      schedule.date.startsWith(dateString)
    );
  }
} 