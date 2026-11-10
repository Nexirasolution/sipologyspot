import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import BottomNav from "@/components/BottomNav";
import A11yProvider from "@/components/A11yProvider";
import RouteAnnouncer from "@/components/RouteAnnouncer";
import ReadAloud from "@/components/ReadAloud";
import { getSettings } from "@/lib/settings";

/* Professional pairing: Plus Jakarta Sans (bold headings) + Inter (body text) */
const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: settings.seoTitle || "Abi Foods and Oils | Wood Cold-Pressed Oils & Traditional Spice Powders",
    description:
      settings.seoDescription ||
      "Abi Foods and Oils — wood cold-pressed groundnut, sesame & coconut oils and traditional spice powders, made in Kosakattur, Kodumudi, Erode.",
    icons: {
      icon: "/images/logo.png",
      shortcut: "/images/logo.png",
      apple: "/images/logo.png",
    },
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSettings();

  if (settings.maintenanceMode) {
    return (
      <html lang="en" className={`${display.variable} ${body.variable}`}>
        <body className="flex min-h-screen items-center justify-center bg-white px-5 text-center font-body antialiased">
          <main id="main-content" tabIndex={-1}>
            <h1 className="text-3xl font-extrabold text-ink md:text-5xl">{"We'll be back soon"}</h1>
            <p className="mt-4 font-semibold text-muted">
              {settings.storeName} is currently undergoing maintenance.
            </p>
          </main>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="pb-16 font-body antialiased md:pb-0">
        <A11yProvider>
          <CartProvider>
            {/* The skip link lives in Navbar.jsx, so it is the first focusable item on each page */}
            {children}
            <FloatingWhatsApp whatsapp={settings.whatsapp} />
            <BottomNav />
          </CartProvider>

          <RouteAnnouncer />
          <ReadAloud />
        </A11yProvider>
      </body>
    </html>
  );
}