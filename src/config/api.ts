// API Configuration
export const API_URL = 'https://smartprice-production.up.railway.app';

export const getApiUrl = (): string => {
  return API_URL;
};

// Для совместимости со старым кодом
if (typeof window !== 'undefined') {
  (window as any).NEXT_PUBLIC_API_URL = API_URL;
}
