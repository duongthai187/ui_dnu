import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ModeToggle } from "@/components/mode-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FTA AI - Viện Công nghệ Tài chính",
  description: "Hãy hỏi Viện Công nghệ Tài chính bất cứ điều gì bạn muốn ^^"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased tracking-tight min-h-screen overflow-x-hidden ${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="light">
          {/* Đặt ModeToggle ở góc phải trên cùng, overlay lên nội dung nhưng không chiếm không gian layout */}
          <div className="fixed top-4 right-4 z-50">
            <ModeToggle />
          </div>
          <div className="w-full h-full">{/* Không padding top, không min-h-screen, không overflow thừa */}
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
