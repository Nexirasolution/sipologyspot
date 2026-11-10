import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const phone = (searchParams.get("phone") || "").trim();
    const orderNumber = (searchParams.get("orderNumber") || "").trim();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }

    // Normalize: match last 10 digits so +91 prefix doesn't matter
    const digits = phone.replace(/\D/g, "").slice(-10);
    if (digits.length !== 10) {
      return NextResponse.json({ error: "Enter a valid 10-digit phone number." }, { status: 400 });
    }

    const query = { "customer.phone": { $regex: `${digits}$` } };
    if (orderNumber) query.orderNumber = orderNumber.toUpperCase();

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(20);

    if (orders.length === 0) {
      return NextResponse.json({ error: "No orders found for this phone number." }, { status: 404 });
    }

    return NextResponse.json({ orders });
  } catch (err) {
    return NextResponse.json({ error: "Failed to track order." }, { status: 500 });
  }
}
