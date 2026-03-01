import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { SmoothScroll } from "@/components/animations/smooth-scroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | ArchSentinel',
    default: 'ArchSentinel | Enterprise Architecture Intelligence',
  },
  description: "AI-powered threat modeling, security architecture analysis, and compliance tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ConvexClientProvider>
            <SmoothScroll>
              {children}
            </SmoothScroll>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
