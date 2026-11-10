// lib/settings.js
import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";

const DEFAULTS = {
  storeName: "Abi Foods & Oils",
  email: "abifoodsandoils@gmail.com",
  phone: "+91 9344936684",
  whatsapp: "919344936684",
  address: "Kosakattur, Kodumudi, Erode, Tamil Nadu",
  shippingFee: 49,
  freeShipping: 999,
  deliveryTime: "2-4 Days",
  instagram: "",
  facebook: "",
  youtube: "",
  seoTitle: "Abi Foods & Oils | Cold-Pressed Marachekku Oils & Traditional Powders",
  seoDescription:
    "Abi Foods & Oils brings you traditional marachekku groundnut, sesame, and coconut oils, along with authentic sambar powder, curry masala, idli podi, health mix, and more from Erode.",
  maintenanceMode: false,
};

export async function getSettings() {
  await connectDB();
  const settings = await Settings.findOne().lean();
  return settings ? JSON.parse(JSON.stringify(settings)) : DEFAULTS;
}