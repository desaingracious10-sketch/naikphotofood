import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ADMIN_EMAIL, ADMIN_WHATSAPP, PRODUCT_PRICE, formatRupiah } from '../lib/paymentConfig';

interface ProblemItem {
  icon: string;
  title: string;
  description: string;
}

interface StepItem {
  number: string;
  title: string;
  description: string;
}

interface ResultItem {
  image: string;
  alt: string;
  topline: string;
  title: string;
  description: string;
}

interface TestimonialItem {
  beforeImage: string;
  afterImage: string;
  quote: string;
  avatarLabel: string;
  avatarStyle: React.CSSProperties;
  brand: string;
  meta: string;
}

interface FitItem {
  emoji: string;
  label: string;
}

interface SavingsItem {
  title: string;
  description: string;
  price: string;
}

interface PricingTier {
  label: string;
  price: string;
  status?: 'soldout' | 'active';
}

interface FaqItem {
  question: string;
  answer: string;
}

interface CountdownParts {
  hours: string;
  minutes: string;
  seconds: string;
}

interface FooterLinkItem {
  label: string;
  href: string;
  external?: boolean;
}

const COUNTDOWN_STORAGE_KEY = 'np2_cd_end';
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const problems: ProblemItem[] = [
  {
    icon: '📸',
    title: 'Foto HP kurang menarik',
    description: 'Produk bisa enak, tapi kalau visualnya kurang menggoda, calon pembeli cenderung scroll lewat begitu saja.',
  },
  {
    icon: '⏱️',
    title: 'Promo menu sering telat',
    description: 'Mau launching menu baru atau promo dadakan, tapi proses bikin kontennya makan waktu berjam-jam.',
  },
  {
    icon: '💸',
    title: 'Biaya desainer terasa berat',
    description: 'Bayar fotografer, desainer, dan editor video setiap bulan bisa sangat berat untuk bisnis yang sedang tumbuh.',
  },
];

const steps: StepItem[] = [
  {
    number: '1',
    title: 'Upload foto makanan',
    description: 'Gunakan foto yang Anda ambil dari HP. Tidak harus foto sempurna untuk mulai.',
  },
  {
    number: '2',
    title: 'Pilih gaya visual',
    description: 'Sesuaikan kebutuhan, katalog menu, poster promo, konten pendek, atau iklan.',
  },
  {
    number: '3',
    title: 'Download hasil siap pakai',
    description: 'Dapatkan visual berkualitas studio yang langsung bisa dipakai untuk jualan atau promosi.',
  },
];

const results: ResultItem[] = [
  {
    image: 'https://cdn.scalev.id/uploads/1774498757/txMg3d5vVW5vONxVot6e9A/1774498757066-After-Cemilan.webp',
    alt: 'Hasil visual katalog',
    topline: 'Katalog / Feed',
    title: 'Visual lebih cocok untuk display produk',
    description: 'Untuk katalog menu, feed Instagram, atau materi promosi harian.',
  },
  {
    image: 'https://cdn.scalev.id/uploads/1774498707/zv7R_0KD0FIFXZmmC-OaUg/1774498706664-After-Catering.webp',
    alt: 'Hasil visual poster promo',
    topline: 'Poster Promo',
    title: 'Siap untuk campaign atau diskon',
    description: 'Untuk diskon, launch menu baru, atau promosi musiman.',
  },
  {
    image: 'https://cdn.scalev.id/uploads/1774498689/DFG755Lavo8p1egutl--Mg/1774498688415-After-Snack.webp',
    alt: 'Hasil visual iklan',
    topline: 'Konten Iklan',
    title: 'Visual premium untuk Meta Ads',
    description: 'Cocok untuk bisnis yang ingin tampilan iklannya lebih premium dan konsisten.',
  },
];

