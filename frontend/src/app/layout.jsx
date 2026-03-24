import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sentinel Cloud",
  description: "A Cloud Services for IoT",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} selection:bg-indigo-500/30 selection:text-indigo-200`}>
      <Toaster/>
        {children}
        
      </body>
    </html>
  );
}