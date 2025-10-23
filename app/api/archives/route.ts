import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { withAuth } from "@/lib/apiHandler";

export async function GET(request: NextRequest) {
  return withAuth(async (request, user) => {
    const { data: archives, error } = await supabaseAdmin
      .from("archives")
      .select(
        `*, courses!inner (id, course_code, course_name, instructor, credits, color, created_at)`
      )
      .eq("user_id", user.id)
      .order("archived_at", { ascending: false });

    if (error)
      return NextResponse.json(
        { error: "Failed to fetch archived courses" },
        { status: 500 }
      );
    return NextResponse.json({ archives });
  }, request);
}

export async function POST(request: NextRequest) {
  return withAuth(async (request, user) => {
    const { course_id, reason, notes } = await request.json();

    if (!course_id)
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );

    const { error: archiveError } = await supabaseAdmin
      .from("courses")
      .update({ archived: true, updated_at: new Date().toISOString() })
      .eq("id", course_id)
      .eq("user_id", user.id);

    if (archiveError)
      return NextResponse.json(
        { error: archiveError.message },
        { status: 400 }
      );

    const { data: existingArchive } = await supabaseAdmin
      .from("archives")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course_id)
      .single();

    if (existingArchive)
      return NextResponse.json(
        { error: "Course already archived" },
        { status: 409 }
      );

    const { data: archive, error } = await supabaseAdmin
      .from("archives")
      .insert({
        user_id: user.id,
        course_id,
        reason: reason || null,
        notes: notes || null,
      })
      .select(
        `*, courses (id, course_code, course_name, instructor, credits, color, created_at)`
      )
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      message: "Course archived successfully",
      archive,
    });
  }, request);
}

export async function DELETE(request: NextRequest) {
  return withAuth(async (request, user) => {
    const { searchParams } = new URL(request.url);
    const archiveId = searchParams.get("id");
    const courseId = searchParams.get("course_id");

    if (!archiveId && !courseId) {
      return NextResponse.json(
        { error: "Archive ID or Course ID is required" },
        { status: 400 }
      );
    }

    let query = supabaseAdmin.from("archives").delete().eq("user_id", user.id);
    if (archiveId) query = query.eq("id", archiveId);
    else if (courseId) query = query.eq("course_id", courseId);

    const { error } = await query;

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    if (courseId) {
      await supabaseAdmin
        .from("courses")
        .update({ archived: false, updated_at: new Date().toISOString() })
        .eq("id", courseId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ message: "Course unarchived successfully" });
  }, request);
}
