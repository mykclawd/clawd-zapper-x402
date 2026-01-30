import type { Metadata } from "next";
import { ThirdwebProvider } from "thirdweb/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clawd Zapper API",
  description: "Zapper swap feed via x402 micropayments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThirdwebProvider>
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  );
}
