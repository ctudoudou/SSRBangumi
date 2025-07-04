import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | SSR Bangumi",
    default: "SSR Bangumi"
  },
  description: "智能RSS番剧订阅和下载管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
