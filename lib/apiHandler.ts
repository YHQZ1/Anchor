/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "./auth";
import { tokenBucketLimit } from "@/lib/rateLimiter";

type Handler = (request: NextRequest, user: any) => Promise<NextResponse>;

export async function withAuth(handler: Handler, request: NextRequest) {
  try {
    const user = requireAuth(request);

    const allowed = await tokenBucketLimit(`user:${user.id}`, 60, 1);
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    return handler(request, user);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
