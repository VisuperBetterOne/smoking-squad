/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 在這裡定義您的環境變數類型，能讓寫程式時有自動提示
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_DATABASE_URL: string;
  // ... 其他變數
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}