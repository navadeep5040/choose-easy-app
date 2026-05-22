import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isVercel = process.env.VERCEL === "1" || !!process.env.VERCEL;
  const isHttps = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
  const secureCookie = isVercel || isHttps;

  // Retrieve token using getToken with explicit options
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie,
  });

  console.log(`[Middleware Custom] Path: ${pathname}`);
  console.log(`[Middleware Custom] SecureCookie: ${secureCookie}`);
  console.log(`[Middleware Custom] Token exists: ${!!token}`);
  console.log(`[Middleware Custom] NEXTAUTH_SECRET defined: ${!!process.env.NEXTAUTH_SECRET} Length: ${process.env.NEXTAUTH_SECRET?.length}`);

  // If no token exists, or session token is corrupted (missing role or id), redirect to login
  if (!token || !token.role || !token.id) {
    if (token) {
      console.warn(`[Middleware Custom] Incomplete/corrupted session token detected for path ${pathname}. Redirecting to login.`);
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string | undefined;

  // 1. Admin paths security & redirects
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      if (role === "mentor") {
        return NextResponse.redirect(new URL("/mentor-dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // 2. Mentor dashboard security & redirects
  if (pathname.startsWith("/mentor-dashboard")) {
    if (role !== "mentor") {
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      const url = new URL("/dashboard", req.url);
      if (role === "pending_mentor") {
        url.searchParams.set("mentor", "pending");
      }
      return NextResponse.redirect(url);
    }
  }

  // 3. Student dashboard redirects (only user & pending_mentor should access)
  if (pathname === "/dashboard") {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (role === "mentor") {
      return NextResponse.redirect(new URL("/mentor-dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/admin",
    "/admin/:path*",
    "/mentor-dashboard",
    "/mentor-dashboard/:path*",
    "/profile",
    "/profile/:path*",
  ],
};
