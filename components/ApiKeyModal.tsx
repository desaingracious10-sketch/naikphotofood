import React, { useState, useEffect } from 'react';
import {
  ApiKeyEntry,
  getAllKeys,
  addKey,
  removeKey,
  resetAllFailCounts,
  getKeyStatus,
  cooldownRemainingMs,
} from '../utils/apiKeyManager';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const maskKey = (key: string): string => {
  if (key.length <= 4) return '****';
  return `***${key.slice(-4)}`;
};

const formatCooldown = (ms: number): string => {
  const totalMin = Math.ceil(ms / 60000);
  return `${totalMin} mnt`;
};

const StatusBadge: React.FC<{ entry: ApiKeyEntry }> = ({ entry }) => {
  const status = getKeyStatus(entry);
  if (status === 'active') {
    return (
      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
        ✅ Aktif
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg">
        ⚠️ Gagal
      </span>
    );
  }
  const remaining = cooldownRemainingMs(entry);
  return (
    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg">
      🔄 Cooldown {formatCooldown(remaining)}
    </span>
  );
};

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const refresh = () => setKeys(getAllKeys());

  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = () => {
    const trimmed = newKey.trim();
    if (!trimmed) {
      alert('Mohon masukkan API Key terlebih dahulu.');
      return;
    }
    addKey(trimmed, newLabel.trim() || undefined);
    setNewKey('');
    setNewLabel('');
    refresh();
  };

  const handleRemove = (id: string) => {
    if (confirm('Hapus API Key ini?')) {
      removeKey(id);
      refresh();
    }
  };

  const handleResetAll = () => {
    resetAllFailCounts();
    refresh();
  };

  const hasKeys = keys.length > 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">

        <div className="flex justify-between items-start px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Kelola API Key
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Tambahkan beberapa key sekaligus. Sistem otomatis berpindah saat satu key kena limit.
            </p>
          </div>
          {hasKeys && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Tutup"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Key Tersimpan ({keys.length})
              </h3>
              {hasKeys && (
                <button
                  onClick={handleResetAll}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Reset Semua Status Gagal
                </button>
              )}
            </div>

            {!hasKeys ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="text-slate-500 text-sm">Belum ada API Key. Tambahkan minimal satu key untuk mulai.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {keys.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm text-slate-900 truncate">{entry.label}</p>
                        <StatusBadge entry={entry} />
                      </div>
                      <p className="text-xs text-slate-500 font-mono">{maskKey(entry.key)}</p>
                      {entry.failCount > 0 && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Fail count: {entry.failCount}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(entry.id)}
                      className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-colors"
                      title="Hapus key"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3 bg-blue-50/40 border border-blue-100 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">
              + Tambah API Key Baru
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama / Label (opsional)
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Contoh: Akun Utama, Akun Cadangan"
                className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                API Key <span className="text-blue-600">*</span>
              </label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                placeholder="AIzaSy..."
                autoComplete="off"
                className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white font-mono focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              />
            </div>

            <button
              onClick={handleAdd}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-700 hover:to-blue-950 text-white font-bold py-3 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              Tambahkan Key
            </button>

            <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
              🔒 Key disimpan lokal di browser kamu (Local Storage) dan tidak pernah dikirim ke server kami.
            </p>
          </section>

          <section className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
            >
              <span className="text-sm font-bold text-slate-800">
                ❓ Cara Mendapatkan API Key (Gratis, ~2 menit)
              </span>
              <svg
                className={`w-4 h-4 text-slate-500 transition-transform ${showGuide ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showGuide && (
              <div className="px-5 pb-5 pt-1 text-sm text-slate-600 space-y-2 leading-relaxed border-t border-slate-100">
                <ol className="list-decimal list-inside space-y-1.5 mt-3">
                  <li>
                    Buka{' '}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-semibold underline"
                    >
                      aistudio.google.com
                    </a>
                  </li>
                  <li>Klik <strong>"Get API Key"</strong> di sidebar kiri</li>
                  <li>Klik <strong>"Create API Key"</strong></li>
                  <li>Copy key yang muncul</li>
                  <li>Paste di kolom <strong>API Key</strong> di atas</li>
                </ol>
                <p className="text-xs text-slate-500 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  💡 <strong>Catatan:</strong> Satu akun Google = satu key gratis dengan kuota harian. Untuk hasil maksimal, tambahkan beberapa key dari akun Google berbeda — sistem akan otomatis berpindah saat satu key kena limit.
                </p>
              </div>
            )}
          </section>

        </div>

        <div className="px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            disabled={!hasKeys}
            className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]"
          >
            {hasKeys ? 'Selesai & Tutup' : 'Tambahkan minimal satu key untuk melanjutkan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
