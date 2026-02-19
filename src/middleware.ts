import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Добавляем заголовки для всех ответов
  response.headers.set('X-API-URL', 'https://smartprice-production.up.railway.app');
  
  return response;
}

export const config = {
  matcher: '/:path*',
};
