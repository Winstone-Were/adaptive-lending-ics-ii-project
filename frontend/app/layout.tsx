import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import QueryProvider from '@/components/providers/QueryProvider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Adaptive Lending Platform',
  description: 'AI-powered loan default prediction system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} id="non-print">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: '#011638',
                  color: '#EFF0F2',
                  border: '1px solid #0D21A1',
                },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}