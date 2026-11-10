import { NextResponse } from "next/server";
import { signAdminToken, setAdminCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    if (email.trim().toLowerCase() !== ADMIN_EMAIL?.toLowerCase() || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = signAdminToken({ email, role: "admin" });
    await setAdminCookie(token);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
