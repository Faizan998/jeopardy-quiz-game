import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin-dashboard');
    const isLoginPage = req.nextUrl.pathname === '/login';
    const isSignupPage = req.nextUrl.pathname === '/signup';

    // If the user is not logged in and tries to access the admin-dashboard, redirect to login
    if (isAdminRoute && !token) {
      return NextResponse.redirect(new URL('/login', req.url));  // Redirect to login if not logged in
    }

    // If the user is logged in but not an admin, redirect to home or any other page
    if (isAdminRoute && token && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));  // Redirect to home if not an admin
    }

    // If the user is logged in and tries to access login or signup page, redirect them away
    if ((isLoginPage || isSignupPage) && token) {
      return NextResponse.redirect(new URL('/admin-dashboard', req.url));  // Redirect logged-in users to admin-dashboard
    }

    return NextResponse.next();  // Allow other routes
  },
  {
    pages: {
      signIn: '/login',  // Specify the login page for NextAuth
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin-dashboard');
        
        // Allow access to login and signup pages without authentication
        if (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup') {
          return true;
        }

        // If not logged in, deny access to the admin routes
        if (!token) {
          return false;
        }

        // Only allow admins to access admin routes
        if (isAdminRoute) {
          return token.role === 'ADMIN';
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin-dashboard/:path*', '/login', '/signup', '/user-dashboard/:path*'],
};
