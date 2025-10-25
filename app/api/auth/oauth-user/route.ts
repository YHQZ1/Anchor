/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { email, name, avatar } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: existingUser, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (userError && userError.code !== 'PGRST116') {
      throw userError;
    }

    let user = existingUser;
    let isNewUser = false;

    if (!existingUser) {
      const username = name 
        ? name.replace(/\s+/g, '').toLowerCase()
        : email.split('@')[0];

      let finalUsername = username;
      let counter = 1;
      
      while (true) {
        const { data: existingUsername } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("username", finalUsername)
          .single();

        if (!existingUsername) break;
        finalUsername = `${username}${counter}`;
        counter++;
        if (counter > 10) break;
      }

      const randomPassword = await bcrypt.hash(Math.random().toString(36), 12);

      const { data: newUser, error: createError } = await supabaseAdmin
        .from("users")
        .insert([
          {
            email: email.toLowerCase().trim(),
            username: finalUsername,
            auth_provider: 'google',
            password: randomPassword,
          },
        ])
        .select()
        .single();

      if (createError) throw createError;

      user = newUser;
      isNewUser = true;

      await supabaseAdmin.from("profiles").insert([
        {
          id: user.id,
          full_name: name || finalUsername,
          avatar_url: avatar,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("onboarding_completed, student_id, full_name, avatar_url")
      .eq("id", user.id)
      .single();

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        username: user.username,
        auth_provider: 'google'
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: isNewUser ? "Account created successfully" : "Login successful",
      token,
      user: userWithoutPassword,
      profile: {
        onboarding_completed: profile?.onboarding_completed || false,
        student_id: profile?.student_id || null,
        full_name: profile?.full_name || null,
        avatar_url: profile?.avatar_url || null,
      },
      isNewUser,
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: "Failed to process user",
        details: error?.message 
      },
      { status: 500 }
    );
  }
}