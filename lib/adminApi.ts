import { supabase } from './supabase';
import { ProfileStatus } from '../types';

export const PRODUCT_PRICE: number = (() => {
  const raw = import.meta.env.VITE_PRODUCT_PRICE;
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : 299000;
})();

export const formatRupiah = (n: number): string =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export const updateUserStatus = async (
  userId: string,
  status: ProfileStatus
): Promise<void> => {
  const updates: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === 'active') {
    updates.activated_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw new Error(error.message);
};

/**
 * Permanent delete: removes profile row + auth user.
 * Calls the `admin-delete-user` Edge Function which holds the service role key
 * server-side. The function verifies the caller is an admin before executing.
 */
export const deleteUserCompletely = async (userId: string): Promise<void> => {
  const { data, error } = await supabase.functions.invoke('admin-delete-user', {
    body: { userId },
  });

  if (error) {
    throw new Error(
      `Edge function error: ${error.message}. Pastikan function 'admin-delete-user' sudah di-deploy ke Supabase.`
    );
  }
  if (data?.error) {
    throw new Error(data.error);
  }
};

export const exportProfilesToCSV = (
  rows: Array<{ full_name: string; email: string; whatsapp: string; status: string; created_at: string }>
): void => {
  const headers = ['Nama', 'Email', 'WhatsApp', 'Status', 'Tanggal Daftar'];
  const escape = (val: string) => `"${(val ?? '').replace(/"/g, '""')}"`;
  const lines = [
    headers.join(','),
    ...rows.map(r => [
      escape(r.full_name),
      escape(r.email),
      escape(r.whatsapp),
      escape(r.status),
      escape(new Date(r.created_at).toLocaleString('id-ID')),
    ].join(',')),
  ];
  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `naikphoto_users_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
