/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { withAuth } from "@/lib/apiHandler";
import redis from "@/lib/redis";

export async function GET(request: NextRequest) {
  return withAuth(async (request, user) => {
    const supabaseAdmin = getSupabaseAdmin();

    try {
      const { data: timetableUpload, error: uploadError } = await supabaseAdmin
        .from("timetable_uploads")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_current", true)
        .single();

      if (uploadError && uploadError.code !== "PGRST116") {
        console.error("Timetable upload fetch error:", uploadError);
      }

      const { data: classesBySource, error: classesError } = await supabaseAdmin
        .from("classes")
        .select("source")
        .eq("user_id", user.id);

      if (classesError) {
        console.error("Classes fetch error:", classesError);
      }

      const manualClassesCount =
        classesBySource?.filter((c) => c.source === "manual").length || 0;
      const uploadedClassesCount =
        classesBySource?.filter((c) => c.source === "upload").length || 0;

      return NextResponse.json({
        timetable_upload: timetableUpload || null,
        classes_summary: {
          manual: manualClassesCount,
          uploaded: uploadedClassesCount,
          total: classesBySource?.length || 0,
        },
      });
    } catch (error) {
      console.error("Timetable GET error:", error);
      return NextResponse.json({
        timetable_upload: null,
        classes_summary: { manual: 0, uploaded: 0, total: 0 },
      });
    }
  }, request);
}

export async function PATCH(request: NextRequest) {
  return withAuth(async (request, user) => {
    const supabaseAdmin = getSupabaseAdmin();

    try {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const fileName = formData.get("fileName") as string;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      if (!fileName) {
        return NextResponse.json(
          { error: "File name is required" },
          { status: 400 }
        );
      }

      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const timetableBucket = buckets?.find((b) => b.name === "timetables");

      if (!timetableBucket) {
        return NextResponse.json(
          {
            error: "Timetable storage not configured",
          },
          { status: 500 }
        );
      }

      await supabaseAdmin
        .from("timetable_uploads")
        .update({ is_current: false })
        .eq("user_id", user.id)
        .eq("is_current", true);

      await supabaseAdmin
        .from("classes")
        .delete()
        .eq("user_id", user.id)
        .eq("source", "upload");

      const fileExt = fileName.split(".").pop();
      const filePath = `timetables/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("timetables")
        .upload(filePath, file);

      if (uploadError) {
        console.error("File upload error:", uploadError);
        return NextResponse.json(
          { error: `File upload failed: ${uploadError.message}` },
          { status: 500 }
        );
      }

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from("timetables").getPublicUrl(filePath);

      const { data: timetableUpload, error: dbError } = await supabaseAdmin
        .from("timetable_uploads")
        .insert({
          user_id: user.id,
          file_name: fileName,
          file_url: publicUrl,
          file_type: file.type,
          is_current: true,
          classes_count: 0,
        })
        .select()
        .single();

      if (dbError) {
        await supabaseAdmin.storage.from("timetables").remove([filePath]);
        console.error("Database error:", dbError);
        return NextResponse.json(
          { error: `Database error: ${dbError.message}` },
          { status: 500 }
        );
      }

      await redis.del(`profile:${user.id}`);

      return NextResponse.json({
        message: "Timetable uploaded successfully",
        timetable_upload: timetableUpload,
      });
    } catch (error: any) {
      console.error("Timetable PATCH error:", error);
      return NextResponse.json(
        { error: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  }, request);
}

export async function DELETE(request: NextRequest) {
  return withAuth(async (request, user) => {
    const supabaseAdmin = getSupabaseAdmin();

    try {
      const { data: timetableUpload, error: fetchError } = await supabaseAdmin
        .from("timetable_uploads")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_current", true)
        .single();

      if (fetchError) {
        return NextResponse.json(
          { error: "No timetable found to delete" },
          { status: 404 }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from("classes")
        .update({
          source: "manual",
          timetable_upload_id: null,
        })
        .eq("user_id", user.id)
        .eq("source", "upload");

      if (updateError) {
        console.error("Class update error:", updateError);
      }

      const { error: deleteError } = await supabaseAdmin
        .from("timetable_uploads")
        .delete()
        .eq("id", timetableUpload.id);

      if (deleteError) {
        console.error("Timetable delete error:", deleteError);
      }

      try {
        const filePath = timetableUpload.file_url.split("/timetables/").pop();
        if (filePath) {
          await supabaseAdmin.storage.from("timetables").remove([filePath]);
        }
      } catch (storageError) {
        console.warn("Failed to delete file from storage:", storageError);
      }

      await redis.del(`profile:${user.id}`);

      return NextResponse.json({
        message: "Timetable deleted successfully",
      });
    } catch (error: any) {
      console.error("Timetable DELETE error:", error);
      return NextResponse.json(
        { error: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  }, request);
}
