import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  try {
    // Protected routes that require authentication
    const protectedRoutes = [
      '/admin-dashboard',
      '/user-dashboard',
      '/dashboard',
      '/update-password'
    ];
    
    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    );
    
    // Only check for token if it's a protected route
    if (isProtectedRoute) {
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
      });

      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      // Role-based access control
      if (req.nextUrl.pathname.startsWith("/admin-dashboard") && 
          token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/user-dashboard", req.url));
      }
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // In case of error, redirect to login as a fallback
    return NextResponse.redirect(new URL("/login", req.url));
  }
}
