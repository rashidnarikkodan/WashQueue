import './tailwind.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: "WashQueue",
    template: "%s | WashQueue",
  },
  description:
    "Real-time queue-based and dispatch-based vehicle wash management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-blue-500 text-[#E5E5E6] antialiased">
        {children}
      </body>
    </html>
  );
}
