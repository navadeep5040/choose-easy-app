import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Only approved mentors may access mentor dashboard
    if (pathname.startsWith("/mentor-dashboard") && role !== "mentor") {
      const url = new URL("/dashboard", req.url);
      if (role === "pending_mentor") {
        url.searchParams.set("mentor", "pending");
      }
      return NextResponse.redirect(url);
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
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