const testimonials: TestimonialItem[] = [
  {
    beforeImage: 'https://cdn.scalev.id/uploads/1775656596/YUKVRcBXL2ByVHTEHpj_dw/1775656596731-Ayamgeprek-Before.webp',
    afterImage: 'https://cdn.scalev.id/uploads/1775656613/76XyTfGEM0XRGtWHCBCgYw/1775656614477-Ayamgeprek-After.webp',
    quote: '"Gila sih ini, foto ayam geprekku yang tadinya burem sekarang jadi kayak iklan TV. Kemarin baru up di GoFood langsung kerasa bedanya, CTR naik!"',
    avatarLabel: 'A',
    avatarStyle: { background: '#0ea5e9' },
    brand: 'Ayam Geprek Juragan',
    meta: 'Owner F&B · Jakarta',
  },
  {
    beforeImage: 'https://cdn.scalev.id/uploads/1775656878/yo4U1p5a73IVRtotRyP_Cw/1775656879321-Before-kopi.webp',
    afterImage: 'https://cdn.scalev.id/uploads/1775656884/N95_11Ah0DAgEem4N2PYwg/1775656884653-After-kopi.webp',
    quote: '"Sumpah ngebantu banget buat bikin konten Reels harian. Ga perlu pusing sewa fotografer lagi. Sebulan bisa hemat budget marketing jutaan."',
    avatarLabel: 'K',
    avatarStyle: { background: '#f97316' },
    brand: 'Kopi Senja',
    meta: 'Cafe & Roastery · Bandung',
  },
  {
    beforeImage: 'https://cdn.scalev.id/uploads/1775656999/RDA0L07lpkclB1bDMQQWoQ/1775657000483-Before-catering-1.webp',
    afterImage: 'https://cdn.scalev.id/uploads/1775656994/bFAvSYS0ttlZD41qArGwnA/1775656995453-After-catering-1.webp',
    quote: '"Prompt-nya gampang banget dipake. Aku gaptek aja langsung ngerti. Hasil fotonya bikin ngiler parah."',
    avatarLabel: 'D',
    avatarStyle: { background: '#10b981' },
    brand: 'Dapur Bunda',
    meta: 'Catering & Frozen Food · Surabaya',
  },
];

const fitItems: FitItem[] = [
  { emoji: '🍱', label: 'Catering' },
  { emoji: '❄️', label: 'Frozen Food' },
  { emoji: '🍪', label: 'Snack Kemasan' },
  { emoji: '🍚', label: 'Rice Bowl' },
  { emoji: '🥐', label: 'Bakery' },
];

const savings: SavingsItem[] = [
  {
    title: 'Desainer Grafis',
    description: 'Untuk visual menu dan materi promosi',
    price: 'Rp 1.500.000',
  },
  {
    title: 'Copywriter',
    description: 'Untuk caption dan naskah promosi',
    price: 'Rp 1.000.000',
  },
  {
    title: 'Editor Video',
    description: 'Untuk konten Reels atau TikTok',
    price: 'Rp 2.500.000',
  },
];

const pricingTiers: PricingTier[] = [
  { label: 'Pembeli Ke 1–10', price: 'Rp 93.000', status: 'soldout' },
  { label: 'Pembeli Ke 11–50', price: 'Rp 121.000', status: 'active' },
  { label: 'Pembeli Ke 51–100', price: 'Rp 153.000' },
  { label: 'Pembeli Ke 101–200', price: 'Rp 213.000' },
  { label: 'Pembeli Ke 201+', price: 'Rp 313.000' },
];

