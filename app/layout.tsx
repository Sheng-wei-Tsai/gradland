import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: { default: 'My Little Corner', template: '%s · My Little Corner' },
  description: 'Thoughts on tech, design, life, and everything in between.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main style={{ minHeight: '70vh' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
