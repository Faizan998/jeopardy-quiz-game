// Authentication utilities
import { jwtVerify, SignJWT } from 'jose';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id?: string;
  userId?: string;
  sub?: string;
  email?: string;
  role?: string;
  name?: string;
  iat?: number;
  exp?: number;
  [key: string]: string | number | undefined;
}

/**
 * Verifies a JWT token using jose library
 */
export async function verifyJwtToken(token: string): Promise<JwtPayload | null> {
  try {
    if (!token) return null;
    
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET_KEY || 
      process.env.NEXTAUTH_SECRET || 
      'fallback-secret-key-for-development-only'
    );
    
    const { payload } = await jwtVerify(token, secret);
    return payload as JwtPayload;
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    return null;
  }
}

/**
 * Creates a JWT token
 */
export async function createJwtToken(payload: JwtPayload): Promise<string> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET_KEY || 
      process.env.NEXTAUTH_SECRET || 
      'fallback-secret-key-for-development-only'
    );
    
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);
      
    return token;
  } catch (error) {
    console.error('Error creating JWT token:', error);
    throw new Error('Failed to create authentication token');
  }
}

/**
 * Decodes a JWT token without verification (less secure, use only when necessary)
 */
export function decodeJwtToken(token: string): JwtPayload | null {
  try {
    // First try using jsonwebtoken library
    try {
      const decoded = jwt.decode(token);
      if (decoded && typeof decoded === 'object') {
        return decoded as JwtPayload;
      }
    } catch (jwtError) {
      console.log('JWT decode failed, trying manual decode:', jwtError);
    }
    
    // Fallback to manual decode
    if (!token || token.split('.').length !== 3) {
      console.error('Invalid token format');
      return null;
    }
    
    const base64Payload = token.split('.')[1];
    
    // Add padding if needed
    const paddedBase64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - paddedBase64.length % 4) % 4);
    
    // Decode the base64 string
    const jsonPayload = atob(paddedBase64 + padding);
    const payload = JSON.parse(jsonPayload);
    
    return payload as JwtPayload;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

/**
 * Gets the user ID from a token, checking various fields
 */
export function getUserIdFromToken(payload: JwtPayload | null): string | null {
  if (!payload) return null;
  
  // Check all possible fields where the user ID might be stored
  const userId = payload.id || payload.userId || payload.sub;
  
  if (!userId) {
    console.error('No user ID found in token payload:', payload);
    return null;
  }
  
  return userId;
}
  
  