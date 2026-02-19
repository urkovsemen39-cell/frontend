// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smartprice-production.up.railway.app';

export const getApiUrl = (): string => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return API_URL;
};

// Для совместимости со старым кодом
if (typeof window !== 'undefined') {
  (window as any).NEXT_PUBLIC_API_URL = API_URL;
}
