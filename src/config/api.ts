// API Configuration
const API_URL = 'https://smartprice-production.up.railway.app';

export const getApiUrl = (): string => {
  // Проверяем, что URL полный
  if (!API_URL || API_URL.length < 20) {
    console.error('Invalid API_URL:', API_URL);
    return 'https://smartprice-production.up.railway.app';
  }
  return API_URL;
};

// Для совместимости
if (typeof window !== 'undefined') {
  (window as any).NEXT_PUBLIC_API_URL = API_URL;
}

// Для совместимости со старым кодом
if (typeof window !== 'undefined') {
  (window as any).NEXT_PUBLIC_API_URL = API_URL;
}
