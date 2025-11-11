/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { withAuth } from "@/lib/apiHandler";
import redis from "@/lib/redis";
import { withCache } from "@/utils/cache";
export async function GET(request: NextRequest) {
  return withAuth(async (_, user) => {
    const cacheKey = `courses:${user.id}`;

    const { data: courses, cached } = await withCache(cacheKey, async () => {
      const supabaseAdmin = getSupabaseAdmin();
      const { data, error } = await supabaseAdmin
        .from("courses")
        .select("*")
        .eq("user_id", user.id)
        .eq("archived", false)
        .order("created_at", { ascending: true });

      if (error) throw new Error("Failed to fetch courses");

      return data;
    });

    return NextResponse.json({ courses, cached }, { status: 200 });
  }, request);
}


export async function POST(request: NextRequest) {
  return withAuth(async (request, user) => {
    const supabaseAdmin = getSupabaseAdmin();
    const { course_code, course_name, instructor, credits, color } =
      await request.json();

    if (!course_code || !course_name) {
      return NextResponse.json(
        { error: "Course code and name are required" },
        { status: 400 }
      );
    }

    if (credits && (credits < 1 || credits > 10)) {
      return NextResponse.json(
        { error: "Credits must be between 1 and 10" },
        { status: 400 }
      );
    }

    const { data: course, error } = await supabaseAdmin
      .from("courses")
      .insert({
        user_id: user.id,
        course_code: course_code.trim().toUpperCase(),
        course_name: course_name.trim(),
        instructor: instructor?.trim() || null,
        credits: credits || 3,
        color: color || "purple",
      })
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    await redis.del(`courses:${user.id}`);

    return NextResponse.json({ message: "Course added successfully", course });
  }, request);
}

export async function PATCH(request: NextRequest) {
  return withAuth(async (request, user) => {
    const supabaseAdmin = getSupabaseAdmin();
    const { id, course_code, course_name, instructor, credits, color } =
      await request.json();

    if (!id)
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );

    if (credits && (credits < 1 || credits > 10)) {
      return NextResponse.json(
        { error: "Credits must be between 1 and 10" },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (course_code) updates.course_code = course_code.trim().toUpperCase();
    if (course_name) updates.course_name = course_name.trim();
    if (instructor !== undefined)
      updates.instructor = instructor?.trim() || null;
    if (credits) updates.credits = credits;
    if (color) updates.color = color;
    updates.updated_at = new Date().toISOString();

    const { data: course, error } = await supabaseAdmin
      .from("courses")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    await redis.del(`courses:${user.id}`);

    return NextResponse.json({
      message: "Course updated successfully",
      course,
    });
  }, request);
}

export async function DELETE(request: NextRequest) {
  return withAuth(async (request, user) => {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("id");

    if (!courseId)
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );

    const { error } = await supabaseAdmin
      .from("courses")
      .delete()
      .eq("id", courseId)
      .eq("user_id", user.id);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    await redis.del(`courses:${user.id}`);

    return NextResponse.json({ message: "Course deleted successfully" });
  }, request);
}
