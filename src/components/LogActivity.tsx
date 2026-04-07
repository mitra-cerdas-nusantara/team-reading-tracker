import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

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

  const [formData, setFormData] = useState({
    member_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    value: '',
    notes: ''
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (editLogData) {
      setFormData({
        member_id: editLogData.member_id.toString(),
        date: editLogData.date,
        value: editLogData.value.toString(),
        notes: editLogData.notes || ''
      });
    } else {
      setFormData({
        member_id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        value: '',
        notes: ''
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

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          value: parseInt(formData.value, 10)
        })
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
            {editLogData ? 'Edit Catatan Membaca' : 'Catat Kegiatan Membaca'}
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
            {editLogData ? 'Berhasil memperbarui catatan!' : 'Berhasil mencatat kegiatan membaca!'}
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
              placeholder={`Contoh: ${settings?.tracking_mode === 'pages' ? '10' : '15'}`}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Buku apa yang dibaca? Atau catatan lainnya..."
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
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
