import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isLoginPage = req.nextUrl.pathname === '/login';

    // If user is not an admin and trying to access admin routes
    if (isAdminRoute && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // If admin is trying to access login page, redirect to admin dashboard
    if (isLoginPage && token?.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/blog', req.url));
    }

    // If authenticated user tries to access login page
    if (isLoginPage && token) {
      if (token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/blog', req.url));
      }
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
        
        if (isAdminRoute) {
          return token?.role === 'ADMIN';
        }
        
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/login']
}; 