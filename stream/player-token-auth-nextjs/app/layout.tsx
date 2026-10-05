import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Token-authenticated Bunny Player in Next.js",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
