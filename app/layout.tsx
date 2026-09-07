import localFont from "next/font/local";
import "../src/index.css";
import "../src/App.css";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "../public/fonts/Geist-VariableFont_wght.ttf",
  variable: "--font-geist-sans",
  display: "swap",
});

const michroma = localFont({
  src: "../public/fonts/Michroma-Regular.ttf",
  variable: "--font-michroma",
  weight: "400",
  display: "swap",
});

export const metadata = {
  title: "SAMA — Enterprise BOM Synchronization",
  description: "SAMA — Enterprise BOM Synchronization & Engineering Change Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${michroma.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
