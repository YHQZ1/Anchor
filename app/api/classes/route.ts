/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { withAuth } from "@/lib/apiHandler";
import redis from "@/lib/redis";
import { withCache } from "@/utils/cache";

export async function GET(request: NextRequest) {
  return withAuth(async (request, user) => {
    const cacheKey = `classes:${user.id}`;

    const { data: classes, cached } = await withCache(cacheKey, async () => {
      const supabaseAdmin = getSupabaseAdmin();
      const { data, error } = await supabaseAdmin
        .from("classes")
        .select(`*, courses!inner (course_code, course_name, color, archived)`)
        .eq("user_id", user.id)
        .eq("courses.archived", false)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw new Error("Failed to fetch classes");

      return data;
    });

    return NextResponse.json({ classes, cached }, { status: 200 });
  }, request);
}

export async function POST(request: NextRequest) {
  return withAuth(async (request, user) => {
    const supabaseAdmin = getSupabaseAdmin();
    const { course_id, day_of_week, start_time, end_time, room, class_type } =
      await request.json();

    if (!course_id || day_of_week === undefined || !start_time || !end_time) {
      return NextResponse.json(
        { error: "Course, day, start time and end time are required" },
        { status: 400 }
      );
    }

    if (day_of_week < 0 || day_of_week > 6) {
      return NextResponse.json(
        { error: "Day of week must be between 0 (Sunday) and 6 (Saturday)" },
        { status: 400 }
      );
    }

    if (start_time >= end_time) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    await clearClassesCache(user.id);

    const { data: conflictingClasses } = await supabaseAdmin
      .from("classes")
      .select("id")
      .eq("user_id", user.id)
      .eq("day_of_week", day_of_week)
      .or(`start_time.lte.${end_time},end_time.gte.${start_time}`)
      .neq("course_id", course_id);

    if (conflictingClasses && conflictingClasses.length > 0) {
      return NextResponse.json(
        {
          error:
            "Schedule conflict: This time slot overlaps with another class",
        },
        { status: 409 }
      );
    }

    const { data: classItem, error } = await supabaseAdmin
      .from("classes")
      .insert({
        user_id: user.id,
        course_id,
        day_of_week,
        start_time,
        end_time,
        room: room?.trim() || null,
        class_type: class_type || "lecture",
      })
      .select(`*, courses (course_code, course_name, color)`)
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      message: "Class added successfully",
      class: classItem,
    });
  }, request);
}

export async function PATCH(request: NextRequest) {
  return withAuth(async (request, user) => {
    const supabaseAdmin = getSupabaseAdmin();
    const {
      id,
      course_id,
      day_of_week,
      start_time,
      end_time,
      room,
      class_type,
    } = await request.json();

    if (!id)
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );

    if (start_time && end_time && start_time >= end_time) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    if (day_of_week !== undefined && (day_of_week < 0 || day_of_week > 6)) {
      return NextResponse.json(
        { error: "Day of week must be between 0 (Sunday) and 6 (Saturday)" },
        { status: 400 }
      );
    }

    await clearClassesCache(user.id);

    const updates: any = { updated_at: new Date().toISOString() };
    if (course_id) updates.course_id = course_id;
    if (day_of_week !== undefined) updates.day_of_week = day_of_week;
    if (start_time) updates.start_time = start_time;
    if (end_time) updates.end_time = end_time;
    if (room !== undefined) updates.room = room?.trim() || null;
    if (class_type) updates.class_type = class_type;

    const { data: classItem, error } = await supabaseAdmin
      .from("classes")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(`*, courses (course_code, course_name, color)`)
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    if (!classItem)
      return NextResponse.json({ error: "Class not found" }, { status: 404 });

    return NextResponse.json({
      message: "Class updated successfully",
      class: classItem,
    });
  }, request);
}

export async function DELETE(request: NextRequest) {
  return withAuth(async (request, user) => {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("id");

    if (!classId)
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );

    await clearClassesCache(user.id);

    const { error } = await supabaseAdmin
      .from("classes")
      .delete()
      .eq("id", classId)
      .eq("user_id", user.id);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ message: "Class deleted successfully" });
  }, request);
}

async function clearClassesCache(userId: string) {
  const pattern = `classes:${userId}:*`;
  const keys = await redis.keys(pattern);
  
  if (keys.length > 0) {
    for (const key of keys) {
      await redis.del(key);
    }
  }
}