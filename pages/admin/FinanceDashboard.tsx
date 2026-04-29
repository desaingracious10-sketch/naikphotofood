import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Profile, ProfileStatus } from '../../types';
import { PRODUCT_PRICE, formatRupiah } from '../../lib/adminApi';

type FilterStatus = 'all' | ProfileStatus;

const STATUS_BADGE: Record<ProfileStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border border-amber-200',
  paid: 'bg-blue-100 text-blue-800 border border-blue-200',
  active: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  inactive: 'bg-red-100 text-red-800 border border-red-200',
};

const STATUS_LABEL: Record<ProfileStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  active: 'Active',
  inactive: 'Inactive',
};

const formatDate = (s: string | null): string => {
  if (!s) return '-';
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const FinanceDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');

  const fetchProfiles = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      return;
    }
    setProfiles((data ?? []) as Profile[]);
    setError(null);
  }, []);

  useEffect(() => {
    fetchProfiles().finally(() => setIsLoading(false));

    const channel = supabase
      .channel('admin-finance-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchProfiles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProfiles]);

  const metrics = useMemo(() => {
    const total = profiles.length;
    const paid = profiles.filter(p => p.status === 'paid').length;
    const pending = profiles.filter(p => p.status === 'pending').length;
    const active = profiles.filter(p => p.status === 'active').length;
    const inactive = profiles.filter(p => p.status === 'inactive').length;
    const revenue = (active + paid) * PRODUCT_PRICE;
    return { total, paid, pending, active, inactive, revenue };
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    if (filter === 'all') return profiles;
    return profiles.filter(p => p.status === filter);
  }, [profiles, filter]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Keuangan</h2>
        <p className="text-sm text-slate-500 mt-1">Ringkasan registrasi dan pendapatan secara realtime.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard label="Total Registrasi" value={metrics.total.toString()} accent="slate" />
        <MetricCard label="Sudah Bayar" value={metrics.paid.toString()} accent="blue" />
        <MetricCard label="Pending" value={metrics.pending.toString()} accent="amber" />
        <MetricCard label="Aktif" value={metrics.active.toString()} accent="emerald" />
        <MetricCard
          label="Total Pendapatan"
          value={formatRupiah(metrics.revenue)}
          accent="indigo"
          sub={`${metrics.active + metrics.paid} order × ${formatRupiah(PRODUCT_PRICE)}`}
        />
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Riwayat Order</h3>
            <p className="text-xs text-slate-500">{filteredProfiles.length} dari {profiles.length} entri</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'pending', 'paid', 'active', 'inactive'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === f
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? 'Semua' : STATUS_LABEL[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-sm">Memuat data...</div>
          ) : filteredProfiles.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">Tidak ada entri.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">No</th>
                  <th className="px-6 py-3">Nama</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">WhatsApp</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Tanggal Daftar</th>
                  <th className="px-6 py-3">Tanggal Aktivasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProfiles.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">{idx + 1}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{p.full_name}</td>
                    <td className="px-6 py-4 text-slate-700">{p.email}</td>
                    <td className="px-6 py-4 text-slate-700 font-mono text-xs">{p.whatsapp}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${STATUS_BADGE[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">{formatDate(p.created_at)}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs">{formatDate(p.activated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: string;
  accent: 'slate' | 'blue' | 'amber' | 'emerald' | 'indigo';
  sub?: string;
}

const ACCENT_STYLES: Record<MetricCardProps['accent'], { border: string; text: string }> = {
  slate: { border: 'border-l-slate-400', text: 'text-slate-900' },
  blue: { border: 'border-l-blue-500', text: 'text-blue-700' },
  amber: { border: 'border-l-amber-500', text: 'text-amber-700' },
  emerald: { border: 'border-l-emerald-500', text: 'text-emerald-700' },
  indigo: { border: 'border-l-indigo-500', text: 'text-indigo-700' },
};

const MetricCard: React.FC<MetricCardProps> = ({ label, value, accent, sub }) => {
  const styles = ACCENT_STYLES[accent];
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${styles.border} p-5 shadow-sm`}>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-2xl font-extrabold ${styles.text} truncate`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
    </div>
  );
};

export default FinanceDashboard;
