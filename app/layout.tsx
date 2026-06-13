import type { Metadata, Viewport } from "next";
import { ConvexClientProvider } from "@/components/shared/convex-provider";
import { PwaRegistration } from "@/components/shared/pwa-registration";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hack-A-Ton",
  description:
    "Discover Philippine hackathons, find teammates, and build your hackathon portfolio.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Hack-A-Ton",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/brand/hack-a-ton-logo.svg",
    apple: "/brand/hack-a-ton-logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <PwaRegistration />
      </body>
    </html>
  );
}
