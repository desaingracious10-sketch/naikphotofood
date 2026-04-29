import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const validateWhatsapp = (val: string): boolean => {
  const cleaned = val.replace(/\s|-/g, '');
  return /^(08|\+628)\d{7,12}$/.test(cleaned);
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const update = (key: keyof typeof form, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName.trim()) return setError('Nama lengkap wajib diisi.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Format email tidak valid.');
    if (!validateWhatsapp(form.whatsapp)) return setError('Nomor WhatsApp harus format Indonesia (08xx atau +62xx).');
    if (form.password.length < 8) return setError('Password minimal 8 karakter.');
    if (form.password !== form.confirmPassword) return setError('Konfirmasi password tidak cocok.');

    setIsLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('Gagal membuat akun.');

      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        whatsapp: form.whatsapp.trim(),
        status: 'pending',
        plan: 'lifetime',
      });

      if (profileError) {
        console.error('Profile insert error:', profileError);
        throw new Error('Gagal menyimpan data profile. Coba lagi atau hubungi admin.');
      }

      navigate(`/checkout?email=${encodeURIComponent(form.email.trim())}`, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 14H8V20H2V14ZM16 2H22V8H16V2ZM8 2C8 8 12 12 18 12V20C10 20 4 14 4 6V2H8Z"/>
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Naik<span className="text-blue-400">Photo</span>
              </h1>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Creative Studio</p>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">Daftar Akun Baru</h2>
          <p className="text-slate-400 text-sm mt-1">Mulai bikin konten makanan viral hari ini.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Lengkap *</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              className="w-full p-3 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Budi Santoso"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full p-3 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="kamu@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">No WhatsApp *</label>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => update('whatsapp', e.target.value)}
              className="w-full p-3 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="08123456789 atau +628123456789"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password * (min 8 karakter)</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="w-full p-3 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Konfirmasi Password *</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              className="w-full p-3 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
          >
            {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>

          <p className="text-center text-sm text-slate-400 pt-2">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
              Masuk di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
