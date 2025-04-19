'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useConfig } from '../hooks/useConfig';
import { PrayerTimeService } from '../services/PrayerTimeService';
import { MosqueData, KajianData } from '../types/config';

interface City {
  id: string;
  lokasi: string;
}

interface KajianForm {
  text: string;
  description: string;
  ustadz: string;
  schedule: string;
  isActive: boolean;
}

export default function AdminPageContent() {
  const { mosqueInfo, announcements, loading, updateMosqueInfo, addKajian, toggleKajianStatus } = useConfig();
  const [activeTab, setActiveTab] = useState('info');
  const [newKajian, setNewKajian] = useState<KajianForm>({
    text: '',
    description: '',
    ustadz: '',
    schedule: '',
    isActive: true
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mosqueForm, setMosqueForm] = useState<MosqueData>(mosqueInfo || {
    name: '',
    location: '',
    cityCode: '',
    about: ''
  });
  const [cities, setCities] = useState<City[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Update form when mosqueInfo changes
  useEffect(() => {
    if (mosqueInfo) {
      setMosqueForm(mosqueInfo);
      if (mosqueInfo.cityCode) {
        const prayerService = PrayerTimeService.getInstance();
        prayerService.getCityById(mosqueInfo.cityCode)
          .then(city => {
            setSearchQuery(city.lokasi);
          })
          .catch(console.error);
      }
    }
  }, [mosqueInfo]);

  // Handle mosque info form
  const handleMosqueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMosqueInfo(mosqueForm);
  };

  // Handle city search
  const handleCitySearch = async (query: string) => {
    setSearchQuery(query);
    if (searchTimeout) clearTimeout(searchTimeout);

    const timeout = setTimeout(async () => {
      if (query.length >= 3) {
        setIsSearching(true);
        try {
          const prayerService = PrayerTimeService.getInstance();
          const citiesData = await prayerService.searchCities(query);
          setCities(citiesData);
        } catch (error) {
          console.error('Error searching cities:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setCities([]);
      }
    }, 500);

    setSearchTimeout(timeout);
  };

  // Handle city selection
  const handleCitySelect = (city: City) => {
    setMosqueForm((prev: MosqueData) => ({
      ...prev,
      cityCode: city.id
    }));
    setCities([]);
    setSearchQuery(city.lokasi);
  };

  // Handle kajian form
  const handleKajianSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addKajian(newKajian);
    setNewKajian({
      text: '',
      description: '',
      ustadz: '',
      schedule: '',
      isActive: true
    });
    setSheetOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F9]">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Informasi Masjid</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleMosqueSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nama Masjid</label>
                  <Input 
                    className="border-gray-200 focus:ring-2 focus:ring-green-500"
                    placeholder="Masukkan nama masjid"
                    value={mosqueForm.name}
                    onChange={e => setMosqueForm((prev: MosqueData) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Lokasi</label>
                  <Input 
                    className="border-gray-200 focus:ring-2 focus:ring-green-500"
                    placeholder="Masukkan lokasi masjid"
                    value={mosqueForm.location}
                    onChange={e => setMosqueForm((prev: MosqueData) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Kota</label>
                  <div className="relative">
                    <Input 
                      className="border-gray-200 focus:ring-2 focus:ring-green-500"
                      placeholder="Cari kota... (minimal 3 karakter)"
                      value={searchQuery}
                      onChange={e => handleCitySearch(e.target.value)}
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      </div>
                    )}
                    {cities.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                        {cities.map((city) => (
                          <div
                            key={city.id}
                            className="px-4 py-2 hover:bg-green-50 cursor-pointer transition-colors"
                            onClick={() => handleCitySelect(city)}
                          >
                            {city.lokasi}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Simpan Perubahan
                </Button>
              </form>
            </CardContent>
          </Card>
        );
      case 'kajian':
        return (
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-800">Daftar Kajian</CardTitle>
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Tambah Kajian
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Tambah Kajian Baru</SheetTitle>
                  </SheetHeader>
                  <form onSubmit={handleKajianSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Judul Kajian</label>
                      <Input 
                        className="border-gray-200 focus:ring-2 focus:ring-green-500"
                        placeholder="Masukkan judul kajian"
                        value={newKajian.text}
                        onChange={e => setNewKajian(prev => ({ ...prev, text: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Deskripsi</label>
                      <Input 
                        className="border-gray-200 focus:ring-2 focus:ring-green-500"
                        placeholder="Masukkan deskripsi kajian"
                        value={newKajian.description}
                        onChange={e => setNewKajian(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Ustadz/Ustadzah</label>
                      <Input 
                        className="border-gray-200 focus:ring-2 focus:ring-green-500"
                        placeholder="Nama ustadz/ustadzah"
                        value={newKajian.ustadz}
                        onChange={e => setNewKajian(prev => ({ ...prev, ustadz: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Jadwal</label>
                      <Input 
                        className="border-gray-200 focus:ring-2 focus:ring-green-500"
                        placeholder="Contoh: Setiap Senin Ba'da Magrib"
                        value={newKajian.schedule}
                        onChange={e => setNewKajian(prev => ({ ...prev, schedule: e.target.value }))}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                      Simpan Kajian
                    </Button>
                  </form>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Judul</TableHead>
                      <TableHead>Ustadz</TableHead>
                      <TableHead>Jadwal</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((kajian: KajianData) => (
                      <TableRow key={kajian.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{kajian.text}</TableCell>
                        <TableCell>{kajian.ustadz}</TableCell>
                        <TableCell>{kajian.schedule}</TableCell>
                        <TableCell>
                          <Button 
                            variant={kajian.isActive ? "default" : "outline"} 
                            size="sm"
                            className={kajian.isActive ? "bg-green-600 hover:bg-green-700" : "text-gray-600 hover:text-gray-700"}
                            onClick={() => toggleKajianStatus(kajian.id)}
                          >
                            {kajian.isActive ? 'Aktif' : 'Nonaktif'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      case 'pengaturan':
        return (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Pengaturan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Pengaturan akan segera hadir...</p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Panel Admin Masjid</h1>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'info' 
                    ? 'bg-green-50 text-green-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('info')}
              >
                Info Masjid
              </Button>
              <Button
                variant="ghost"
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'kajian' 
                    ? 'bg-green-50 text-green-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('kajian')}
              >
                Kajian
              </Button>
              <Button
                variant="ghost"
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'pengaturan' 
                    ? 'bg-green-50 text-green-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('pengaturan')}
              >
                Pengaturan
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}