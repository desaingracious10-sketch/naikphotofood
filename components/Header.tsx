import React from 'react';

interface HeaderProps {
  onOpenKeys: () => void;
  onLogout?: () => void;
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ onOpenKeys, onLogout, userName }) => {
  return (
    <header className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-900 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 14H8V20H2V14ZM16 2H22V8H16V2ZM8 2C8 8 12 12 18 12V20C10 20 4 14 4 6V2H8Z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Naik<span className="text-blue-600">Photo</span>
              </h1>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Creative Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {userName && (
              <span className="text-sm text-slate-600 font-medium hidden sm:inline">
                Halo, <span className="text-slate-900 font-bold">{userName.split(' ')[0]}</span>
              </span>
            )}
            <button
              onClick={onOpenKeys}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-700 px-4 py-2.5 rounded-2xl text-sm font-semibold shadow-sm transition-all active:scale-95"
              title="Kelola API Key"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span className="hidden sm:inline">Kelola API Key</span>
              <span className="sm:hidden">API Key</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-700 hover:text-red-700 px-4 py-2.5 rounded-2xl text-sm font-semibold shadow-sm transition-all active:scale-95"
                title="Keluar"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
