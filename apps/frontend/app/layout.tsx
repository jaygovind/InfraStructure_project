
export const metadata = {
  title: 'SwiftRide',
  description: 'Uber-like demo app'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
