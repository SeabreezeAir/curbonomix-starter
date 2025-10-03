import './globals.css';

export const metadata = {
  title: 'Curbonomix — AI Curb Adapter',
  description: 'First AI curb adapter engineering platform.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
