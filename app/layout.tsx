import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "./providers";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
});
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow-condensed",
});

export const metadata: Metadata = {
  title: "IBPL — IIT Indore Basketball Premier League",
  description:
    "Official tournament management platform for the IIT Indore Basketball Premier League",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${barlow.variable} ${barlowCondensed.variable} font-sans bg-gray-950 text-gray-100 min-h-screen`}
      >
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-56px)]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
