import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  error?: string;
  from?: string;
}

const LoginPage: React.FC = () => {
  const { signIn, isAuthenticated, isActive } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialError = (location.state as LocationState | null)?.error ?? null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isActive) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, isActive, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate('/app', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login gagal.');
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
          <h2 className="text-xl font-bold text-white">Selamat Datang Kembali</h2>
          <p className="text-slate-400 text-sm mt-1">Masuk untuk mulai bikin konten.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="kamu@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
              autoComplete="current-password"
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
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>

          <p className="text-center text-sm text-slate-400 pt-2">
            Belum punya akun?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
              Daftar di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
