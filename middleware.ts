import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "grounds_admin";
const ADMIN_SECRET = process.env.ADMIN_SECRET;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard /admin routes
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Allow the login page itself through
  if (pathname === "/admin/login") return NextResponse.next();

  // No secret configured → block entirely in production, allow in dev
  if (!ADMIN_SECRET) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Admin secret not configured.", { status: 503 });
    }
    return NextResponse.next();
  }

  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (cookie === ADMIN_SECRET) return NextResponse.next();

  // Redirect to login, preserve intended destination
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
