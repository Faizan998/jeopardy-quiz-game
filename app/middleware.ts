import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
export { default } from "next-auth/middleware";


export async function middleware(req: NextRequest) {
  // Get the session token with full session data
  const session = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  // Log session info for debugging
  console.log("Session in middleware:", session);

  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin-dashboard");
  const isGameRoute = req.nextUrl.pathname.startsWith("/game");

  // Case 1: Admin dashboard access without authentication - redirect to home
  if (isAdminRoute && !session) {
    console.log("Redirecting unauthenticated user from admin dashboard to home");
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Case 2: Admin dashboard access without ADMIN role - redirect to home
  if (isAdminRoute && session?.role !== "ADMIN") {
    console.log("Redirecting non-admin user from admin dashboard to home");
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Case 3: Other protected routes without authentication - redirect to login
  if (isGameRoute && !session) {
    console.log("Redirecting unauthenticated user from game to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: ["/game", "/admin-dashboard"],
};
