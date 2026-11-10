import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "abi_admin_token";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev_secret_change_me");

async function isValidToken(token) {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export default async function proxy(req) {
    const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApiRoute =
    pathname.startsWith("/api/products") ||
    pathname.startsWith("/api/categories") ||
    pathname.startsWith("/api/upload") ||
    (pathname.startsWith("/api/orders") && !pathname.startsWith("/api/orders/track"));

  const method = req.method;
  const isReadOnlyPublic =
    method === "GET" && (pathname.startsWith("/api/products") || pathname.startsWith("/api/categories"));

  const isPublicOrderCreate = pathname === "/api/orders" && method === "POST";

  if (!isAdminRoute && (!isAdminApiRoute || isReadOnlyPublic || isPublicOrderCreate)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token || !(await isValidToken(token))) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/products/:path*", "/api/categories/:path*", "/api/orders/:path*", "/api/upload/:path*"],
};