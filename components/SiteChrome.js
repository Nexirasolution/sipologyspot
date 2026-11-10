// components/SiteChrome.js
import { getSettings } from "@/lib/settings";
import Navbar from "./Navbar";
import Footer from "./Footer";

export async function SiteNavbar() {
  const settings = await getSettings();
  return <Navbar settings={settings} />;
}

export async function SiteFooter() {
  const settings = await getSettings();
  return <Footer settings={settings} />;
}