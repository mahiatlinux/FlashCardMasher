/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_DEBUG: string;
    // add more environment variables as needed
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  
  interface Window {
    ENV?: {
      VITE_API_URL?: string;
      VITE_DEBUG?: string;
      // add more environment variables as needed
    };
  }