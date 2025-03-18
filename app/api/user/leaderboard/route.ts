import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { decodeJwtToken } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
<<<<<<< HEAD
import { any } from "zod";
=======

// Mock leaderboard data
const mockLeaderboard = [
  {
    id: "user1",
    name: "Alex Trebek",
    totalAmount: 9500,
    rank: 1
  },
  {
    id: "user2",
    name: "Ken Jennings",
    totalAmount: 8200,
    rank: 2
  },
  {
    id: "user3",
    name: "James Holzhauer",
    totalAmount: 7400,
    rank: 3
  },
  {
    id: "user4",
    name: "Brad Rutter",
    totalAmount: 6800,
    rank: 4
  },
  {
    id: "user5",
    name: "Watson",
    totalAmount: 6200,
    rank: 5
  },
  {
    id: "user6",
    name: "Julia Collins",
    totalAmount: 5500,
    rank: 6
  },
  {
    id: "user7",
    name: "Matt Amodio",
    totalAmount: 4900,
    rank: 7
  },
  {
    id: "user8",
    name: "Amy Schneider",
    totalAmount: 4300,
    rank: 8
  },
  {
    id: "user9",
    name: "Austin Rogers",
    totalAmount: 3700,
    rank: 9
  },
  {
    id: "user10",
    name: "Larissa Kelly",
    totalAmount: 3100,
    rank: 10
  }
];
>>>>>>> 2e8e39ec365a9e42612c4ae7cf8ecb7a958c8be0

export async function GET(req: NextRequest) {
  try {
    console.log("Fetching leaderboard data...");
<<<<<<< HEAD

    // Get user ID from session token or Authorization header
    let userId = "";

    // Try to get token from next-auth session
    const session = await getToken({ req });

=======
    
    // Get user ID from session token or Authorization header
    let userId = "";
    
    // Try to get token from next-auth session
    const session = await getToken({ req });
    
>>>>>>> 2e8e39ec365a9e42612c4ae7cf8ecb7a958c8be0
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
<<<<<<< HEAD

      const tokenFromHeader = authHeader.split(" ")[1];
      console.log("Token from header:", tokenFromHeader.substring(0, 20) + "...");

      // Decode the token
      const decoded = decodeJwtToken(tokenFromHeader);

=======
      
      const tokenFromHeader = authHeader.split(" ")[1];
      console.log("Token from header:", tokenFromHeader.substring(0, 20) + "...");
      
      // Decode the token
      const decoded = decodeJwtToken(tokenFromHeader);
      
>>>>>>> 2e8e39ec365a9e42612c4ae7cf8ecb7a958c8be0
      if (!decoded) {
        console.log("Failed to decode token");
        return NextResponse.json(
          { message: "Invalid token format" },
          { status: 401 }
        );
      }
<<<<<<< HEAD

      // Try to extract user ID from various possible fields
      userId = (decoded.userId || decoded.sub || decoded.id || "").toString();

=======
      
      // Try to extract user ID from various possible fields
      userId = (decoded.userId || decoded.sub || decoded.id || "").toString();
      
>>>>>>> 2e8e39ec365a9e42612c4ae7cf8ecb7a958c8be0
      if (!userId) {
        console.log("No user ID found in token");
        return NextResponse.json(
          { message: "Invalid token: no user ID" },
          { status: 401 }
        );
      }
<<<<<<< HEAD

      console.log("User ID from token:", userId);
    }

=======
      
      console.log("User ID from token:", userId);
    }
    
>>>>>>> 2e8e39ec365a9e42612c4ae7cf8ecb7a958c8be0
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
<<<<<<< HEAD
      // Continue without user data, we'll handle it below
    }

    // If user not found, use placeholder user data
=======
      // Continue with mock data
    }
    
    // If user not found, create mock user
