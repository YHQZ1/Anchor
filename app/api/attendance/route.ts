/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { withAuth } from "@/lib/apiHandler";

export async function GET(request: NextRequest) {
  return withAuth(async (request, user) => {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("course_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const summaryOnly = searchParams.get("summary_only");

    if (summaryOnly === "true") return await getAttendanceSummary(user.id);

    let query = supabaseAdmin
      .from("attendance")
      .select(`*, courses!inner (course_code, course_name, color, archived)`)
      .eq("user_id", user.id)
      .eq("courses.archived", false);

    if (courseId) query = query.eq("course_id", courseId);
    if (startDate) query = query.gte("class_date", startDate);
    if (endDate) query = query.lte("class_date", endDate);

    const { data: attendance, error } = await query.order("class_date", {
      ascending: false,
    });

    if (error)
      return NextResponse.json(
        { error: "Failed to fetch attendance" },
        { status: 500 }
      );
    return NextResponse.json({ attendance });
  }, request);
}

async function getAttendanceSummary(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: attendance, error } = await supabaseAdmin
    .from("attendance")
    .select(
      `class_date, status, courses!inner (course_code, course_name, color, archived)`
    )
    .eq("user_id", userId)
    .eq("courses.archived", false);

  if (error) throw error;

  const summary = attendance?.reduce((acc: any, record: any) => {
    const courseCode = record.courses.course_code;
    if (!acc[courseCode]) {
      acc[courseCode] = {
        course_code: courseCode,
        course_name: record.courses.course_name,
        color: record.courses.color,
        total_classes: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        attendance_percentage: 0,
      };
    }

    acc[courseCode].total_classes++;
    acc[courseCode][record.status]++;

    const attended = acc[courseCode].present + acc[courseCode].late;
    const totalCounted =
      acc[courseCode].total_classes - acc[courseCode].excused;

    acc[courseCode].attendance_percentage =
      totalCounted > 0 ? Math.round((attended / totalCounted) * 100) : 100;

    return acc;
  }, {});

  return NextResponse.json({ summary: Object.values(summary || {}) });
}

export async function POST(request: NextRequest) {
  return withAuth(async (request, user) => {
    const supabaseAdmin = getSupabaseAdmin();
    const { course_id, class_date, status } = await request.json();

    if (!course_id || !class_date || !status) {
      return NextResponse.json(
        { error: "Course, date and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["present", "absent", "late", "excused"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const classDate = new Date(class_date);
    if (isNaN(classDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    const { data: existingAttendance } = await supabaseAdmin
      .from("attendance")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course_id)
      .eq("class_date", class_date)
      .single();

    const { data: attendance, error } = await supabaseAdmin
      .from("attendance")
      .upsert({
        user_id: user.id,
        course_id,
        class_date,
        status,
        marked_at: new Date().toISOString(),
        ...(existingAttendance && { id: existingAttendance.id }),
      })
      .select(`*, courses (course_code, course_name, color)`)
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      message: existingAttendance
        ? "Attendance updated successfully"
        : "Attendance marked successfully",
      attendance,
    });
  }, request);
}

export async function PATCH(request: NextRequest) {
  return withAuth(async (request, user) => {
    const supabaseAdmin = getSupabaseAdmin();
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Attendance ID and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["present", "absent", "late", "excused"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const { data: attendance, error } = await supabaseAdmin
      .from("attendance")
      .update({
        status,
        marked_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select(`*, courses (course_code, course_name, color)`)
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    if (!attendance)
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );

    return NextResponse.json({
      message: "Attendance updated successfully",
      attendance,
    });
  }, request);
}

export async function DELETE(request: NextRequest) {
  return withAuth(async (request, user) => {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const attendanceId = searchParams.get("id");

    if (!attendanceId)
      return NextResponse.json(
        { error: "Attendance ID is required" },
        { status: 400 }
      );

    const { error } = await supabaseAdmin
      .from("attendance")
      .delete()
      .eq("id", attendanceId)
      .eq("user_id", user.id);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      message: "Attendance record deleted successfully",
    });
  }, request);
}