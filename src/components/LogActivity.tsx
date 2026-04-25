import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { BookOpen, Play, Headphones } from 'lucide-react';

interface LogActivityProps {
  settings: any;
  editLogData?: any;
  clearEdit?: () => void;
}

export function LogActivity({ settings, editLogData, clearEdit }: LogActivityProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [existingValue, setExistingValue] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    member_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    value: '',
    notes: '',
    mode: 'add' // 'add' or 'replace'
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (formData.member_id && formData.date && !editLogData) {
      checkExistingLog();
    } else {
      setExistingValue(null);
    }
  }, [formData.member_id, formData.date, editLogData]);

  const checkExistingLog = async () => {
    try {
      const res = await fetch(`/api/logs?startDate=${formData.date}&endDate=${formData.date}`);
      const logs = await res.json();
      const memberLog = logs.find((l: any) => l.member_id.toString() === formData.member_id.toString());
      setExistingValue(memberLog ? memberLog.value : null);
    } catch (error) {
      console.error('Failed to check existing log', error);
    }
  };

  useEffect(() => {
    if (editLogData) {
      setFormData({
        member_id: editLogData.member_id.toString(),
        date: editLogData.date,
        value: editLogData.value.toString(),
        notes: editLogData.notes || '',
        mode: 'replace'
      });
    } else {
      setFormData({
        member_id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        value: '',
        notes: '',
        mode: 'add'
      });
    }
  }, [editLogData]);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const url = editLogData ? `/api/logs/${editLogData.id}` : '/api/logs';
      const method = editLogData ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        value: parseInt(formData.value, 10)
      };

      console.log('Submitting payload:', payload);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit log');
      }

      setSuccess(true);

      if (editLogData && clearEdit) {
        clearEdit();
      } else {
        setFormData(prev => ({ ...prev, value: '', notes: '' }));
        checkExistingLog();
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (clearEdit) clearEdit();
  };

  const unit = settings?.tracking_mode === 'pages' ? 'Halaman' : 'Menit';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editLogData ? 'Edit Catatan Aktivitas' : 'Catat Aktivitas'}
          </h2>
          {editLogData && (
            <button
              onClick={handleCancelEdit}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Batal Edit
            </button>
          )}
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
            {editLogData ? 'Berhasil memperbarui catatan!' : 'Berhasil mencatat aktivitas!'}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Anggota
            </label>
            <select
              required
              value={formData.member_id}
              onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value="">Pilih Anggota</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
            {members.length === 0 && (
              <p className="mt-2 text-sm text-amber-600">
                Belum ada anggota. Silakan tambahkan anggota di menu Pengaturan.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>

          {!editLogData && (
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: 'add' })}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.mode === 'add'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Tambah {unit}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: 'replace' })}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.mode === 'replace'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Update {unit}
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah ({unit})
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder={formData.mode === 'add' ? `Contoh: +15` : `Contoh: 30`}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />

            {existingValue !== null && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                <span className="text-sm text-blue-800 font-medium">Total aktivitas hari ini:</span>
                <span className="text-lg font-bold text-blue-900">{existingValue} {unit}</span>
              </div>
            )}

            {formData.mode === 'add' && (
              <p className="mt-1 text-xs text-gray-500">
                Nilai ini akan ditambahkan ke catatan yang sudah ada untuk tanggal tersebut.
              </p>
            )}
            {formData.mode === 'replace' && (
              <p className="mt-1 text-xs text-gray-500">
                Nilai ini akan menggantikan catatan yang sudah ada untuk tanggal tersebut.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Jenis aktivitas
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'reading', label: 'Membaca', icon: BookOpen },
                { id: 'watching', label: 'Menonton', icon: Play },
                { id: 'listening', label: 'Mendengarkan', icon: Headphones },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, notes: type.label })}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${formData.notes === type.label
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  <type.icon className={`w-6 h-6 mb-2 ${formData.notes === type.label ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.member_id}
            className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-3 text-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Menyimpan...' : 'Simpan Catatan'}
          </button>
        </form>
      </div>
    </div>
  );
}