const faqs: FaqItem[] = [
  {
    question: 'Apakah saya harus jago prompt atau editing?',
    answer: 'Tidak. NaikPhoto Studio dirancang supaya mudah dipakai oleh owner bisnis kuliner yang ingin hasil lebih cepat tanpa proses editing yang rumit. Tersedia tutorial lengkap untuk memandu Anda dari awal.',
  },
  {
    question: 'Apakah bisa dimulai dari foto HP biasa?',
    answer: 'Ya. Tools ini dirancang untuk mengolah foto makanan sederhana dari HP menjadi visual yang lebih siap dipakai untuk katalog atau promosi. Tidak perlu kamera DSLR atau setup pencahayaan khusus.',
  },
  {
    question: 'Cocok untuk bisnis makanan seperti apa?',
    answer: 'Cocok untuk catering, frozen food, snack kemasan, bakery, rice bowl, dan bisnis kuliner lain yang rutin membutuhkan materi visual untuk jualan atau promosi.',
  },
  {
    question: 'Apa yang saya dapatkan setelah membeli?',
    answer: 'Anda mendapatkan akses penuh ke dashboard NaikPhoto Studio, tutorial penggunaan, generate konten unlimited tanpa watermark, plus bonus Notion content calendar dan content plan.',
  },
  {
    question: 'Apakah ada watermark pada hasil yang diunduh?',
    answer: 'Tidak. Semua hasil yang Anda unduh dari paket ini bebas watermark dan siap langsung digunakan untuk keperluan bisnis Anda.',
  },
  {
    question: 'Kalau bingung saat pertama kali pakai, bagaimana?',
    answer: 'Anda bisa mengandalkan garansi onboarding kami. Tim support akan membantu jika ada kendala teknis saat awal penggunaan, cukup hubungi kami dan kami akan dampingi langsung.',
  },
];

const footerGroups: Array<{ title: string; links: FooterLinkItem[] }> = [
  {
    title: 'Produk',
    links: [
      { label: 'Demo Aplikasi', href: '#np2demo' },
      { label: 'Contoh Hasil', href: '#np2fitur' },
      { label: 'Harga Promo', href: '#np2pricing' },
      { label: 'Login Dashboard', href: '/login' },
    ],
  },
  {
    title: 'NaikPhoto Food',
    links: [
      { label: 'Masalah yang Diselesaikan', href: '#np2problem' },
      { label: 'Testimoni', href: '#np2testimonials' },
      { label: 'FAQ', href: '#np2faq' },
      { label: 'Ambil Promo', href: '/register' },
    ],
  },
  {
    title: 'Bantuan',
    links: [
      { label: 'WhatsApp Admin', href: `https://wa.me/${ADMIN_WHATSAPP}`, external: true },
      { label: 'Email Admin', href: `mailto:${ADMIN_EMAIL}`, external: true },
      { label: 'Cara Kerja', href: '#np2steps' },
      { label: 'Kembali ke Atas', href: '#top' },
    ],
  },
];

const renderFooterLink = (link: FooterLinkItem) => {
  if (link.href.startsWith('/')) {
    return (
      <Link key={link.label} to={link.href} className="np2-footer-link">
        {link.label}
      </Link>
    );
  }

  return (
    <a
      key={link.label}
      href={link.href}
      className="np2-footer-link"
      target={link.external ? '_blank' : undefined}
      rel={link.external ? 'noreferrer' : undefined}
    >
      {link.label}
    </a>
  );
};

const getOrCreateCountdownEnd = (): number => {
  if (typeof window === 'undefined') {
    return Date.now() + DAY_IN_MS;
  }

  const storedValue = window.localStorage.getItem(COUNTDOWN_STORAGE_KEY);
  const parsedValue = storedValue ? Number.parseInt(storedValue, 10) : Number.NaN;

  if (!Number.isNaN(parsedValue) && parsedValue > Date.now()) {
    return parsedValue;
  }

  const nextValue = Date.now() + DAY_IN_MS;
  window.localStorage.setItem(COUNTDOWN_STORAGE_KEY, String(nextValue));
  return nextValue;
};

const formatCountdown = (targetTime: number): CountdownParts => {
  const remaining = Math.max(targetTime - Date.now(), 0);
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1_000);

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
};

