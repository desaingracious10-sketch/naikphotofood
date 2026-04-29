export const PRODUCT_PRICE: number = (() => {
  const raw = import.meta.env.VITE_PRODUCT_PRICE;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 299000;
})();

export const formatRupiah = (value: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);

export const ADMIN_WHATSAPP = import.meta.env.VITE_ADMIN_WA ?? '6282261039601';
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? 'naikcetakexclusive@gmail.com';
export const QRIS_IMAGE = import.meta.env.VITE_QRIS_IMAGE ?? '/images/qris/qris-naikcetak.png';

export interface BankAccount {
  code: 'bca' | 'mandiri';
  label: string;
  accountNumber: string;
  accountName: string;
}

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    code: 'bca',
    label: 'BCA',
    accountNumber: import.meta.env.VITE_BCA_NO_REK ?? '2740238623',
    accountName: import.meta.env.VITE_BCA_ATAS_NAMA ?? 'Dwi Retno Dinda Ramdhiani',
  },
  {
    code: 'mandiri',
    label: 'Mandiri',
    accountNumber: import.meta.env.VITE_MANDIRI_NO_REK ?? '1610017114047',
    accountName: import.meta.env.VITE_MANDIRI_ATAS_NAMA ?? 'Dwi Retno Dinda Ramdhiani',
  },
];

export const DEFAULT_BANK_CODE: BankAccount['code'] = 'bca';
