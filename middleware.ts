import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const sessionCookie = req.cookies.get("session");
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: "/data/:path*",
};
