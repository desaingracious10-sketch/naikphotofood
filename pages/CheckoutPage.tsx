import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  ADMIN_WHATSAPP,
  BANK_ACCOUNTS,
  DEFAULT_BANK_CODE,
  PRODUCT_PRICE,
  QRIS_IMAGE,
  formatRupiah,
} from '../lib/paymentConfig';

type PaymentMethod = 'bca' | 'mandiri' | 'qris';

const paymentSteps = [
  'Transfer sesuai nominal',
  'Simpan screenshot bukti pembayaran',
  'Kirim bukti ke WhatsApp admin',
  'Akun diaktifkan maksimal 1 x 24 jam',
];

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const emailParam = searchParams.get('email') ?? user?.email ?? '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(DEFAULT_BANK_CODE);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const bankAccount = useMemo(
    () => BANK_ACCOUNTS.find((item) => item.code === paymentMethod) ?? BANK_ACCOUNTS[0],
    [paymentMethod],
  );
  const priceLabel = useMemo(() => formatRupiah(PRODUCT_PRICE), []);

  const setTemporaryCopiedField = (field: string) => {
    setCopiedField(field);
    window.setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1800);
  };

  const copyToClipboard = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setTemporaryCopiedField(field);
    } catch {
      setError('Gagal menyalin data. Silakan salin manual.');
    }
  };

  const handleProofChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProofPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofPreview(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

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
      setError(err.message || 'Gagal memperbarui status pembayaran. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const waMessage = [
    'Halo admin NaikPhoto, saya sudah melakukan pembayaran.',
    emailParam ? `Email akun: ${emailParam}` : '',
    paymentMethod === 'qris'
      ? `Metode: QRIS | Nominal: ${priceLabel}`
      : `Metode: ${bankAccount.label} | Nominal: ${priceLabel}`,
    'Saya sudah menyiapkan bukti transfer dan siap kirim di chat ini.',
  ].filter(Boolean).join('\n');
  const waLink = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_30%),linear-gradient(180deg,#fff7ed_0%,#f8fafc_42%,#ffffff_100%)]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-200 text-blue-900 shadow-sm">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 14H8V20H2V14ZM16 2H22V8H16V2ZM8 2C8 8 12 12 18 12V20C10 20 4 14 4 6V2H8Z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-slate-950">NaikPhoto Food</p>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Manual Checkout</p>
            </div>
          </Link>
          <div className="hidden rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm sm:inline-flex">
            Pembayaran aman dan terenkripsi
          </div>
        </div>

        <div className="mb-8 flex items-center justify-center gap-3 text-sm font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">1</span>
            <span>Data & Akun</span>
          </div>
          <div className="h-px w-10 bg-emerald-200" />
          <div className="flex items-center gap-2 text-slate-950">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white">2</span>
            <span>Pembayaran</span>
          </div>
          <div className="h-px w-10 bg-orange-200" />
          <div className="flex items-center gap-2">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full ${submitted ? 'bg-emerald-500 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200'}`}>
              3
            </span>
            <span>Selesai</span>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-5">
          <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
            <div className="bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_45%,#ea580c_100%)] px-6 py-6 text-white sm:px-8">
              <div className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]">
                Tahap Pembayaran
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight">Selesaikan pesanan Anda</h1>
                  <p className="mt-2 max-w-lg text-sm text-blue-100">
                    Pilih metode pembayaran, transfer sesuai nominal, lalu kirim bukti agar admin bisa aktivasi akun lebih cepat.
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-blue-100">Total pembayaran</p>
                  <p className="text-4xl font-black tracking-tight">{priceLabel}</p>
                </div>
              </div>
              {emailParam && (
                <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm">
                  Akun terdaftar: <span className="font-bold text-white">{emailParam}</span>
                </div>
              )}
            </div>

            <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-8">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {BANK_ACCOUNTS.map((account) => (
                    <button
                      key={account.code}
                      type="button"
                      onClick={() => setPaymentMethod(account.code)}
                      className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                        paymentMethod === account.code
                          ? 'bg-orange-50 text-orange-700 ring-2 ring-orange-300'
                          : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-white'
                      }`}
                    >
                      Transfer {account.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                      paymentMethod === 'qris'
                        ? 'bg-sky-50 text-sky-700 ring-2 ring-sky-300'
                        : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-white'
                    }`}
                  >
                    QRIS
                  </button>
                </div>

                {paymentMethod === 'qris' ? (
                  <div className="rounded-[28px] border border-sky-100 bg-sky-50/50 p-5">
                    <div className="flex flex-col items-center rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
                      <div className="mb-4 text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-600">Bayar via QRIS</p>
                        <p className="mt-2 text-sm text-slate-500">Scan dengan mobile banking atau e-wallet Anda.</p>
                      </div>
                      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
                        <img
                          src={QRIS_IMAGE}
                          alt="QRIS NaikPhoto"
                          className="h-auto w-full max-w-[260px] object-contain"
                        />
                      </div>
                      <div className="mt-5 flex w-full items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Nominal transfer</p>
                          <p className="mt-1 text-2xl font-black tracking-tight text-emerald-800">{priceLabel}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(String(PRODUCT_PRICE), 'nominal-qris')}
                          className="rounded-xl border border-white bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"
                        >
                          {copiedField === 'nominal-qris' ? 'Tersalin' : 'Salin nominal'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[28px] border border-orange-100 bg-orange-50/50 p-5">
                    <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">Transfer Bank</p>
                          <p className="mt-2 text-lg font-black tracking-tight text-slate-950">{bankAccount.label}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(String(PRODUCT_PRICE), 'nominal-bank')}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"
                        >
                          {copiedField === 'nominal-bank' ? 'Tersalin' : 'Salin nominal'}
                        </button>
                      </div>

                      <div className="overflow-hidden rounded-3xl border border-slate-200">
                        <div className="grid grid-cols-[1fr_auto] border-b border-slate-200 px-4 py-3 text-sm">
                          <span className="text-slate-500">Bank</span>
                          <span className="font-bold text-slate-900">{bankAccount.label}</span>
                        </div>
                        <div className="grid grid-cols-[1fr_auto] border-b border-slate-200 px-4 py-3 text-sm">
                          <span className="text-slate-500">Atas nama</span>
                          <span className="text-right font-bold text-slate-900">{bankAccount.accountName}</span>
                        </div>
                        <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-sm">
                          <div>
                            <p className="text-slate-500">Nomor rekening</p>
                            <p className="mt-1 text-2xl font-black tracking-[0.08em] text-slate-950">{bankAccount.accountNumber}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(bankAccount.accountNumber, `account-${bankAccount.code}`)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"
                          >
                            {copiedField === `account-${bankAccount.code}` ? 'Tersalin' : 'Salin'}
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Nominal transfer</p>
                        <p className="mt-1 text-3xl font-black tracking-tight text-emerald-800">{priceLabel}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-black text-slate-950">Langkah selanjutnya</p>
                <div className="mt-4 space-y-3">
                  {paymentSteps.map((step, index) => (
                    <div key={step} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        {index + 1}
                      </span>
                      <p className="text-sm text-slate-600">
                        {index === 0 && paymentMethod !== 'qris' ? `${step} ke rekening ${bankAccount.label}` : step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-5">
                <div className="mb-3">
                  <p className="text-sm font-black text-slate-950">Upload bukti transfer</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Opsional di halaman ini. Preview ini membantu Anda cek screenshot sebelum dikirim ke WhatsApp admin.
                  </p>
                </div>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center hover:bg-white">
                  <input type="file" accept="image/*" className="hidden" onChange={handleProofChange} />
                  {proofPreview ? (
                    <img src={proofPreview} alt="Preview bukti transfer" className="max-h-72 rounded-2xl object-contain shadow-sm" />
                  ) : (
                    <>
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                        <svg className="h-7 w-7 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 16.5V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v9.75M3 16.5l3.75-3.75a2.25 2.25 0 013.182 0L12 15l1.068-1.068a2.25 2.25 0 013.182 0L21 18.75M3 16.5v.75A2.25 2.25 0 005.25 19.5h13.5A2.25 2.25 0 0021 17.25v-1.5M15.75 8.25h.008v.008h-.008V8.25z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-slate-700">Klik untuk pilih foto bukti transfer</p>
                      <p className="mt-1 text-xs text-slate-500">Format JPG, PNG, atau WEBP</p>
                    </>
                  )}
                </label>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  id="checkout-whatsapp-button"
                  data-track="checkout_whatsapp_button"
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 text-center text-base font-extrabold text-white shadow-[0_16px_36px_rgba(34,197,94,0.25)] transition hover:-translate-y-0.5"
                >
                  Kirim bukti via WhatsApp
                </a>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isSubmitting}
                  id="checkout-confirm-button"
                  data-track="checkout_confirm_paid"
                  className="rounded-2xl bg-[linear-gradient(135deg,#ea580c_0%,#f97316_35%,#0ea5e9_100%)] px-5 py-4 text-base font-extrabold text-white shadow-[0_16px_36px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Memproses...' : 'Saya sudah transfer'}
                </button>
              </div>
            </div>
          </section>

          {submitted && (
            <section className="rounded-[30px] border border-emerald-200 bg-emerald-50 px-6 py-6 shadow-[0_18px_48px_rgba(34,197,94,0.14)] sm:px-8">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                  <svg className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.2 7.2a1 1 0 01-1.414 0l-3-3A1 1 0 016.504 9.49l2.293 2.293 6.493-6.493a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Langkah 3 selesai</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-emerald-950">Status pembayaran Anda sudah tercatat</h2>
                  <p className="mt-2 text-sm text-emerald-900/80">
                    Admin akan mengecek pembayaran dan mengaktifkan akun Anda maksimal dalam 1 x 24 jam. Simpan email dan password login yang tadi Anda buat.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white"
                    >
                      Chat admin sekarang
                    </a>
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="rounded-2xl border border-emerald-300 bg-white px-5 py-3 text-sm font-extrabold text-emerald-800"
                    >
                      Kembali ke login
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
