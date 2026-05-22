import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = token?.role as string | undefined;

    console.log(`[Middleware Log] Path: ${pathname}`);
    console.log(`[Middleware Log] Token:`, JSON.stringify(token));
    console.log(`[Middleware Log] Cookies:`, JSON.stringify(req.cookies.getAll().map(c => ({ name: c.name, valueLength: c.value?.length }))));

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
  },
  {
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      authorized: ({ req, token }) => {
        console.log(`[Middleware Authorized Callback] Path:`, req.nextUrl.pathname);
        console.log(`[Middleware Authorized Callback] Token exists:`, !!token);
        console.log(`[Middleware Authorized Callback] NEXTAUTH_SECRET defined:`, !!process.env.NEXTAUTH_SECRET, `Length:`, process.env.NEXTAUTH_SECRET?.length);
        console.log(`[Middleware Authorized Callback] Cookies:`, JSON.stringify(req.cookies.getAll().map(c => ({ name: c.name, valueLength: c.value?.length }))));
        console.log(`[Middleware Authorized Callback] Headers X-Forwarded-Proto:`, req.headers.get('x-forwarded-proto'));
        return !!token;
      },
    },
  }
);

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
