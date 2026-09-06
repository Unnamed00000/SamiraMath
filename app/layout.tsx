import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SamiMath',
  description: 'Детское приложение для изучения таблицы умножения вместе с Самирой.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
