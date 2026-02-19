import type { Metadata } from 'next'
import './globals.css'
import OwnerModeActivator from '@/components/owner/OwnerModeActivator'

export const metadata: Metadata = {
  title: 'SmartPrice - Умный поиск товаров',
  description: 'Находите лучшие предложения по цене, качеству и скорости доставки',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        {children}
        <OwnerModeActivator />
      </body>
    </html>
  )
}
