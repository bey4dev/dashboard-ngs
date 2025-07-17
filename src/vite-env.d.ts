/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_GOOGLE_CLIENT_SECRET: string
  readonly VITE_GOOGLE_REDIRECT_URI: string
  readonly VITE_GOOGLE_SHEETS_ID: string
  readonly VITE_DEV_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
