/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Username, email and password are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: "Username must be between 3 and 30 characters" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existingUser)
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );

    const { data: existingUsername } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("username", username.trim())
      .single();

    if (existingUsername)
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .insert([
        {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          username: username.trim(),
        },
      ])
      .select()
      .single();

    if (userError)
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 400 }
      );

    await supabaseAdmin.from("profiles").insert([
      {
        id: userData.id,
        full_name: username,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    const token = jwt.sign(
      { id: userData.id, email: userData.email, username: userData.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = userData;

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: userWithoutPassword,
        token,
        onboarding_completed: false,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}