import './globals.css';

export const metadata = {
  title: 'AI Edit Studio Pro',
  description: 'AI Image and Video Editing Studio',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
