import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
export { default } from "next-auth/middleware";

export async function middleware(req: NextRequest) {
  const session = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  console.log("Session in middleware:", session);

  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin-dashboard");
  const isGameRoute = req.nextUrl.pathname.startsWith("/game");
  const isStoreRoute = req.nextUrl.pathname.startsWith("/store");
  const isSubscribeRoute = req.nextUrl.pathname.startsWith("/store/subscribe");
  const isCategoriesRoute = req.nextUrl.pathname.startsWith("/categories"); // Added

  // Case 1: Protected routes without authentication - redirect to home
  if ((isAdminRoute || isGameRoute || isStoreRoute || isCategoriesRoute) && !session) {
    console.log("Redirecting unauthenticated user to home");
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Case 2: Admin dashboard access without ADMIN role - redirect to home
  if (isAdminRoute && session?.role !== "ADMIN") {
    console.log("Redirecting non-admin user from admin dashboard to home");
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Case 3: Store and Categories access without USER role - redirect to home
  if ((isStoreRoute || isCategoriesRoute) && session?.role !== "USER") {
    console.log("Redirecting non-user role from store/categories to home");
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: ["/game", "/admin-dashboard", "/store", "/store/subscribe", "/categories"], // Added /categories
};