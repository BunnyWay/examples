import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Upload to Bunny Storage over S3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
