import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Auth0Provider } from "./contexts/Auth0Context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A-Eye - AI Surveillance Dashboard",
  description: "A-Eye: Advanced AI-powered surveillance and security monitoring system",
  icons: {
    icon: "/Gemini_Generated_Image_sztu51sztu51sztu.png",
    shortcut: "/Gemini_Generated_Image_sztu51sztu51sztu.png",
    apple: "/Gemini_Generated_Image_sztu51sztu51sztu.png",
  },
  openGraph: {
    title: "A-Eye - AI Surveillance Dashboard",
    description: "A-Eye: Advanced AI-powered surveillance and security monitoring system",
    images: [
      {
        url: "/Gemini_Generated_Image_sztu51sztu51sztu.png",
        width: 1200,
        height: 630,
        alt: "A-Eye Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "A-Eye - AI Surveillance Dashboard",
    description: "A-Eye: Advanced AI-powered surveillance and security monitoring system",
    images: ["/Gemini_Generated_Image_sztu51sztu51sztu.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Auth0Provider>
          {children}
        </Auth0Provider>
      </body>
    </html>
  );
}
