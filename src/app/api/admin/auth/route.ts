import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const expectedUser = process.env.ADMIN_USER_ID || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "password123";

    if (username === expectedUser && password === expectedPassword) {
      // Return a simulated authentication token
      return NextResponse.json({
        success: true,
        token: `auth_token_${Math.random().toString(36).substring(2, 15)}`
      });
    }

    return NextResponse.json(
      { error: "Invalid User ID or Password. Access denied." },
      { status: 401 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to complete authentication." },
      { status: 500 }
    );
  }
}
