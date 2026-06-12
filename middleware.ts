import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "grounds_admin";
const ADMIN_SECRET = process.env.ADMIN_SECRET;

// Prevent Vercel preview/branch deployments from being indexed by search engines
const IS_NON_PROD = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";

function withNoindexIfPreview(res: NextResponse): NextResponse {
  if (IS_NON_PROD) res.headers.set("X-Robots-Tag", "noindex");
  return res;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard /admin routes
  if (!pathname.startsWith("/admin")) {
    return withNoindexIfPreview(NextResponse.next());
  }

  // Allow the login page itself through
  if (pathname === "/admin/login") return withNoindexIfPreview(NextResponse.next());

  // No secret configured → block entirely in production, allow in dev
  if (!ADMIN_SECRET) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Admin secret not configured.", { status: 503 });
    }
    return withNoindexIfPreview(NextResponse.next());
  }

  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (cookie === ADMIN_SECRET) return withNoindexIfPreview(NextResponse.next());

  // Redirect to login, preserve intended destination
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
