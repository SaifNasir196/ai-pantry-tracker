import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster"
import { Providers } from './providers';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PanTrycker",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body className={`${inter.className}`}>
        <Providers>
          <Header loggedIn={true} />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
