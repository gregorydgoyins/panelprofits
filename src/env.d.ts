/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_RUNWAYML_API_KEY: string
  readonly VITE_ELEVEN_LABS_API_KEY: string
  readonly VITE_ARTLIST_API_KEY: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}