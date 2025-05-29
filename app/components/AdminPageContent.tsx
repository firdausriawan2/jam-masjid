'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useConfig } from '../hooks/useConfig';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useVersionCheck } from '../hooks/useVersionCheck';
import { PrayerTimeService } from '../services/PrayerTimeService';
import { MosqueData, KajianData } from '../types/config';
import { useRouter } from 'next/navigation';

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

interface CredentialForm {
  username: string;
  name: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface StaffForm {
  muazzin: {
    name: string;
    location: string;
  };
  imam: {
    name: string;
    location: string;
  };
}

export default function AdminPageContent() {
  const router = useRouter();
  const { mosqueInfo, announcements, loading, updateMosqueInfo, addKajian, toggleKajianStatus } = useConfig();
  const isOnline = useNetworkStatus();
  const { currentVersion, updateAvailable, isLoading: versionLoading, applyUpdate, checkForUpdates } = useVersionCheck();
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
    about: '',
    liveStream: {
      url: '',
      title: 'Masjidil Haram',
      description: 'Live from Makkah',
      autoplay: true,
      muted: true
    }
  });
  const [cities, setCities] = useState<City[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [credentialForm, setCredentialForm] = useState<CredentialForm>({
    username: 'admin', // default value, akan diupdate dari credentials.json
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [credentialError, setCredentialError] = useState('');
  const [credentialSuccess, setCredentialSuccess] = useState('');
  const [staffForm, setStaffForm] = useState<StaffForm>({
    muazzin: {
      name: 'Ust. Ahmad',
      location: 'Selatpanjang - Riau'
    },
    imam: {
      name: 'Ust. Abdullah',
      location: 'Selatpanjang - Riau'
    }
  });

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

  // Tambahkan useEffect untuk mengambil data kredensial saat pertama kali load
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCredentialForm(prev => ({
            ...prev,
            username: data.user.username,
            name: data.user.name
          }));
        }
      })
      .catch(console.error);
  }, []);

  // Load staff data
  useEffect(() => {
    const loadStaffData = async () => {
      try {
        const staffData = localStorage.getItem('mosque_staff');
        if (staffData) {
          setStaffForm(JSON.parse(staffData));
        }
      } catch (error) {
        console.error('Error loading staff data:', error);
      }
    };
    
    loadStaffData();
  }, []);

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

  // Tambahkan fungsi untuk handle update kredensial
  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialError('');
    setCredentialSuccess('');

    // Validasi password
    if (credentialForm.newPassword !== credentialForm.confirmPassword) {
      setCredentialError('Password baru dan konfirmasi password tidak cocok');
      return;
    }

    try {
      const res = await fetch('/api/auth/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: credentialForm.name,
          currentPassword: credentialForm.currentPassword,
          newPassword: credentialForm.newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Terjadi kesalahan saat memperbarui kredensial');
      }

      setCredentialSuccess('Kredensial berhasil diperbarui');
      setCredentialForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setCredentialError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    }
  };

  // Handle staff form submission
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('mosque_staff', JSON.stringify(staffForm));
      // Reload halaman untuk memperbarui tampilan
      window.location.reload();
    } catch (error) {
      console.error('Error saving staff data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Gagal logout');
      }

      // Redirect ke halaman login
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
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
          <div className="space-y-6">
            {/* Info Masjid Card */}
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
                    <label className="text-sm font-medium text-gray-700">Kabupaten/Kota</label>
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

            {/* Live Streaming Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">Pengaturan Live Streaming</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMosqueSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">URL Live Streaming</label>
                    <Input 
                      className="border-gray-200 focus:ring-2 focus:ring-green-500"
                      placeholder="Masukkan URL YouTube Live (opsional)"
                      value={mosqueForm.liveStream?.url || ''}
                      onChange={e => setMosqueForm((prev: MosqueData) => ({
                        ...prev,
                        liveStream: {
                          ...(prev.liveStream || {
                            title: 'Masjidil Haram',
                            description: 'Live from Makkah',
                            autoplay: true,
                            muted: true
                          }),
                          url: e.target.value
                        }
                      }))}
                    />
                    <p className="text-xs text-gray-500">
                      Contoh: https://www.youtube.com/embed/2Gub8-cSH9c
                      {mosqueForm.liveStream?.url && !mosqueForm.liveStream.url.includes('embed') && (
                        <span className="block text-yellow-600 mt-1">
                          *Pastikan menggunakan URL embed YouTube (mengandung /embed/)
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Judul Live</label>
                    <Input 
                      className="border-gray-200 focus:ring-2 focus:ring-green-500"
                      placeholder="Masukkan judul live streaming"
                      value={mosqueForm.liveStream?.title || ''}
                      onChange={e => setMosqueForm((prev: MosqueData) => ({
                        ...prev,
                        liveStream: {
                          ...(prev.liveStream || {
                            url: '',
                            description: 'Live from Makkah',
                            autoplay: true,
                            muted: true
                          }),
                          title: e.target.value
                        }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Deskripsi Live</label>
                    <Input 
                      className="border-gray-200 focus:ring-2 focus:ring-green-500"
                      placeholder="Masukkan deskripsi live streaming"
                      value={mosqueForm.liveStream?.description || ''}
                      onChange={e => setMosqueForm((prev: MosqueData) => ({
                        ...prev,
                        liveStream: {
                          ...(prev.liveStream || {
                            url: '',
                            title: 'Masjidil Haram',
                            autoplay: true,
                            muted: true
                          }),
                          description: e.target.value
                        }
                      }))}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="autoplay"
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        checked={mosqueForm.liveStream?.autoplay ?? true}
                        onChange={e => setMosqueForm((prev: MosqueData) => ({
                          ...prev,
                          liveStream: {
                            ...(prev.liveStream || {
                              url: '',
                              title: 'Masjidil Haram',
                              description: 'Live from Makkah',
                              muted: true
                            }),
                            autoplay: e.target.checked
                          }
                        }))}
                      />
                      <label htmlFor="autoplay" className="text-sm font-medium text-gray-700">
                        Autoplay
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="muted"
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        checked={mosqueForm.liveStream?.muted ?? true}
                        onChange={e => setMosqueForm((prev: MosqueData) => ({
                          ...prev,
                          liveStream: {
                            ...(prev.liveStream || {
                              url: '',
                              title: 'Masjidil Haram',
                              description: 'Live from Makkah',
                              autoplay: true
                            }),
                            muted: e.target.checked
                          }
                        }))}
                      />
                      <label htmlFor="muted" className="text-sm font-medium text-gray-700">
                        Muted
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Simpan Pengaturan Live
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        );
      case 'kajian':
        return (
          <Card className="shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <CardTitle className="text-xl font-semibold text-gray-800">Daftar Kajian</CardTitle>
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Tambah Kajian
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg">
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
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-full inline-block align-middle">
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Judul</TableHead>
                          <TableHead className="whitespace-nowrap">Ustadz</TableHead>
                          <TableHead className="whitespace-nowrap">Jadwal</TableHead>
                          <TableHead className="whitespace-nowrap">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {announcements.map((kajian: KajianData) => (
                          <TableRow key={kajian.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium max-w-[150px] sm:max-w-none truncate">{kajian.text}</TableCell>
                            <TableCell className="max-w-[100px] sm:max-w-none truncate">{kajian.ustadz}</TableCell>
                            <TableCell className="max-w-[100px] sm:max-w-none truncate">{kajian.schedule}</TableCell>
                            <TableCell>
                              <Button 
                                variant={kajian.isActive ? "default" : "outline"} 
                                size="sm"
                                className={`${kajian.isActive ? 'bg-green-600 hover:bg-green-700' : 'text-gray-600 hover:text-gray-700'} whitespace-nowrap`}
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
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 'finance':
        return (
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">Kas Masjid</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Mengelola keuangan masjid dengan mudah. Anda akan diarahkan ke halaman khusus manajemen kas.
                </p>
                <Button 
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  onClick={() => router.push('/admin/finance')}
                >
                  Buka Manajemen Kas
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      case 'pengaturan':
        return (
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">Pengaturan Kredensial</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCredentialSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <Input 
                      value={credentialForm.username}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Username tidak dapat diubah</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nama</label>
                    <Input 
                      value={credentialForm.name}
                      onChange={e => setCredentialForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Masukkan nama Anda"
                      className="border-gray-200 focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password Saat Ini</label>
                    <Input 
                      type="password"
                      value={credentialForm.currentPassword}
                      onChange={e => setCredentialForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Masukkan password saat ini"
                      className="border-gray-200 focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password Baru</label>
                    <Input 
                      type="password"
                      value={credentialForm.newPassword}
                      onChange={e => setCredentialForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Masukkan password baru"
                      className="border-gray-200 focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                    <Input 
                      type="password"
                      value={credentialForm.confirmPassword}
                      onChange={e => setCredentialForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Masukkan ulang password baru"
                      className="border-gray-200 focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {credentialError && (
                    <div className="text-red-500 text-sm">{credentialError}</div>
                  )}
                  {credentialSuccess && (
                    <div className="text-green-500 text-sm">{credentialSuccess}</div>
                  )}

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Simpan Perubahan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        );
      case 'staff':
        return (
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">Pengaturan Petugas Masjid</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStaffSubmit} className="space-y-6">
                  {/* Muazzin Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">Muazzin</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Nama Muazzin</label>
                      <Input 
                        value={staffForm.muazzin.name}
                        onChange={e => setStaffForm(prev => ({
                          ...prev,
                          muazzin: { ...prev.muazzin, name: e.target.value }
                        }))}
                        placeholder="Masukkan nama muazzin"
                        className="border-gray-200 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Lokasi/Asal</label>
                      <Input 
                        value={staffForm.muazzin.location}
                        onChange={e => setStaffForm(prev => ({
                          ...prev,
                          muazzin: { ...prev.muazzin, location: e.target.value }
                        }))}
                        placeholder="Masukkan lokasi/asal muazzin"
                        className="border-gray-200 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    {/* Imam Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-800">Imam</h3>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Nama Imam</label>
                        <Input 
                          value={staffForm.imam.name}
                          onChange={e => setStaffForm(prev => ({
                            ...prev,
                            imam: { ...prev.imam, name: e.target.value }
                          }))}
                          placeholder="Masukkan nama imam"
                          className="border-gray-200 focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Lokasi/Asal</label>
                        <Input 
                          value={staffForm.imam.location}
                          onChange={e => setStaffForm(prev => ({
                            ...prev,
                            imam: { ...prev.imam, location: e.target.value }
                          }))}
                          placeholder="Masukkan lokasi/asal imam"
                          className="border-gray-200 focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Simpan Perubahan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        );
      case 'system':
        return (
          <div className="space-y-6">
            {/* Update Notification */}
            {updateAvailable && (
              <Card className="shadow-lg border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-blue-800 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                    Update Tersedia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-700 mb-4">
                    Versi baru aplikasi tersedia. Update sekarang untuk mendapatkan fitur terbaru dan perbaikan bug.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={applyUpdate}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Update Sekarang
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={checkForUpdates}
                      disabled={versionLoading}
                    >
                      {versionLoading ? 'Checking...' : 'Check Update'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">Informasi System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Versi Aplikasi</label>
                    <div className="p-2 bg-gray-50 rounded border text-sm">
                      {currentVersion.version}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Git Hash</label>
                    <div className="p-2 bg-gray-50 rounded border text-sm font-mono">
                      {currentVersion.gitHash}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Build Time</label>
                    <div className="p-2 bg-gray-50 rounded border text-sm">
                      {new Date(currentVersion.buildTime).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Branch</label>
                    <div className="p-2 bg-gray-50 rounded border text-sm">
                      {currentVersion.gitBranch}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="outline"
                      onClick={checkForUpdates}
                      disabled={versionLoading}
                      className="flex items-center gap-2"
                    >
                      {versionLoading ? (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      Check Update
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh App
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        if (confirm('Clear cache akan menghapus semua data tersimpan sementara. Lanjutkan?')) {
                          localStorage.clear();
                          sessionStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear Cache
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 sm:h-16">
            <div className="flex items-center w-full sm:w-auto justify-center sm:justify-start mb-4 sm:mb-0 relative">
              <h1 className="text-xl font-bold text-gray-800">ساعة المسجد</h1>
              {/* Network Status Indicator */}
              {!isOnline && (
                <div className="ml-3 bg-red-500/90 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  Offline
                </div>
              )}
              {/* Update Available Indicator */}
              {updateAvailable && (
                <div className="ml-3 bg-blue-500/90 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  Update Tersedia
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center w-full sm:w-auto gap-2 items-center">
              <Button
                variant="ghost"
                className={`px-3 py-1.5 rounded-md transition-colors ${
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
                className={`px-3 py-1.5 rounded-md transition-colors ${
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
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'finance' 
                    ? 'bg-green-50 text-green-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('finance')}
              >
                Kas Masjid
              </Button>
              <Button
                variant="ghost"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'staff' 
                    ? 'bg-green-50 text-green-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('staff')}
              >
                Petugas
              </Button>
              <Button
                variant="ghost"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'pengaturan' 
                    ? 'bg-green-50 text-green-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('pengaturan')}
              >
                Pengaturan
              </Button>
              <Button
                variant="ghost"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'system' 
                    ? 'bg-green-50 text-green-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('system')}
              >
                System
                {updateAvailable && (
                  <div className="ml-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                )}
              </Button>
              <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block" />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}