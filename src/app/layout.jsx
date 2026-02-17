import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata = {
  title: 'ATMS - Agricultural Trading Management System',
  description: 'Manage inventory, sales, purchases, and reports for your agricultural trading business.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  );
}
