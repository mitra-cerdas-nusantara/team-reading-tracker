import React, { useState, useEffect } from 'react';
import { format, subDays, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, startOfYear, endOfYear, addYears, subYears, differenceInDays, differenceInBusinessDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Pencil, Trash2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DashboardProps {
  settings: any;
  onEditLog: (log: any) => void;
}

export function Dashboard({ settings, onEditLog }: DashboardProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'all', 'custom'
  const [customStartDate, setCustomStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [baseDate, setBaseDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'total' | 'average' | 'daily'>('total');

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [timeRange, customStartDate, customEndDate, baseDate]);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members', error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = '/api/logs';
      const today = baseDate;
      let startDate, endDate;

      if (timeRange === 'today') {
        startDate = format(today, 'yyyy-MM-dd');
        endDate = format(today, 'yyyy-MM-dd');
        url += `?startDate=${startDate}&endDate=${endDate}`;
      } else if (timeRange === 'week') {
        startDate = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        endDate = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        url += `?startDate=${startDate}&endDate=${endDate}`;
      } else if (timeRange === 'month' || timeRange === 'last_month') {
        startDate = format(startOfMonth(today), 'yyyy-MM-dd');
        endDate = format(endOfMonth(today), 'yyyy-MM-dd');
        url += `?startDate=${startDate}&endDate=${endDate}`;
      } else if (timeRange === 'last_3_months') {
        startDate = format(subMonths(today, 3), 'yyyy-MM-dd');
        endDate = format(today, 'yyyy-MM-dd');
        url += `?startDate=${startDate}&endDate=${endDate}`;
      } else if (timeRange === 'this_year') {
        startDate = format(startOfYear(today), 'yyyy-MM-dd');
        endDate = format(endOfYear(today), 'yyyy-MM-dd');
        url += `?startDate=${startDate}&endDate=${endDate}`;
      } else if (timeRange === 'custom') {
        url += `?startDate=${customStartDate}&endDate=${customEndDate}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    switch (timeRange) {
      case 'today': setBaseDate(prev => subDays(prev, 1)); break;
      case 'week': setBaseDate(prev => subWeeks(prev, 1)); break;
      case 'month':
      case 'last_month': setBaseDate(prev => subMonths(prev, 1)); break;
      case 'this_year': setBaseDate(prev => subYears(prev, 1)); break;
      case 'last_3_months': setBaseDate(prev => subMonths(prev, 3)); break;
    }
  };

  const handleNext = () => {
    switch (timeRange) {
      case 'today': setBaseDate(prev => addDays(prev, 1)); break;
      case 'week': setBaseDate(prev => addWeeks(prev, 1)); break;
      case 'month':
      case 'last_month': setBaseDate(prev => addMonths(prev, 1)); break;
      case 'this_year': setBaseDate(prev => addYears(prev, 1)); break;
      case 'last_3_months': setBaseDate(prev => addMonths(prev, 3)); break;
    }
  };

  const getCurrentRangeLabel = () => {
    if (timeRange === 'all') return 'Semua Waktu';
    if (timeRange === 'custom') return `${format(new Date(customStartDate), 'dd MMM yyyy')} - ${format(new Date(customEndDate), 'dd MMM yyyy')}`;

    let start, end;
    if (timeRange === 'today') {
      return format(baseDate, 'dd MMMM yyyy');
    } else if (timeRange === 'week') {
      start = startOfWeek(baseDate, { weekStartsOn: 1 });
      end = endOfWeek(baseDate, { weekStartsOn: 1 });
    } else if (timeRange === 'month' || timeRange === 'last_month') {
      start = startOfMonth(baseDate);
      end = endOfMonth(baseDate);
    } else if (timeRange === 'last_3_months') {
      start = subMonths(baseDate, 3);
      end = baseDate;
    } else if (timeRange === 'this_year') {
      start = startOfYear(baseDate);
      end = endOfYear(baseDate);
    } else {
      return '';
    }
    return `${format(start, 'dd MMM')} - ${format(end, 'dd MMM yyyy')}`;
  };

  const getDaysInPeriod = () => {
    let start, end;
    const today = baseDate;

    if (timeRange === "today") {
      return 1; // Single day is treated as 1 working day for average purposes
    }

    if (timeRange === "all") {
      if (logs.length === 0) return 1;
      const dates = logs.map(l => new Date(l.date).getTime());
      start = new Date(Math.min(...dates));
      end = new Date(Math.max(...dates));
    } else if (timeRange === "week") {
      start = startOfWeek(today, { weekStartsOn: 1 });
      end = endOfWeek(today, { weekStartsOn: 1 });
    } else if (timeRange === "month" || timeRange === "last_month") {
      start = startOfMonth(today);
      end = endOfMonth(today);
    } else if (timeRange === "last_3_months") {
      start = subMonths(today, 3);
      end = today;
    } else if (timeRange === "this_year") {
      start = startOfYear(today);
      end = endOfYear(today);
    } else if (timeRange === "custom") {
      start = new Date(customStartDate);
      end = new Date(customEndDate);
    } else {
      return 1;
    }

    // Calculate inclusive business days (Mon-Fri)
    // We add 1 day to end to make it inclusive
    const businessDays = differenceInBusinessDays(addDays(end, 1), start);
    return Math.max(1, businessDays);
  };

  const handleDeleteLog = async (id: number) => {
    if (!confirm('Yakin ingin menghapus catatan ini?')) return;
    try {
      await fetch(`/api/logs/${id}`, { method: 'DELETE' });
      fetchLogs();
    } catch (error) {
      console.error('Failed to delete log', error);
    }
  };

  // Process data for charts
  const getChartData = () => {
    const memberData: Record<string, { total: number, count: number }> = {};
    const totalDays = getDaysInPeriod();

    // Initialize all members with 0
    members.forEach(member => {
      memberData[member.name] = { total: 0, count: 0 };
    });

    // Add log values
    logs.forEach(log => {
      if (memberData[log.member_name] !== undefined) {
        memberData[log.member_name].total += log.value;
        memberData[log.member_name].count += 1;
      } else {
        memberData[log.member_name] = { total: log.value, count: 1 };
      }
    });

    return Object.entries(memberData).map(([name, data]) => ({
      name,
      total: data.total,
      average: data.count > 0 ? Math.round(data.total / data.count) : 0,
      daily: Math.round((data.total / totalDays) * 10) / 10 // One decimal place for daily average
    })).sort((a, b) => {
      if (viewType === "total") return b.total - a.total;
      if (viewType === "average") return b.average - a.average;
      return b.daily - a.daily;
    });
  };

  const chartData = getChartData();
  const unit = settings?.tracking_mode === 'pages' ? 'Halaman' : 'Menit';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg shadow-inner">
            <button
              onClick={() => setViewType("total")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${viewType === "total"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              TOTAL
            </button>
            <button
              onClick={() => setViewType("average")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${viewType === "average"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
              title="Rata-rata per hari aktif"
            >
              AKTIF
            </button>
            <button
              onClick={() => setViewType("daily")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${viewType === "daily"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
              title="Rata-rata per hari kerja dalam periode"
            >
              PERIODE
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">

              <select
                value={timeRange}
                onChange={(e) => {
                  const val = e.target.value;
                  setTimeRange(val);
                  if (val === 'last_month') {
                    setBaseDate(subMonths(new Date(), 1));
                  } else {
                    setBaseDate(new Date());
                  }
                }}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full sm:w-[140px]"
              >
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="last_month">Bulan Lalu</option>
                <option value="last_3_months">3 Bulan Terakhir</option>
                <option value="this_year">Tahun Ini</option>
                <option value="custom">Pilih Tanggal</option>
                <option value="all">Semua Waktu</option>
              </select>

              {timeRange !== 'custom' && timeRange !== 'all' && (
                <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    {getCurrentRangeLabel()}
                  </div>

                  {['today', 'week', 'month', 'last_month', 'last_3_months', 'this_year'].includes(timeRange) && (
                    <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                      <button
                        onClick={handlePrev}
                        className="p-2.5 hover:bg-gray-50 border-r border-gray-300 text-gray-600 transition-colors"
                        title="Sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="p-2.5 hover:bg-gray-50 text-gray-600 transition-colors"
                        title="Selanjutnya"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {timeRange === 'all' && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  {getCurrentRangeLabel()}
                </div>
              )}

              {timeRange === 'custom' && (
                <div className="flex w-full sm:w-auto items-center gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 flex-1 min-w-0"
                  />
                  <span className="text-gray-500">s/d</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 flex-1 min-w-0"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total {unit} Dibaca</h3>
              <p className="text-3xl font-bold text-gray-900">
                {chartData.reduce((sum, item) => sum + item.total, 0)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Anggota Aktif</h3>
              <p className="text-3xl font-bold text-gray-900">{chartData.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Rata-rata Harian</h3>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-gray-900">
                  {logs.length > 0
                    ? Math.round(chartData.reduce((sum, item) => sum + item.total, 0) / logs.length)
                    : 0}
                </p>
                {settings?.target_value && (
                  <p className="text-sm text-gray-500 mb-1">
                    / {settings.target_value} {unit}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Progress per Anggota ({
                viewType === "total" ? `Total ${unit}` :
                  viewType === "average" ? `Rata-rata ${unit}/Total Hari Kegiatan` :
                    `Rata-rata ${unit}/Total Hari Kerja`
              })
            </h3>
            {chartData.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 80, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                    <Tooltip
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar
                      dataKey={viewType === "total" ? "total" : viewType === "average" ? "average" : "daily"}
                      name={
                        viewType === "total" ? `Total ${unit}` :
                          viewType === "average" ? `Rata-rata ${unit} (Aktif)` :
                            `Rata-rata ${unit} (Hari Kerja)`
                      }
                      fill="#2563EB"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Belum ada data anggota.
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Log Aktivitas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3">Nama</th>
                    <th className="px-6 py-3">Jumlah ({unit})</th>
                    <th className="px-6 py-3">Catatan</th>
                    <th className="px-6 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {format(new Date(log.date), 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4">{log.member_name}</td>
                      <td className="px-6 py-4 font-semibold">{log.value}</td>
                      <td className="px-6 py-4 truncate max-w-xs">{log.notes || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEditLog(log)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Edit Catatan"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Tidak ada log aktivitas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
