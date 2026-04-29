import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ADMIN_WHATSAPP, PRODUCT_PRICE, formatRupiah } from '../lib/paymentConfig';

const validateWhatsapp = (value: string): boolean => {
  const cleaned = value.replace(/\s|-/g, '');
  return /^(08|\+628)\d{7,12}$/.test(cleaned);
};

const benefitItems = [
  'Akses lifetime sekali bayar',
  'Generate konten tanpa watermark',
  'Bonus tutorial dan prompt siap pakai',
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const priceLabel = useMemo(() => formatRupiah(PRODUCT_PRICE), []);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.fullName.trim()) return setError('Nama lengkap wajib diisi.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Format email tidak valid.');
    if (!validateWhatsapp(form.whatsapp)) return setError('Nomor WhatsApp harus format Indonesia (08xx atau +62xx).');
    if (form.password.length < 8) return setError('Password minimal 8 karakter.');
    if (form.password !== form.confirmPassword) return setError('Konfirmasi password tidak cocok.');

    setIsLoading(true);
    try {
      const profilePayload = {
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        whatsapp: form.whatsapp.trim(),
        status: 'pending' as const,
        plan: 'lifetime',
      };

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: profilePayload.email,
        password: form.password,
        options: {
          data: profilePayload,
        },
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('Gagal membuat akun.');

      if (data.session) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          ...profilePayload,
        });

        if (profileError) {
          throw new Error('Gagal menyimpan data profil. Pastikan SQL setup profiles di Supabase sudah dijalankan.');
        }
      }

      if (!data.session) {
        navigate('/login', {
          replace: true,
          state: {
            error: 'Akun berhasil dibuat. Cek email verifikasi dulu, lalu login kembali.',
          },
        });
        return;
      }

      navigate(`/checkout?email=${encodeURIComponent(profilePayload.email)}`, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_30%),linear-gradient(180deg,#fff7ed_0%,#f8fafc_42%,#ffffff_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-200 text-blue-900 shadow-sm">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 14H8V20H2V14ZM16 2H22V8H16V2ZM8 2C8 8 12 12 18 12V20C10 20 4 14 4 6V2H8Z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-slate-950">NaikPhoto Food</p>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Checkout Access</p>
            </div>
          </Link>
          <a
            href={`https://wa.me/${ADMIN_WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-orange-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm sm:inline-flex"
          >
            Butuh bantuan admin
          </a>
        </div>

        <div className="mb-8 flex items-center justify-center gap-3 text-sm font-semibold text-slate-500">
          <div className="flex items-center gap-2 text-slate-950">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white">1</span>
            <span>Data & Akun</span>
          </div>
          <div className="h-px w-10 bg-orange-200" />
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200">2</span>
            <span>Pembayaran</span>
          </div>
          <div className="h-px w-10 bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200">3</span>
            <span>Selesai</span>
          </div>
        </div>

        <div className="grid flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
            <div className="bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_42%,#ea580c_100%)] px-6 py-6 text-white sm:px-8">
              <div className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]">
                Lifetime Deal
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight">NaikPhoto Food Studio</h1>
                  <p className="mt-2 max-w-lg text-sm text-blue-100">
                    Buka akses dashboard AI visual untuk bisnis kuliner, bonus prompt, dan materi pendukung jualan.
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-blue-100 line-through">Rp 499.000</p>
                  <p className="text-4xl font-black tracking-tight">{priceLabel}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">Akses selamanya</span>
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">Support WhatsApp</span>
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">Tanpa watermark</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 sm:px-8 sm:py-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-500">Langkah 1</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Isi data untuk lanjut ke pembayaran</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Email dan password ini akan dipakai untuk login setelah pembayaran Anda dikonfirmasi.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-800">Nama lengkap</span>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(event) => update('fullName', event.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-800">Nomor WhatsApp</span>
                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={(event) => update('whatsapp', event.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-800">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => update('email', event.target.value)}
                    placeholder="nama@email.com"
                    autoComplete="email"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-800">Password</span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => update('password', event.target.value)}
                    autoComplete="new-password"
                    placeholder="Minimal 8 karakter"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-800">Konfirmasi password</span>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) => update('confirmPassword', event.target.value)}
                    autoComplete="new-password"
                    placeholder="Ulangi password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </label>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                id="checkout-register-submit"
                data-track="checkout_register_submit"
                className="w-full rounded-2xl bg-[linear-gradient(135deg,#ea580c_0%,#f97316_35%,#0ea5e9_100%)] px-5 py-4 text-base font-extrabold text-white shadow-[0_16px_36px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Memproses...' : 'Lanjutkan ke Pembayaran'}
              </button>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-500">
                <span>Data aman</span>
                <span>Respon cepat</span>
                <span>Bayar sekali</span>
              </div>

              <p className="text-center text-sm text-slate-500">
                Sudah punya akun?{' '}
                <Link to="/login" className="font-bold text-blue-700 hover:text-blue-800">
                  Masuk di sini
                </Link>
              </p>
            </form>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[28px] border border-orange-100 bg-white/90 p-6 shadow-[0_16px_48px_rgba(234,88,12,0.08)]">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-500">Ringkasan</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Yang Anda dapatkan hari ini</h3>
              <div className="mt-5 space-y-3">
                {benefitItems.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.2 7.2a1 1 0 01-1.414 0l-3-3A1 1 0 016.504 9.49l2.293 2.293 6.493-6.493a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
              <p className="text-sm font-semibold text-orange-300">Setelah klik lanjut</p>
              <ol className="mt-4 space-y-4 text-sm text-slate-200">
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">1</span>
                  <span>Pilih pembayaran via BCA, Mandiri, atau QRIS.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">2</span>
                  <span>Kirim bukti transfer lewat WhatsApp admin untuk verifikasi lebih cepat.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">3</span>
                  <span>Akun akan diaktifkan oleh admin maksimal dalam 1 x 24 jam.</span>
                </li>
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
