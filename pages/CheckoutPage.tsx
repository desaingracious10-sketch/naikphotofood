import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const PRICE_LABEL = 'Rp 299.000';
const ADMIN_WHATSAPP = '6281234567890';
const BANK_INFO = {
  bank: 'BCA',
  number: '1234567890',
  name: 'PT Naikphoto Studio',
};

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const emailParam = searchParams.get('email') ?? user?.email ?? '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmPayment = async () => {
    setError(null);

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      setError('Sesi habis. Silakan login ulang dengan akun yang sudah didaftarkan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ status: 'paid', updated_at: new Date().toISOString() })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      setSubmitted(true);
    } catch (err: any) {
      console.error('Update payment status error:', err);
      setError(err.message || 'Gagal memperbarui status. Coba lagi atau hubungi admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const waLink = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
    `Halo Admin, saya sudah transfer untuk akun ${emailParam}. Mohon konfirmasi.`
  )}`;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-slate-800/60 backdrop-blur border border-slate-700 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Terima Kasih! 🎉</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Admin akan mengaktifkan akun kamu dalam <strong className="text-white">1x24 jam</strong>. Kami akan kirim notifikasi via WhatsApp atau email setelah akun aktif.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl mb-3 transition-all active:scale-[0.98]"
          >
            💬 Konfirmasi via WhatsApp
          </a>
          <button
            onClick={handleBackToLogin}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
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
        </div>

        <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">

          <section>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Pembayaran</p>
            <h2 className="text-2xl font-bold text-white mb-1">NaikPhoto AI Studio</h2>
            <p className="text-slate-400 text-sm">Lifetime Access — Bayar sekali, pakai selamanya.</p>
            <div className="flex items-baseline justify-between mt-4 pt-4 border-t border-slate-700">
              <span className="text-slate-300 font-medium">Total</span>
              <span className="text-3xl font-extrabold text-white">{PRICE_LABEL}</span>
            </div>
          </section>

          <section className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Transfer ke Rekening Berikut
            </p>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Bank</span>
              <span className="text-white font-bold">{BANK_INFO.bank}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">No. Rekening</span>
              <span className="text-white font-mono font-bold">{BANK_INFO.number}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Atas Nama</span>
              <span className="text-white font-semibold text-right">{BANK_INFO.name}</span>
            </div>
            <div className="pt-3 border-t border-slate-700">
              <p className="text-xs text-amber-300 leading-relaxed">
                💡 Transfer sesuai nominal di atas. Untuk QRIS atau metode lain, hubungi admin.
              </p>
            </div>
          </section>

          {emailParam && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-200">
              Pembayaran untuk akun: <strong className="text-white">{emailParam}</strong>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleConfirmPayment}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? 'Memproses...' : 'Saya Sudah Transfer'}
          </button>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-slate-900/60 hover:bg-slate-900 border border-slate-700 text-slate-300 font-semibold py-3.5 rounded-xl transition-all"
          >
            💬 Hubungi Admin via WhatsApp
          </a>

          <p className="text-center text-xs text-slate-500 pt-2">
            Sudah selesai bayar?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
