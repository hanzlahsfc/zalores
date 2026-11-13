import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { CartProvider } from "@/components/CartProvider";
import { CatalogProvider } from "@/components/CatalogProvider";
import { getCatalog } from "@/lib/catalog";
import CartDrawer from "@/components/CartDrawer";

const body = Assistant({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s – ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    images: ["/assets/img/og.jpg"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const catalog = await getCatalog();
  return (
    <html lang="en" className={body.variable}>
      <body>
        <CatalogProvider initial={catalog}>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
