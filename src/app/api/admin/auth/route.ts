import { NextResponse } from "next/server";
import { createSessionToken, safeCompare } from "@/lib/adminAuth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const expectedUser = process.env.ADMIN_USER_ID;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedUser || !expectedPassword) {
      console.error("ADMIN_USER_ID / ADMIN_PASSWORD are not configured.");
      return NextResponse.json(
        { error: "Admin authentication is not configured on the server." },
        { status: 500 }
      );
    }

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !safeCompare(username, expectedUser) ||
      !safeCompare(password, expectedPassword)
    ) {
      return NextResponse.json(
        { error: "Invalid User ID or Password. Access denied." },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, token: createSessionToken() });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to complete authentication." },
      { status: 500 }
    );
  }
}
