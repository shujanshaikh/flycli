declare global {
  interface Window {
    FLYCLI_APP_PORT?: number;
  }
}

export function getAppPort(): number {
  return typeof window !== 'undefined' && window.FLYCLI_APP_PORT 
    ? window.FLYCLI_APP_PORT 
    : 3000;
}

