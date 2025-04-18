'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function AdminPage() {
  const { mosqueInfo, announcements, loading, updateMosqueInfo, addKajian, toggleKajianStatus } = useConfig();
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
    console.log('MosqueInfo updated:', mosqueInfo);
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
    console.log('Saving mosque data:', mosqueForm);
    await updateMosqueInfo(mosqueForm);
  };

  // Handle city search
  const handleCitySearch = async (query: string) => {
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debouncing
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
    }, 500); // Debounce 500ms

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
      <main className="container mx-auto p-4 max-w-3xl">
        <div className="flex items-center justify-center h-screen">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Panel Admin Masjid</CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="info">Info Masjid</TabsTrigger>
          <TabsTrigger value="kajian">Kajian</TabsTrigger>
          <TabsTrigger value="pengaturan">Pengaturan</TabsTrigger>
        </TabsList>

        {/* Tab Info Masjid */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Masjid</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleMosqueSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Masjid</label>
                  <Input 
                    placeholder="Masukkan nama masjid"
                    value={mosqueForm.name}
                    onChange={e => setMosqueForm((prev: MosqueData) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lokasi</label>
                  <Input 
                    placeholder="Masukkan lokasi masjid"
                    value={mosqueForm.location}
                    onChange={e => setMosqueForm((prev: MosqueData) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kota</label>
                  <div className="relative">
                    <Input 
                      placeholder="Cari kota... (minimal 3 karakter)"
                      value={searchQuery}
                      onChange={e => handleCitySearch(e.target.value)}
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                    {cities.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                        {cities.map((city) => (
                          <div
                            key={city.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleCitySelect(city)}
                          >
                            {city.lokasi}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button type="submit" className="w-full">Simpan Perubahan</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Kajian */}
        <TabsContent value="kajian">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Kajian</CardTitle>
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button>Tambah Kajian</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Tambah Kajian Baru</SheetTitle>
                  </SheetHeader>
                  <form onSubmit={handleKajianSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Judul Kajian</label>
                      <Input 
                        placeholder="Masukkan judul kajian"
                        value={newKajian.text}
                        onChange={e => setNewKajian(prev => ({ ...prev, text: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Deskripsi</label>
                      <Input 
                        placeholder="Masukkan deskripsi kajian"
                        value={newKajian.description}
                        onChange={e => setNewKajian(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ustadz/Ustadzah</label>
                      <Input 
                        placeholder="Nama ustadz/ustadzah"
                        value={newKajian.ustadz}
                        onChange={e => setNewKajian(prev => ({ ...prev, ustadz: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Jadwal</label>
                      <Input 
                        placeholder="Contoh: Setiap Senin Ba'da Magrib"
                        value={newKajian.schedule}
                        onChange={e => setNewKajian(prev => ({ ...prev, schedule: e.target.value }))}
                      />
                    </div>
                    <Button type="submit" className="w-full">Simpan Kajian</Button>
                  </form>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent>
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
                    <TableRow key={kajian.id}>
                      <TableCell>{kajian.text}</TableCell>
                      <TableCell>{kajian.ustadz}</TableCell>
                      <TableCell>{kajian.schedule}</TableCell>
                      <TableCell>
                        <Button 
                          variant={kajian.isActive ? "default" : "outline"} 
                          size="sm"
                          onClick={() => toggleKajianStatus(kajian.id)}
                        >
                          {kajian.isActive ? 'Aktif' : 'Nonaktif'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Pengaturan */}
        <TabsContent value="pengaturan">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Pengaturan akan segera hadir...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
} 