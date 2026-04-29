/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_PRODUCT_PRICE?: string;
  readonly VITE_ADMIN_EMAIL?: string;
  readonly VITE_BCA_NO_REK?: string;
  readonly VITE_BCA_ATAS_NAMA?: string;
  readonly VITE_MANDIRI_NO_REK?: string;
  readonly VITE_MANDIRI_ATAS_NAMA?: string;
  readonly VITE_ADMIN_WA?: string;
  readonly VITE_QRIS_IMAGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
