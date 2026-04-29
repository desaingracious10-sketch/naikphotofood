import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard Keuangan', icon: '📊', end: true },
  { to: '/admin/users', label: 'Manajemen User', icon: '👥' },
  { to: '/admin/settings', label: 'Pengaturan', icon: '⚙️' },
];

const AdminLayout: React.FC = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">

        <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0">
          <div className="px-6 py-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 14H8V20H2V14ZM16 2H22V8H16V2ZM8 2C8 8 12 12 18 12V20C10 20 4 14 4 6V2H8Z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight">NaikPhoto</p>
                <p className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold">Admin Panel</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 py-6 px-3 space-y-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="px-3 pb-6 pt-4 border-t border-slate-800 space-y-2">
            {profile && (
              <div className="px-3 py-2 text-xs text-slate-400">
                <p className="text-white font-semibold truncate">{profile.full_name}</p>
                <p className="truncate text-[11px]">{profile.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-red-600/10 hover:text-red-300 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar
            </button>
          </div>
        </aside>

        <main className="flex-1 ml-64 min-h-screen">
          <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                NaikPhoto — Super Admin Panel
              </h1>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Admin Mode
                </span>
              </div>
            </div>
          </header>

          <div className="p-8">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
