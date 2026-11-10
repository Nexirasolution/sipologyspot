import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    if (!fromParam || !toParam) {
      return NextResponse.json({ error: "from and to dates are required" }, { status: 400 });
    }

    const from = new Date(fromParam);
    from.setHours(0, 0, 0, 0);
    const to = new Date(toParam);
    to.setHours(23, 59, 59, 999);

    if (isNaN(from) || isNaN(to) || from > to) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    const orders = await Order.find({
      createdAt: { $gte: from, $lte: to },
      status: { $ne: "cancelled" },
    })
      .sort({ createdAt: 1 })
      .select("orderNumber createdAt customer total status paymentMethod paymentStatus items");

    const totalSales = orders.reduce((acc, o) => acc + o.total, 0);
    const totalOrders = orders.length;

    // Top selling products
    const productTotals = {};
    for (const order of orders) {
      for (const item of order.items) {
        if (!productTotals[item.name]) productTotals[item.name] = { qty: 0, revenue: 0 };
        productTotals[item.name].qty += item.quantity;
        productTotals[item.name].revenue += item.quantity * item.price;
      }
    }
    const topSelling = Object.entries(productTotals)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 10)
      .map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue }));

    // Daily breakdown
    const dailyMap = {};
    for (const o of orders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (!dailyMap[key]) dailyMap[key] = { total: 0, count: 0 };
      dailyMap[key].total += o.total;
      dailyMap[key].count += 1;
    }
    const dailyBreakdown = Object.entries(dailyMap)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, v]) => ({ date, total: v.total, count: v.count }));

    // Payment method breakdown (useful given COD/UPI/Online)
    const paymentMap = {};
    for (const o of orders) {
      const key = o.paymentMethod || "Unknown";
      if (!paymentMap[key]) paymentMap[key] = { count: 0, total: 0 };
      paymentMap[key].count += 1;
      paymentMap[key].total += o.total;
    }
    const paymentBreakdown = Object.entries(paymentMap).map(([method, v]) => ({
      method,
      count: v.count,
      total: v.total,
    }));

    return NextResponse.json({
      from: fromParam,
      to: toParam,
      totalSales,
      totalOrders,
      averageOrderValue: totalOrders ? totalSales / totalOrders : 0,
      topSelling,
      dailyBreakdown,
      paymentBreakdown,
      orders: orders.map((o) => ({
        orderNumber: o.orderNumber,
        date: o.createdAt,
        customerName: o.customer?.name || "-",
        customerPhone: o.customer?.phone || "-",
        total: o.total,
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate report." }, { status: 500 });
  }
}