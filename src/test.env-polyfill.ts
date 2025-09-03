// Minimal browser polyfill for Node-style process.env used in tests
declare global {
  interface Window {
    process?: { env: Record<string, string> };
  }
}

if (typeof window !== 'undefined') {
  window.process = window.process || { env: {} };
}

export {};

