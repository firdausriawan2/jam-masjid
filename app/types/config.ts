export interface MosqueData {
  name: string;
  location: string;
  cityCode: string;
  about: string;
}

export interface KajianData {
  id: string;
  text: string;
  description: string;
  ustadz: string;
  schedule: string;
  isActive: boolean;
}

export interface City {
  id: string;
  lokasi: string;
}

export interface PrayerTime {
  id: number;
  lokasi: string;
  daerah: string;
  koordinat: {
    lat: number;
    lon: number;
    lintang: string;
    bujur: string;
  };
  jadwal: {
    tanggal: string;
    imsak: string;
    subuh: string;
    terbit: string;
    dhuha: string;
    dzuhur: string;
    ashar: string;
    maghrib: string;
    isya: string;
    date: string;
  };
}

export interface MosqueInfo {
  name: string;
  location: string;
  cityCode: string;
  about: string;
}

export interface MosqueConfig {
  name: string;
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  settings: {
    announcements: KajianData[];
    prayerTimeAdjustments: {
      fajr: number;
      dhuhr: number;
      asr: number;
      maghrib: number;
      isha: number;
    };
  };
}

export interface PrayerTimeAdjustment {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
} 