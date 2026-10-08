import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js on Bunny Storage",
  description: "A static Next.js export served from Bunny Storage through Bunny CDN.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
