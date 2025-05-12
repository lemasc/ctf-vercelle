import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { createSite } from "@/lib/commands";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // Create user first
    const user = await prisma.user.create({
      data: {
        username,
        password, // Storing password in plain text as per CTF requirements
      },
    });

    try {
      // Create initial site for the user
      const stdout = await createSite(username);
      // Set session after both user and site are created successfully
      await setSession({
        userId: user.id,
        username: user.username,
      });

      return NextResponse.json({
        message: "User and site created successfully",
        userId: user.id,
        siteInfo: stdout.trim(),
      });
    } catch (siteError) {
      console.error("Site creation error:", siteError);
      // Clean up the created user since site creation failed
      await prisma.user.delete({
        where: { id: user.id },
      });
      return NextResponse.json(
        { error: "Failed to create user site. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
