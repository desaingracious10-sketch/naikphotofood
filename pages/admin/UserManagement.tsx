import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Profile, ProfileStatus } from '../../types';
import { updateUserStatus, deleteUserCompletely, exportProfilesToCSV } from '../../lib/adminApi';

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

const UserManagement: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
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
      .channel('admin-users-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchProfiles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProfiles]);

  const filteredProfiles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return profiles.filter(p => {
      if (filter !== 'all' && p.status !== filter) return false;
      if (!q) return true;
      return (
        p.full_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.whatsapp.toLowerCase().includes(q)
      );
    });
  }, [profiles, search, filter]);

  const handleActivate = async (p: Profile) => {
    setActioningId(p.id);
    setError(null);
    try {
      await updateUserStatus(p.id, 'active');
    } catch (e: any) {
      setError(`Gagal mengaktifkan: ${e.message}`);
    } finally {
      setActioningId(null);
    }
  };

  const handleDeactivate = async (p: Profile) => {
    if (!confirm(`Nonaktifkan akun ${p.full_name} (${p.email})?`)) return;
    setActioningId(p.id);
    setError(null);
    try {
      await updateUserStatus(p.id, 'inactive');
    } catch (e: any) {
      setError(`Gagal menonaktifkan: ${e.message}`);
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (p: Profile) => {
    if (p.is_admin) {
      alert('Tidak bisa menghapus akun admin.');
      return;
    }
    if (!confirm(`HAPUS PERMANEN akun ${p.full_name} (${p.email})?\n\nIni akan menghapus profile + auth user. Tidak bisa di-undo.`)) {
      return;
    }
    setActioningId(p.id);
    setError(null);
    try {
      await deleteUserCompletely(p.id);
    } catch (e: any) {
      setError(`Gagal menghapus: ${e.message}`);
    } finally {
      setActioningId(null);
    }
  };

  const handleExport = () => {
    exportProfilesToCSV(filteredProfiles);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manajemen User</h2>
          <p className="text-sm text-slate-500 mt-1">Aktivasi, nonaktivasi, dan hapus akun pengguna.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={filteredProfiles.length === 0}
          className="bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm py-2.5 px-5 rounded-xl transition-all active:scale-95 shadow-sm"
        >
          ⬇️ Export CSV ({filteredProfiles.length})
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama / email / nomor WA..."
            className="flex-grow min-w-[240px] px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          />
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
            <div className="p-12 text-center text-slate-500 text-sm">Tidak ada user yang cocok.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">No</th>
                  <th className="px-6 py-3">Nama</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">WhatsApp</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProfiles.map((p, idx) => {
                  const isActing = actioningId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-500">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{p.full_name}</span>
                          {p.is_admin && (
                            <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{p.email}</td>
                      <td className="px-6 py-4 text-slate-700 font-mono text-xs">{p.whatsapp}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${STATUS_BADGE[p.status]}`}>
                          {STATUS_LABEL[p.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs uppercase font-semibold">{p.plan}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {p.status !== 'active' && (
                            <button
                              onClick={() => handleActivate(p)}
                              disabled={isActing}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all disabled:opacity-50"
                            >
                              Aktifkan
                            </button>
                          )}
                          {p.status !== 'inactive' && (
                            <button
                              onClick={() => handleDeactivate(p)}
                              disabled={isActing}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-all disabled:opacity-50"
                            >
                              Nonaktifkan
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(p)}
                            disabled={isActing || p.is_admin}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
