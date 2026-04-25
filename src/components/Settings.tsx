import React, { useState, useEffect } from 'react';
import { Trash2, UserPlus, Save } from 'lucide-react';

interface SettingsProps {
  settings: any;
  onSettingsChange: () => void;
}

export function Settings({ settings, onSettingsChange }: SettingsProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [trackingMode, setTrackingMode] = useState(settings?.tracking_mode || 'minutes');
  const [targetValue, setTargetValue] = useState(settings?.target_value || '');
  const [activityName, setActivityName] = useState(settings?.activity_name || 'Reading Tracker');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMembers();
    if (settings) {
      setTrackingMode(settings.tracking_mode);
      setTargetValue(settings.target_value || '');
      setActivityName(settings.activity_name || 'Reading Tracker');
    }
  }, [settings]);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members', error);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    try {
      await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newMemberName.trim() })
      });
      setNewMemberName('');
      fetchMembers();
    } catch (error) {
      console.error('Failed to add member', error);
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm('Yakin ingin menghapus anggota ini? Semua log aktivitasnya juga akan terhapus.')) return;

    try {
      await fetch(`/api/members/${id}`, { method: 'DELETE' });
      fetchMembers();
    } catch (error) {
      console.error('Failed to delete member', error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_mode: trackingMode,
          target_value: targetValue ? parseInt(targetValue, 10) : null,
          activity_name: activityName
        })
      });
      onSettingsChange();
    } catch (error) {
      console.error('Failed to save settings', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Pengaturan Perhitungan</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Aktivitas
            </label>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="Contoh: Belajar Al-Quran"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
            <p className="mt-2 text-sm text-gray-500">
              Nama ini akan ditampilkan sebagai judul aplikasi.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode Perhitungan
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer border rounded-lg p-4 flex items-center justify-center text-center transition-colors ${trackingMode === 'minutes' ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="trackingMode"
                  value="minutes"
                  checked={trackingMode === 'minutes'}
                  onChange={() => setTrackingMode('minutes')}
                  className="sr-only"
                />
                Berdasarkan Menit
              </label>
              <label className={`cursor-pointer border rounded-lg p-4 flex items-center justify-center text-center transition-colors ${trackingMode === 'pages' ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="trackingMode"
                  value="pages"
                  checked={trackingMode === 'pages'}
                  onChange={() => setTrackingMode('pages')}
                  className="sr-only"
                />
                Berdasarkan Halaman
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Kesepakatan awal untuk perhitungan aktivitas tim.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Harian (Opsional)
            </label>
            <input
              type="number"
              min="1"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder={`Contoh: ${trackingMode === 'pages' ? '10' : '15'}`}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
            <p className="mt-2 text-sm text-gray-500">
              Target harian yang disepakati untuk setiap anggota (dalam {trackingMode === 'pages' ? 'halaman' : 'menit'}).
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSaveSettings}
              disabled={saving || (trackingMode === settings?.tracking_mode && targetValue == (settings?.target_value || '') && activityName === (settings?.activity_name || 'Reading Tracker'))}
              className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Kelola Anggota Tim</h2>

        <form onSubmit={handleAddMember} className="flex gap-3 mb-6">
          <input
            type="text"
            required
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Nama anggota baru..."
            className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
          />
          <button
            type="submit"
            className="flex items-center gap-2 text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </form>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {members.map((member) => (
              <li key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <span className="font-medium text-gray-900">{member.name}</span>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Hapus Anggota"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
            {members.length === 0 && (
              <li className="p-8 text-center text-gray-500">
                Belum ada anggota tim.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
