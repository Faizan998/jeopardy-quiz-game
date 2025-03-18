import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { decodeJwtToken } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { any } from "zod";

export async function GET(req: NextRequest) {
  try {
    console.log("Fetching leaderboard data...");

    // Get user ID from session token or Authorization header
    let userId = "";

    // Try to get token from next-auth session
    const session = await getToken({ req });

    if (session) {
      console.log("Session token found");
      userId = session.sub || "";
    } else {
      console.log("No session token, checking Authorization header");
      const authHeader = req.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("No Authorization header or invalid format");
        return NextResponse.json(
          { message: "Unauthorized" },
          { status: 401 }
        );
      }

      const tokenFromHeader = authHeader.split(" ")[1];
      console.log("Token from header:", tokenFromHeader.substring(0, 20) + "...");

      // Decode the token
      const decoded = decodeJwtToken(tokenFromHeader);

      if (!decoded) {
        console.log("Failed to decode token");
        return NextResponse.json(
          { message: "Invalid token format" },
          { status: 401 }
        );
      }

      // Try to extract user ID from various possible fields
      userId = (decoded.userId || decoded.sub || decoded.id || "").toString();

      if (!userId) {
        console.log("No user ID found in token");
        return NextResponse.json(
          { message: "Invalid token: no user ID" },
          { status: 401 }
        );
      }

      console.log("User ID from token:", userId);
    }

    // Try to get user data from database
    let userData;
    try {
      userData = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          totalAmount: true
        }
      });
      console.log("User data fetched:", userData ? "success" : "not found");
    } catch (dbError) {
      console.error("Database error when fetching user:", dbError);
      // Continue without user data, we'll handle it below
    }

    // If user not found, use placeholder user data
    if (!userData) {
      userData = {
        id: userId,
        name: "Current Player",
        email: "player@example.com",
        totalAmount: 5100
      };
      console.log("Using placeholder user data");
    }

    // Create current user with rank
    const currentUser = {
      ...userData,
      rank: 11 // Default rank if not in top 10
    };

    // Try to get real leaderboard from database
    let leaderboard: any[] = [];
    try {
      console.log("Fetching top 10 users from database...");
      leaderboard = await prisma.user.findMany({
        orderBy: {
          totalAmount: 'desc'
        },
        take: 10,
        select: {
          id: true,
          name: true,
          totalAmount: true
        }
      });

      console.log(`Fetched ${leaderboard.length} users for leaderboard`);

      // Add rank to each user
      leaderboard = leaderboard.map((user, index) => ({
        ...user,
        rank: index + 1
      }));

      // Check if current user is in top 10
      const userInTop10 = leaderboard.findIndex(user => user.id === userId);
      if (userInTop10 >= 0) {
        currentUser.rank = userInTop10 + 1;
        console.log(`Current user is in top 10 at rank ${currentUser.rank}`);
      } else {
        // Try to get user's actual rank
        try {
          const usersWithHigherScore = await prisma.user.count({
            where: {
              totalAmount: {
                gt: userData.totalAmount
              }
            }
          });
          currentUser.rank = usersWithHigherScore + 1;
          console.log(`Current user rank calculated as ${currentUser.rank}`);
        } catch (rankError) {
          console.error("Error getting user rank:", rankError);
          // Keep default rank
        }
      }
    } catch (dbError) {
      console.error("Database error when fetching leaderboard:", dbError);
      leaderboard = []; // Set leaderboard to an empty array if an error occurs
      console.log("Failed to fetch leaderboard data from database.");
    }

    // If leaderboard is empty, handle it gracefully
    if (leaderboard.length === 0) {
      console.log("Leaderboard is empty, no data found");
    }

    // Create response with cache control headers
    const response = NextResponse.json({
      leaderboard,
      currentUser,
      timestamp: new Date().toISOString(),
      source: leaderboard.length === 0 ? "placeholder" : "database"
    });

    // Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);

    // Return response with an empty leaderboard in case of error
    const mockCurrentUser = {
      id: "current-user",
      name: "Current Player",
      totalAmount: 5100,
      rank: 7
    };

    const response = NextResponse.json({
      leaderboard: [],
      currentUser: mockCurrentUser,
      timestamp: new Date().toISOString(),
      source: "placeholder",
      error: "Failed to fetch leaderboard data"
    });

    // Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  }
}
