import type { Metadata } from "next";
import { Poppins, Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

const fontSans = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const fontMono = Ubuntu_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "DACS - Healthcare Management System",
  description: "Digital Appointment and Clinic System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} antialiased`}
    >
      <body className="min-h-full font-sans">
        <QueryProvider>
        {children}
        </QueryProvider>
      </body>
    </html>
  );
}