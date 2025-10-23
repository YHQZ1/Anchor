/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { withAuth } from "@/lib/apiHandler";

export async function GET(request: NextRequest) {
  return withAuth(async (request, user) => {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("course_id");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const upcomingOnly = searchParams.get("upcoming_only");

    let query = supabaseAdmin
      .from("assignments")
      .select(
        `*, courses!inner (id, course_code, course_name, color, archived)`
      )
      .eq("user_id", user.id)
      .eq("courses.archived", false);

    if (courseId) query = query.eq("course_id", courseId);
    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (upcomingOnly === "true")
      query = query.gte("due_date", new Date().toISOString());

    const { data: assignments, error } = await query.order("due_date", {
      ascending: true,
    });

    if (error)
      return NextResponse.json(
        { error: "Failed to fetch assignments" },
        { status: 500 }
      );
    return NextResponse.json({ assignments });
  }, request);
}

export async function POST(request: NextRequest) {
  return withAuth(async (request, user) => {
    const { course_id, title, description, due_date, priority } =
      await request.json();

    if (!course_id || !title || !due_date) {
      return NextResponse.json(
        { error: "Course, title and due date are required" },
        { status: 400 }
      );
    }

    const dueDate = new Date(due_date);
    if (dueDate < new Date()) {
      return NextResponse.json(
        { error: "Due date must be in the future" },
        { status: 400 }
      );
    }

    const validPriorities = ["low", "medium", "high"];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: "Priority must be low, medium, or high" },
        { status: 400 }
      );
    }

    const { data: assignment, error } = await supabaseAdmin
      .from("assignments")
      .insert({
        user_id: user.id,
        course_id,
        title: title.trim(),
        description: description?.trim() || "",
        due_date: dueDate.toISOString(),
        priority: priority || "medium",
        status: "pending",
        progress: 0,
      })
      .select(`*, courses (course_code, course_name, color)`)
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      message: "Assignment added successfully",
      assignment,
    });
  }, request);
}

export async function PATCH(request: NextRequest) {
  return withAuth(async (request, user) => {
    const { id, title, description, due_date, priority, status, progress } =
      await request.json();

    if (!id)
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );

    const updates: any = { updated_at: new Date().toISOString() };

    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined)
      updates.description = description?.trim() || "";
    if (due_date !== undefined) {
      const dueDate = new Date(due_date);
      if (dueDate < new Date()) {
        return NextResponse.json(
          { error: "Due date must be in the future" },
          { status: 400 }
        );
      }
      updates.due_date = dueDate.toISOString();
    }
    if (priority !== undefined) {
      const validPriorities = ["low", "medium", "high"];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          { error: "Priority must be low, medium, or high" },
          { status: 400 }
        );
      }
      updates.priority = priority;
    }
    if (status !== undefined) {
      const validStatuses = ["pending", "in-progress", "completed", "overdue"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            error: "Status must be pending, in-progress, completed, or overdue",
          },
          { status: 400 }
        );
      }
      updates.status = status;
    }
    if (progress !== undefined) {
      if (progress < 0 || progress > 100) {
        return NextResponse.json(
          { error: "Progress must be between 0 and 100" },
          { status: 400 }
        );
      }
      updates.progress = progress;
      if (progress === 100) updates.status = "completed";
      else if (progress > 0) updates.status = "in-progress";
    }

    const { data: assignment, error } = await supabaseAdmin
      .from("assignments")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(`*, courses (course_code, course_name, color)`)
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    if (!assignment)
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );

    return NextResponse.json({
      message: "Assignment updated successfully",
      assignment,
    });
  }, request);
}

export async function DELETE(request: NextRequest) {
  return withAuth(async (request, user) => {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("id");

    if (!assignmentId)
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );

    const { error } = await supabaseAdmin
      .from("assignments")
      .delete()
      .eq("id", assignmentId)
      .eq("user_id", user.id);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ message: "Assignment deleted successfully" });
  }, request);
}
