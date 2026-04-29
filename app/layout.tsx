import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contflix Portal",
  description: "SaaS de gestão contábil premium"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