const LandingPage: React.FC = () => {
  const heroRef = useRef<HTMLElement | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [countdownEnd, setCountdownEnd] = useState<number>(() => Date.now() + DAY_IN_MS);
  const promoPriceLabel = formatRupiah(PRODUCT_PRICE);
  const nextPriceLabel = formatRupiah(PRODUCT_PRICE + 32000);

  useEffect(() => {
    setCountdownEnd(getOrCreateCountdownEnd());
  }, []);

  const countdown = useMemo(() => formatCountdown(countdownEnd), [countdownEnd]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCountdownEnd((currentEnd) => {
        if (currentEnd <= Date.now()) {
          const nextEnd = Date.now() + DAY_IN_MS;
          window.localStorage.setItem(COUNTDOWN_STORAGE_KEY, String(nextEnd));
          return nextEnd;
        }

        return currentEnd;
      });
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const heroNode = heroRef.current;
    if (!heroNode) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(heroNode);

    return () => observer.disconnect();
  }, []);

  const scrollToDemo = () => {
    const section = document.getElementById('np2demo');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="np2-wrap" id="top">
      <header className="np2-topbar">
        <div className="np2-container np2-topbar-inner">
          <Link to="/" className="np2-brand">
            <div className="np2-brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 14H8V20H2V14ZM16 2H22V8H16V2ZM8 2C8 8 12 12 18 12V20C10 20 4 14 4 6V2H8Z" />
              </svg>
            </div>
            <div className="np2-brand-copy">
              <strong>NaikPhoto Food</strong>
              <span>AI visual studio untuk bisnis kuliner Indonesia</span>
            </div>
          </Link>

          <nav className="np2-topnav" aria-label="Navigasi utama">
            <a href="#np2fitur">Fitur</a>
            <a href="#np2pricing">Harga</a>
            <a href="#np2faq">FAQ</a>
          </nav>

          <div className="np2-topcta">
            <Link to="/login" className="np2-topbtn np2-topbtn-ghost">
              Login
            </Link>
            <Link to="/register" className="np2-topbtn np2-topbtn-solid">
              Ambil Promo
            </Link>
          </div>
        </div>
      </header>

      <div className={`np2-stickybar ${showStickyBar ? 'np2-stickybar-visible' : ''}`} id="np2sticky">
        <div className="np2-stickybar-text">
          NaikPhoto Food Studio
          <span>{promoPriceLabel} · Akses Selamanya</span>
        </div>
        <Link to="/register" className="np2-btn-sticky">
          Lanjut Checkout →
        </Link>
      </div>

      <section ref={heroRef} className="np2-hero">
        <div className="np2-container">
          <div className="np2-hero-eyebrow">
            <span className="np2-dot" /> Promo perkenalan · Stok terbatas
          </div>
          <h1>
            Foto Makananmu <span className="np2-grad">Sekelas Brand Besar</span> —
            <br />
            Tanpa Studio, Tanpa Fotografer
          </h1>
          <p className="np2-hero-sub">
            Ubah foto HP biasa jadi visual promosi siap pakai untuk katalog, feed Instagram, dan iklan —
            hanya dengan NaikPhoto Food Studio AI.
          </p>
          <div className="np2-hero-price">
            <s>Rp 499.000</s>
            <strong>{promoPriceLabel}</strong>
            <span>· Akses Selamanya · Tanpa Watermark</span>
          </div>
          <div className="np2-hero-btns">
            <Link to="/register" className="np2-btn-primary">
              Beli Sekarang →
            </Link>
            <button type="button" onClick={scrollToDemo} className="np2-btn-secondary">
              Lihat Demo Dulu
            </button>
          </div>
          <p className="np2-hero-micro">
            Tidak perlu keahlian editing · Bisa dari foto HP · Cocok catering, frozen food, bakery, rice bowl
          </p>
          <div className="np2-sp-row">
            <div className="np2-sp-item"><b>+300</b> pengguna terbantu</div>
            <div className="np2-sp-item">★ 4.9/5 rating</div>
            <div className="np2-sp-item">🎯 Fokus bisnis kuliner</div>
            <div className="np2-sp-item">📱 Mulai dari foto HP</div>
          </div>

          <div className="np2-ba-wrap">
            <div className="np2-ba-label-row">
              <div className="np2-ba-label np2-ba-label-before">✕ Foto HP Biasa</div>
              <div className="np2-ba-label np2-ba-label-after">✓ Hasil NaikPhoto AI</div>
            </div>
            <div className="np2-ba-grid">
              <div className="np2-ba-side">
                <img
                  src="https://cdn.scalev.id/uploads/1774498672/07YT9W-iOjwEAk-obmp7Mw/1774498671471-Before-Cemilan.webp"
                  alt="Foto HP biasa sebelum"
                  className="np2-before-image"
                  referrerPolicy="no-referrer"
                />
                <div className="np2-ba-overlay">Foto HP · Sebelum</div>
              </div>
              <div className="np2-ba-divider">
                <div className="np2-ba-vs">VS</div>
              </div>
              <div className="np2-ba-side">
                <img
                  src="https://cdn.scalev.id/uploads/1774498757/txMg3d5vVW5vONxVot6e9A/1774498757066-After-Cemilan.webp"
                  alt="Hasil NaikPhoto AI sesudah"
                  referrerPolicy="no-referrer"
                />
                <div className="np2-ba-overlay np2-ba-overlay-success">Hasil AI · Sesudah ✨</div>
              </div>
            </div>
            <div className="np2-hero-caps">
              <div className="np2-hero-cap">⚡ Konten promo harian siap dalam hitungan menit</div>
              <div className="np2-hero-cap">📸 Untuk katalog, feed Instagram &amp; iklan Meta Ads</div>
            </div>
          </div>
        </div>
      </section>

      <section id="np2problem" className="np2-problem">
        <div className="np2-container">
          <div className="np2-tag">Masalah yang sering terjadi</div>
          <h2 className="np2-title">Konten jualan sering mandek karena visual belum siap</h2>
          <p className="np2-desc">
            Banyak bisnis makanan punya produk enak, tapi promonya terlambat karena foto kurang menarik, edit manual ribet, atau menunggu bantuan orang lain.
          </p>
          <div className="np2-problem-grid">
            {problems.map((problem) => (
              <div key={problem.title} className="np2-problem-card">
                <div className="np2-icon">{problem.icon}</div>
                <h3>{problem.title}</h3>
                <p>{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="np2demo" className="np2-demo">
        <div className="np2-container">
          <div className="np2-tag">Demo &amp; cara kerja</div>
          <h2 className="np2-title">Lihat bagaimana NaikPhoto Studio bekerja</h2>
          <p className="np2-desc">
            Ubah foto makanan sederhana dari HP menjadi visual siap pakai untuk jualan — tanpa keahlian editing.
          </p>
          <div className="np2-demo-grid">
            <div className="np2-video-card">
              <div className="np2-video-label">Demo Aplikasi</div>
              <div className="np2-video-title">Demo dashboard NaikPhoto Studio</div>
              <div className="np2-embed np2-embed-169">
                <iframe
                  src="https://www.youtube.com/embed/9eLX6WKbgjc?rel=0&controls=1&modestbranding=1"
                  title="Demo dashboard NaikPhoto Studio"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
            <div className="np2-video-card">
              <div className="np2-video-label">Contoh Hasil</div>
              <div className="np2-video-title">Contoh hasil video konten vertikal</div>
              <div className="np2-embed np2-embed-916">
                <iframe
                  src="https://www.youtube.com/embed/yTGF-7iAHkg?rel=0&controls=1&modestbranding=1"
                  title="Contoh hasil video konten vertikal"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="np2steps" className="np2-steps">
        <div className="np2-container">
          <div className="np2-tag">3 langkah sederhana</div>
          <h2 className="np2-title">Cara pakainya cepat dipahami, bahkan oleh pemula</h2>
          <p className="np2-desc">Tidak perlu paham editing atau desain untuk mulai menggunakan NaikPhoto Studio.</p>
          <div className="np2-steps-grid">
            {steps.map((step) => (
              <div key={step.number} className="np2-step-card">
                <div className="np2-step-num">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="np2fitur" className="np2-results">
        <div className="np2-container">
          <div className="np2-tag">Contoh hasil</div>
          <h2 className="np2-title">Hasil visual yang siap langsung dipakai untuk jualan</h2>
          <p className="np2-desc">
            Contoh di bawah ini menggambarkan bagaimana foto makanan sederhana bisa jadi materi promosi yang lebih rapi dan menarik.
          </p>
          <div className="np2-results-grid">
            {results.map((result) => (
              <div key={result.title} className="np2-result-card">
                <img src={result.image} alt={result.alt} loading="lazy" referrerPolicy="no-referrer" />
                <div className="np2-result-body">
                  <div className="np2-result-topline">{result.topline}</div>
                  <h3>{result.title}</h3>
                  <p>{result.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="np2-results-featured">
          <img
            src="https://cdn.scalev.id/uploads/1775278237/3s18I3rHwMVaNRL4DhQOvw/1775278233475-Naik-Photo-Food-AI-2.webp"
            alt="Contoh hasil NaikPhoto Food Studio"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      <section id="np2testimonials" className="np2-testimonials">
        <div className="np2-container">
          <div className="np2-tag">Kisah Sukses</div>
          <h2 className="np2-title">Udah +300 F&amp;B Sellers yang Terbantu</h2>
          <p className="np2-desc">
            Jangan cuma percaya kata kami. Lihat sendiri transformasi foto produk mereka — sebelum dan sesudah pakai NaikPhoto Studio.
          </p>
          <div className="np2-testi-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.brand} className="np2-testi-card">
                <div className="np2-testi-ba">
                  <div className="np2-testi-ba-side">
                    <img
                      src={testimonial.beforeImage}
                      alt={`Sebelum ${testimonial.brand}`}
                      className="np2-before-image"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="np2-testi-ba-tag np2-testi-ba-tag-before">Sebelum</div>
                  </div>
                  <div className="np2-testi-ba-side">
                    <img
                      src={testimonial.afterImage}
                      alt={`Sesudah ${testimonial.brand}`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="np2-testi-ba-tag np2-testi-ba-tag-after">Sesudah</div>
                  </div>
                </div>
                <div className="np2-testi-stars">★★★★★</div>
                <p className="np2-testi-text">{testimonial.quote}</p>
                <div className="np2-testi-user">
                  <div className="np2-testi-avatar" style={testimonial.avatarStyle}>{testimonial.avatarLabel}</div>
                  <div className="np2-testi-meta">
                    <h4>{testimonial.brand}</h4>
                    <p>{testimonial.meta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="np2-fit">
        <div className="np2-container">
          <div className="np2-tag">Siapa yang cocok</div>
          <h2 className="np2-title">NaikPhoto Studio cocok untuk bisnis makanan seperti ini</h2>
          <p className="np2-desc">
            Kalau Anda rutin butuh visual makanan untuk katalog, promo, atau iklan — tools ini akan sangat membantu.
          </p>
          <div className="np2-fit-grid">
            {fitItems.map((item) => (
              <div key={item.label} className="np2-fit-item">
                {item.emoji} {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="np2-savings">
        <div className="np2-container">
          <div className="np2-tag">Perbandingan biaya</div>
          <h2 className="np2-title">
            Hemat Hingga <span className="np2-highlight-primary">Rp 5 Juta</span> Per Bulan
          </h2>
          <p className="np2-desc">
            Dibanding menyewa tim desain sendiri, NaikPhoto Studio membantu Anda produksi visual dengan biaya yang jauh lebih ringan.
          </p>
          <div className="np2-savings-box">
            <div className="np2-savings-grid">
              {savings.map((item) => (
                <div key={item.title} className="np2-savings-card">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <div className="np2-price-tag">
                    {item.price} <small>/ bulan</small>
                  </div>
                </div>
              ))}
            </div>
            <div className="np2-total-box">
              <p>Estimasi biaya produksi visual bulanan tanpa NaikPhoto Studio</p>
              <h3>
                Total: <span className="np2-strike">Rp 5.000.000 / bulan</span>
              </h3>
              <div className="np2-final-price">NaikPhoto Studio: {promoPriceLabel}</div>
              <Link to="/register" className="np2-btn-primary">
                Lanjut ke Checkout →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="np2pricing" className="np2-offer">
        <div className="np2-container">
          <div className="np2-offer-box">
            <div className="np2-offer-badge">🔥 Promo Perkenalan — Harga Naik Segera</div>
            <h2 className="np2-offer-title">
              Ambil Akses NaikPhoto Studio
              <br />
              Sebelum Harga Naik
            </h2>
            <p className="np2-offer-sub">
              Dapatkan akses dashboard NaikPhoto Studio, tutorial lengkap, akses selamanya, dan bonus pendukung untuk bisnis kuliner Anda.
            </p>

            <div className="np2-countdown-wrap">
              <div className="np2-countdown-label">⏰ Harga {promoPriceLabel} berakhir dalam:</div>
              <div className="np2-countdown-timer">
                <div className="np2-cd-unit">
                  <div className="np2-cd-num">{countdown.hours}</div>
                  <div className="np2-cd-label">Jam</div>
                </div>
                <div className="np2-cd-sep">:</div>
                <div className="np2-cd-unit">
                  <div className="np2-cd-num">{countdown.minutes}</div>
                  <div className="np2-cd-label">Menit</div>
                </div>
                <div className="np2-cd-sep">:</div>
                <div className="np2-cd-unit">
                  <div className="np2-cd-num">{countdown.seconds}</div>
                  <div className="np2-cd-label">Detik</div>
                </div>
              </div>
              <div className="np2-countdown-sub">Setelah timer habis, harga kembali ke {nextPriceLabel}</div>
            </div>

            <div className="np2-pricing-tiers">
              <div className="np2-tier-title">📈 Update Harga &amp; Kuota Promo:</div>
              <div className="np2-tier-list">
                {pricingTiers.map((tier) => (
                  <div
                    key={`${tier.label}-${tier.price}`}
                    className={[
                      'np2-tier-item',
                      tier.status === 'soldout' ? 'np2-tier-soldout' : '',
                      tier.status === 'active' ? 'np2-tier-active' : '',
                    ].join(' ').trim()}
                  >
                    <div className="np2-tier-info">
                      <span className="np2-tier-label">{tier.label}</span>
                      <span className="np2-tier-price">{tier.price}</span>
                    </div>
                    {tier.status === 'soldout' && <div className="np2-tier-badge-soldout">Sudah Habis</div>}
                    {tier.status === 'active' && <div className="np2-tier-badge-active">Harga Sekarang</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="np2-offer-grid">
              <div className="np2-offer-card">
                <div className="np2-offer-card-title">Yang Anda Dapatkan</div>
                <ul className="np2-feat-list">
                  <li>✅ Akses penuh dashboard NaikPhoto Studio</li>
                  <li>✅ Tutorial penggunaan langkah demi langkah</li>
                  <li>✅ Akses selamanya — bayar sekali, pakai terus</li>
                  <li>✅ Generate konten unlimited</li>
                  <li>✅ Tanpa watermark pada hasil</li>
                </ul>
              </div>
              <div className="np2-offer-card">
                <div className="np2-offer-card-title">Bonus Hari Ini</div>
                <ul className="np2-feat-list">
                  <li>🎁 Notion content calendar siap pakai</li>
                  <li>🎁 Notion content plan mingguan</li>
                  <li>🎁 Checklist best practice konten kuliner</li>
                </ul>
                <div className="np2-bonus-note">
                  Bonus ini membantu Anda langsung eksekusi konten setelah akses diterima — tidak perlu mulai dari nol.
                </div>
              </div>
            </div>

            <div className="np2-price-wrap">
              <div className="np2-old-price">Harga normal Rp 499.000</div>
              <div className="np2-main-price">
                <div className="np2-rp">Rp</div>
                <div className="np2-val">121.000</div>
              </div>
              <div className="np2-badges">
                <div className="np2-badge np2-badge-green">Hemat 80%</div>
                <div className="np2-badge np2-badge-blue">Lifetime Access</div>
                <div className="np2-badge np2-badge-blue">Tanpa Watermark</div>
              </div>
              <Link to="/register" className="np2-btn-primary np2-btn-pricing" data-track="landing_checkout_cta">
                Ya, Saya Mau Ambil Promo {promoPriceLabel} →
              </Link>
              <div className="np2-offer-meta">
                <span>🔒 Pembayaran aman &amp; terpercaya</span>
                <span>💳 QRIS / transfer bank manual</span>
                <span>📩 Akses diproses setelah konfirmasi admin</span>
              </div>

              <div className="np2-urgency">
                ⚠️ Harga promo {promoPriceLabel} hanya untuk periode perkenalan. Setelah itu kembali ke harga normal Rp 499.000.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="np2-guarantee">
        <div className="np2-container">
          <div className="np2-guarantee-box">
            <div className="np2-guarantee-icon">🛡️</div>
            <h3>Garansi 100% Works for Your Menu!</h3>
            <p>
              Khawatir AI ini terlalu canggih atau nggak cocok buat jualan seblak, ayam geprek, atau jajanan pasar kamu? Tenang!
              <strong> Kalau AI kami gagal mengenali atau hasil fotonya kurang pas, tim kami yang akan turun tangan ngebantu racikin prompt-nya sampai jadi!</strong>
              {' '}Kamu nggak bakal dibiarin bingung sendirian.
            </p>
          </div>
        </div>
      </section>

      <section id="np2faq" className="np2-faq">
        <div className="np2-container">
          <div className="np2-tag">FAQ</div>
          <h2 className="np2-title">Pertanyaan yang paling sering ditanyakan</h2>
          <p className="np2-desc">
            Ada hal yang ingin Anda pastikan sebelum memutuskan? Jawaban untuk pertanyaan umum ada di bawah ini.
          </p>
          <div className="np2-faq-wrap">
            {faqs.map((faq) => (
              <details key={faq.question} className="np2-faq-item">
                <summary>{faq.question}</summary>
                <div className="np2-faq-body">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="np2-final-wrap">
        <div className="np2-container">
          <div className="np2-final-cta">
            <h2>Jangan Biarkan Foto Biasa Jadi Alasan Bisnis Anda Kalah Bersaing</h2>
            <p>
              Ribuan UMKM kuliner sudah pakai visual yang lebih profesional untuk jualan mereka. Ambil akses NaikPhoto Studio sekarang dan mulai hasilkan konten yang lebih menarik hari ini.
            </p>
            <p className="np2-final-price-hint">
              Hanya <strong>{promoPriceLabel}</strong> · Akses Selamanya · Tanpa Watermark
            </p>
            <Link to="/register" className="np2-btn-white">
              Saya Mau Checkout Sekarang →
            </Link>
          </div>
        </div>
      </section>

      <footer className="np2-footer">
        <div className="np2-container np2-footer-grid">
          <div className="np2-footer-brand">
            <Link to="/" className="np2-brand np2-brand-footer">
              <div className="np2-brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 14H8V20H2V14ZM16 2H22V8H16V2ZM8 2C8 8 12 12 18 12V20C10 20 4 14 4 6V2H8Z" />
                </svg>
              </div>
              <div className="np2-brand-copy">
                <strong>NaikPhoto Food</strong>
                <span>Bikin visual makanan lebih menjual, lebih cepat, dan lebih rapi.</span>
              </div>
            </Link>

            <p className="np2-footer-about">
              NaikPhoto Food membantu owner kuliner menyiapkan visual promo, katalog, dan iklan lebih cepat tanpa perlu studio mahal atau editing rumit.
            </p>

            <div className="np2-footer-actions">
              <Link to="/login" className="np2-topbtn np2-topbtn-ghost">
                Login
              </Link>
              <Link to="/register" className="np2-topbtn np2-topbtn-solid">
                Ambil Promo
              </Link>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title} className="np2-footer-col">
              <h3>{group.title}</h3>
              <div className="np2-footer-links">
                {group.links.map(renderFooterLink)}
              </div>
            </div>
          ))}
        </div>

        <div className="np2-container np2-footer-bottom">
          <p>© 2026 NaikPhoto Food. Dibuat untuk membantu bisnis kuliner Indonesia tampil lebih premium dan lebih menjual.</p>
          <a href="#top" className="np2-footer-backlink">Kembali ke atas ↑</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
