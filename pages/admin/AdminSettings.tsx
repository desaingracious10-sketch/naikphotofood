import React from 'react';
import { PRODUCT_PRICE, formatRupiah } from '../../lib/adminApi';

const AdminSettings: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '(belum di-set)';
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL ?? '(opsional, tidak di-set)';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Pengaturan</h2>
        <p className="text-sm text-slate-500 mt-1">Konfigurasi sistem (read-only). Edit lewat file <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">.env.local</code>.</p>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-slate-900">Konfigurasi Produk</h3>
        <Row label="Harga Produk (lifetime)" value={formatRupiah(PRODUCT_PRICE)} hint="Set via VITE_PRODUCT_PRICE" />
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-slate-900">Supabase</h3>
        <Row label="Project URL" value={supabaseUrl} hint="VITE_SUPABASE_URL" mono />
        <Row label="Admin Email (fallback)" value={adminEmail} hint="VITE_ADMIN_EMAIL (opsional)" />
      </section>

      <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="font-bold text-amber-900 mb-2">⚠️ Catatan Keamanan</h3>
        <p className="text-sm text-amber-800 leading-relaxed">
          Service role key <strong>tidak disimpan di browser</strong>. Operasi sensitif (delete user) dieksekusi via Supabase Edge Function <code className="bg-white px-1.5 py-0.5 rounded text-xs">admin-delete-user</code>, yang memverifikasi <code className="bg-white px-1.5 py-0.5 rounded text-xs">is_admin</code> caller sebelum jalan. Jangan pernah menambahkan <code className="bg-white px-1.5 py-0.5 rounded text-xs">VITE_SUPABASE_SERVICE_ROLE_KEY</code> ke <code className="bg-white px-1.5 py-0.5 rounded text-xs">.env.local</code>.
        </p>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="font-bold text-slate-900 mb-3">Promote Admin Baru</h3>
        <p className="text-sm text-slate-600 mb-3">Jalankan SQL berikut di Supabase SQL Editor:</p>
        <pre className="bg-slate-900 text-slate-100 text-xs p-4 rounded-xl overflow-x-auto">
{`UPDATE public.profiles
   SET is_admin = TRUE
 WHERE email = 'email_target@example.com';`}
        </pre>
      </section>
    </div>
  );
};

interface RowProps {
  label: string;
  value: string;
  hint?: string;
  mono?: boolean;
}

const Row: React.FC<RowProps> = ({ label, value, hint, mono }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 last:border-b-0 last:pb-0">
    <div>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
    <span className={`text-sm text-slate-900 ${mono ? 'font-mono text-xs' : 'font-semibold'} truncate max-w-md`}>
      {value}
    </span>
  </div>
);

export default AdminSettings;