>>>>>>> 2e8e39ec365a9e42612c4ae7cf8ecb7a958c8be0
    if (!userData) {
      userData = {
        id: userId,
        name: "Current Player",
        email: "player@example.com",
        totalAmount: 5100
      };
<<<<<<< HEAD
      console.log("Using placeholder user data");
    }

=======
      console.log("Using mock user data");
    }
    
>>>>>>> 2e8e39ec365a9e42612c4ae7cf8ecb7a958c8be0
    // Create current user with rank
    const currentUser = {
      ...userData,
      rank: 11 // Default rank if not in top 10
    };
<<<<<<< HEAD

    // Try to get real leaderboard from database
    let leaderboard: any[] = [];
=======
    
    // Try to get real leaderboard from database
    let leaderboard = [];
>>>>>>> 2e8e39ec365a9e42612c4ae7cf8ecb7a958c8be0
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
<<<<<<< HEAD

      console.log(`Fetched ${leaderboard.length} users for leaderboard`);

=======
      
      console.log(`Fetched ${leaderboard.length} users for leaderboard`);
      
>>>>>>> 2e8e39ec365a9e42612c4ae7cf8ecb7a958c8be0
      // Add rank to each user
      leaderboard = leaderboard.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
<<<<<<< HEAD

=======
      
>>>>>>> 2e8e39ec365a9e42612c4ae7cf8ecb7a958c8be0
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
<<<<<<< HEAD
      leaderboard = []; // Set leaderboard to an empty array if an error occurs
      console.log("Failed to fetch leaderboard data from database.");
    }

    // If leaderboard is empty, handle it gracefully
    if (leaderboard.length === 0) {
      console.log("Leaderboard is empty, no data found");
    }

=======
      // Use mock leaderboard
      leaderboard = mockLeaderboard;
      console.log("Using mock leaderboard data due to database error");
      
      // Check if current user would be in top 10 based on score
      for (let i = 0; i < leaderboard.length; i++) {
        if (userData.totalAmount > leaderboard[i].totalAmount) {
          currentUser.rank = i + 1;
          break;
        }
      }
    }
    
    // If leaderboard is empty, use mock data
    if (leaderboard.length === 0) {
      leaderboard = mockLeaderboard;
      console.log("Using mock leaderboard data because real leaderboard is empty");
    }
    
>>>>>>> 2e8e39ec365a9e42612c4ae7cf8ecb7a958c8be0
    // Create response with cache control headers
    const response = NextResponse.json({
      leaderboard,
      currentUser,
      timestamp: new Date().toISOString(),
<<<<<<< HEAD
      source: leaderboard.length === 0 ? "placeholder" : "database"
    });

=======
      source: leaderboard === mockLeaderboard ? "mock" : "database"
    });
    
>>>>>>> 2e8e39ec365a9e42612c4ae7cf8ecb7a958c8be0
    // Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
<<<<<<< HEAD

    return response;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);

    // Return response with an empty leaderboard in case of error
=======
    
    return response;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    
    // Return mock data in case of error
>>>>>>> 2e8e39ec365a9e42612c4ae7cf8ecb7a958c8be0
    const mockCurrentUser = {
      id: "current-user",
      name: "Current Player",
      totalAmount: 5100,
      rank: 7
    };
<<<<<<< HEAD

    const response = NextResponse.json({
      leaderboard: [],
      currentUser: mockCurrentUser,
      timestamp: new Date().toISOString(),
      source: "placeholder",
      error: "Failed to fetch leaderboard data"
    });

=======
    
    const response = NextResponse.json({
      leaderboard: mockLeaderboard,
      currentUser: mockCurrentUser,
      timestamp: new Date().toISOString(),
      source: "mock",
      error: "Failed to fetch leaderboard data"
    });
    
>>>>>>> 2e8e39ec365a9e42612c4ae7cf8ecb7a958c8be0
    // Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
<<<<<<< HEAD

    return response;
  }
}
=======
    
    return response;
  }
} 
>>>>>>> 2e8e39ec365a9e42612c4ae7cf8ecb7a958c8be0
