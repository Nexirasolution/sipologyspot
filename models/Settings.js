import mongoose from "mongoose";

const StateShippingRateSchema = new mongoose.Schema(
  {
    state: { type: String, required: true, trim: true },
    fee: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const SettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "Abi Foods & Oils" },
    email: { type: String, default: "abifoodsandoils@gmail.com" },
    phone: { type: String, default: "+91 9344936684" },
    whatsapp: { type: String, default: "919344936684" },
    address: { type: String, default: "Kosakattur, Kodumudi, Erode, Tamil Nadu" },

    // Default/fallback fee used when the customer's state has no specific rate below.
    shippingFee: { type: Number, default: 49 },
    // Order subtotal (₹) at or above which shipping is free, regardless of state.
    freeShipping: { type: Number, default: 999 },
    // Per-state overrides. Any state not listed here falls back to `shippingFee`.
    stateShippingRates: { type: [StateShippingRateSchema], default: [] },

    deliveryTime: { type: String, default: "2-4 Days" },

    instagram: { type: String, default: "" },
    facebook: { type: String, default: "" },
    youtube: { type: String, default: "" },

    seoTitle: { type: String, default: "Abi Foods & Oils | Cold-Pressed Marachekku Oils & Traditional Powders" },
    seoDescription: {
      type: String,
      default:
        "Abi Foods & Oils brings you traditional marachekku groundnut, sesame, and coconut oils, along with authentic sambar powder, curry masala, idli podi, health mix, and more from Erode.",
    },

    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);