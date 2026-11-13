/**
 * Root layout: wraps every page, including /login.
 * Sets the page title, the phone status-bar colour and the global CSS.
 */
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Nihongo Daily", template: "%s · Nihongo Daily" },
  description: "Everyday Japanese conversation practice.",
  // Lets iOS open the site full screen when added to the home screen.
  appleWebApp: { capable: true, title: "Nihongo", statusBarStyle: "default" },
  // A personal app: keep it out of search engines.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Draw under the notch / home indicator; pages add safe-area padding.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#12141a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
