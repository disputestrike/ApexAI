import { COOKIE_NAME } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type SessionPayload = {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
};

class SDK {
  constructor() {
    console.log("[Auth] Google Auth initialized");
  }

  /**
   * Authenticate a request by verifying the JWT cookie
   */
  async authenticateRequest(req: Request): Promise<User> {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      throw new ForbiddenError("Missing authentication cookie");
    }

    const cookies = parseCookieHeader(cookieHeader);
    const sessionToken = cookies[COOKIE_NAME];

    if (!sessionToken) {
      throw new ForbiddenError("Missing session token");
    }

    try {
      // Verify JWT token
      const secret = new TextEncoder().encode(ENV.cookieSecret);
      const { payload } = await jwtVerify<SessionPayload>(
        sessionToken,
        secret
      );

      if (!payload.googleId || !payload.email) {
        throw new ForbiddenError("Invalid token payload");
      }

      // Get user from database
      const user = await db.getUserByOpenId(payload.googleId);
      if (!user) {
        throw new ForbiddenError("User not found");
      }

      return user;
    } catch (error) {
      console.error("[Auth] JWT verification failed:", error);
      throw new ForbiddenError("Invalid session token");
    }
  }

  /**
   * Create a JWT session token for Google Auth
   */
  async createSessionToken(payload: SessionPayload): Promise<string> {
    const secret = new TextEncoder().encode(ENV.cookieSecret);

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1y")
      .sign(secret);

    return token;
  }
}

// Export singleton
export const sdk = new SDK();
