import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
export { default } from "next-auth/middleware";


export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  console.log("NEXT AUTH SECRET", process.env.NEXTAUTH_SECRET);
  console.log("TOKEN in middleware:", token); // Debugging ke liye

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (req.nextUrl.pathname.startsWith("/admindashboard") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/userdashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/userdashboard", "/admindashboard"],
};
