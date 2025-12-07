/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  GraduationCap,
  Building,
  BookOpen,
  Calendar,
  Settings,
  Save,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Upload,
  Trash2,
  FileText,
  Download,
} from "lucide-react";
import { SidebarTrigger, MobileSidebarTrigger } from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  full_name: string;
  student_id: string;
  college_name: string;
  department: string;
  current_semester: number;
  expected_graduation: string;
  min_attendance_percentage: number;
  enable_attendance_warnings: boolean;
  avatar_url?: string;
  email?: string;
  username?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  timetable_upload?: any;
}

interface TimetableData {
  timetable_upload: any;
  classes_summary: {
    manual: number;
    uploaded: number;
    total: number;
  };
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [timetableData, setTimetableData] = useState<TimetableData | null>(
    null
  );
  const [uploadingTimetable, setUploadingTimetable] = useState(false);
  const [deletingTimetable, setDeletingTimetable] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    student_id: "",
    college_name: "",
    department: "",
    current_semester: 1,
    expected_graduation: new Date(),
    min_attendance_percentage: 75,
    enable_attendance_warnings: true,
  });

  useEffect(() => {
    fetchProfile();
    fetchTimetableData();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        window.location.href = "/auth";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const data = await response.json();
      setProfile(data.profile);

      if (data.profile) {
        const graduationDate = data.profile.expected_graduation
          ? new Date(data.profile.expected_graduation)
          : new Date();

        const safeGraduationDate = isNaN(graduationDate.getTime())
          ? new Date()
          : graduationDate;

        setFormData({
          full_name: data.profile.full_name || "",
          student_id: data.profile.student_id || "",
          college_name: data.profile.college_name || "",
          department: data.profile.department || "",
          current_semester: data.profile.current_semester || 1,
          expected_graduation: safeGraduationDate,
          min_attendance_percentage:
            data.profile.min_attendance_percentage || 75,
          enable_attendance_warnings:
            data.profile.enable_attendance_warnings !== false,
        });
      }
    } catch (err) {
      setError("Failed to load profile");
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetableData = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) return;

      const response = await fetch("/api/profile/timetable", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTimetableData(data);
      }
    } catch (err) {
      console.error("Timetable fetch error:", err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          expected_graduation: formData.expected_graduation
            .toISOString()
            .split("T")[0],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const data = await response.json();
      setProfile(data.profile);
      setEditing(false);

      toast.success("Profile updated successfully", {
        description: "Your changes have been saved.",
      });
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      toast.error("Failed to update profile", {
        description: err.message || "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTimetableUpload = async (file: File) => {
    try {
      setUploadingTimetable(true);
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);

      const response = await fetch("/api/profile/timetable", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload timetable");
      }

      const data = await response.json();

      toast.success("Timetable uploaded successfully", {
        description: "Your new timetable has been processed.",
      });

      await fetchTimetableData();
      await fetchProfile();
    } catch (err: any) {
      toast.error("Failed to upload timetable", {
        description: err.message || "Please try again.",
      });
    } finally {
      setUploadingTimetable(false);
    }
  };

  const handleTimetableDelete = async () => {
    try {
      setDeletingTimetable(true);
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch("/api/profile/timetable", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete timetable");
      }

      toast.success("Timetable deleted successfully", {
        description: "Classes converted to manual entries.",
      });

      await fetchTimetableData();
      await fetchProfile();
    } catch (err: any) {
      toast.error("Failed to delete timetable", {
        description: err.message || "Please try again.",
      });
    } finally {
      setDeletingTimetable(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleTimetableUpload(file);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        student_id: profile.student_id || "",
        college_name: profile.college_name || "",
        department: profile.department || "",
        current_semester: profile.current_semester || 1,
        expected_graduation: profile.expected_graduation
          ? new Date(profile.expected_graduation)
          : new Date(),
        min_attendance_percentage: profile.min_attendance_percentage || 75,
        enable_attendance_warnings:
          profile.enable_attendance_warnings !== false,
      });
    }
    setEditing(false);
  };

  if (loading) return <ProfileSkeleton />;

  if (error && !profile) {
    return <ErrorState error={error} onRetry={fetchProfile} />;
  }

  const hasUploadedTimetable = timetableData?.timetable_upload;
  const hasManualClasses = (timetableData?.classes_summary?.manual || 0) > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          <div className="lg:hidden">
            <MobileSidebarTrigger />
          </div>
          <div className="hidden lg:block">
            <SidebarTrigger />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Profile</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hidden xs:block">
              {profile?.full_name || "Profile"}
            </span>
          </div>
        </div>
      </header>

      <main className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Header Card */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg bg-purple-100 dark:bg-purple-500/10">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold truncate">
                  {profile?.full_name || "Student"}
                </h2>
                <p className="text-sm text-muted-foreground truncate">
                  {profile?.student_id || "No student ID"} • {profile?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start xs:self-auto">
              {!editing ? (
                <Button
                  onClick={() => setEditing(true)}
                  className="cursor-pointer text-xs sm:text-sm w-full xs:w-auto"
                  variant="outline"
                >
                  <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2 w-full xs:w-auto">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="cursor-pointer text-xs sm:text-sm flex-1 xs:flex-none"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="cursor-pointer text-xs sm:text-sm flex-1 xs:flex-none"
                    disabled={saving}
                  >
                    {saving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {profile?.onboarding_completed && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Onboarding Completed
            </Badge>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Academic Information & Timetable */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h3 className="text-lg sm:text-xl font-semibold">
                  Academic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  label="Full Name"
                  value={formData.full_name}
                  onChange={(value) => handleInputChange("full_name", value)}
                  placeholder="Enter your full name"
                  disabled={!editing}
                  icon={User}
                />
                <FormField
                  label="Student ID"
                  value={formData.student_id}
                  onChange={(value) => handleInputChange("student_id", value)}
                  placeholder="Enter your student ID"
                  disabled={!editing}
                  icon={BookOpen}
                />
                <FormField
                  label="College/University"
                  value={formData.college_name}
                  onChange={(value) => handleInputChange("college_name", value)}
                  placeholder="Enter your college name"
                  disabled={!editing}
                  icon={Building}
                />
                <FormField
                  label="Department/Major"
                  value={formData.department}
                  onChange={(value) => handleInputChange("department", value)}
                  placeholder="e.g., Computer Science"
                  disabled={!editing}
                  icon={GraduationCap}
                />

                <SemesterSelect
                  value={formData.current_semester.toString()}
                  onChange={(value) =>
                    handleInputChange("current_semester", parseInt(value))
                  }
                  disabled={!editing}
                />

                <GraduationDatePicker
                  value={formData.expected_graduation}
                  onChange={(value) =>
                    handleInputChange("expected_graduation", value)
                  }
                  disabled={!editing}
                />
              </div>
            </div>

            {/* Timetable Management */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg sm:text-xl font-semibold">
                  Timetable Management
                </h3>
              </div>

              {hasUploadedTimetable ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border border-border bg-muted/50 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {timetableData.timetable_upload.file_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded{" "}
                          {format(
                            new Date(
                              timetableData.timetable_upload.uploaded_at
                            ),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          timetableData.timetable_upload.file_url,
                          "_blank"
                        )
                      }
                      className="cursor-pointer w-full sm:w-auto"
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() =>
                        document.getElementById("timetable-upload")?.click()
                      }
                      disabled={uploadingTimetable}
                      className="cursor-pointer text-xs sm:text-sm"
                    >
                      {uploadingTimetable ? (
                        "Uploading..."
                      ) : (
                        <>
                          <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Upload New
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleTimetableDelete}
                      disabled={deletingTimetable}
                      variant="outline"
                      className="cursor-pointer text-xs sm:text-sm"
                    >
                      {deletingTimetable ? "Deleting..." : "Delete"}
                    </Button>
                  </div>

                  <input
                    id="timetable-upload"
                    type="file"
                    accept=".pdf,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : hasManualClasses ? (
                <div className="text-center py-6">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <h4 className="font-medium mb-2">Manual Classes Detected</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    You added classes manually during setup. Edit them in the
                    Classes section.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/classes")}
                    variant="outline"
                    className="cursor-pointer"
                  >
                    Go to Classes
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <h4 className="font-medium mb-2">No Timetable Uploaded</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your timetable to automatically manage your class
                    schedule.
                  </p>
                  <Button
                    onClick={() =>
                      document.getElementById("timetable-upload")?.click()
                    }
                    disabled={uploadingTimetable}
                    className="cursor-pointer"
                  >
                    {uploadingTimetable ? (
                      "Uploading..."
                    ) : (
                      <>
                        <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Upload Timetable
                      </>
                    )}
                  </Button>
                  <input
                    id="timetable-upload"
                    type="file"
                    accept=".pdf,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Preferences & Stats */}
          <div className="space-y-4 sm:space-y-6">
            {/* Attendance Preferences */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="text-lg sm:text-xl font-semibold">
                  Attendance Preferences
                </h3>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="minAttendance"
                    className="text-sm font-medium"
                  >
                    Minimum Attendance Target
                  </Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-foreground">
                        {formData.min_attendance_percentage}%
                      </span>
                    </div>
                    <Slider
                      value={[formData.min_attendance_percentage]}
                      onValueChange={(value) =>
                        handleInputChange("min_attendance_percentage", value[0])
                      }
                      max={100}
                      min={50}
                      step={1}
                      disabled={!editing}
                      className="w-full cursor-pointer transition-none"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground transition-none">
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm font-medium">
                      Attendance Warnings
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get notified when attendance drops below target
                    </p>
                  </div>
                  <Switch
                    className="transition-none flex-shrink-0 ml-3"
                    checked={formData.enable_attendance_warnings}
                    onCheckedChange={(value: any) =>
                      handleInputChange("enable_attendance_warnings", value)
                    }
                    disabled={!editing}
                  />
                </div>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Member Since
                  </span>
                  <span className="text-sm font-medium">
                    {profile?.created_at
                      ? format(new Date(profile.created_at), "MMM yyyy")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Last Updated
                  </span>
                  <span className="text-sm font-medium">
                    {profile?.updated_at
                      ? format(new Date(profile.updated_at), "MMM dd, yyyy")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Onboarding
                  </span>
                  <Badge
                    variant={
                      profile?.onboarding_completed ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {profile?.onboarding_completed ? "Completed" : "Pending"}
                  </Badge>
                </div>
                {timetableData && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Classes
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {timetableData.classes_summary?.total || 0} total
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: any;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs sm:text-sm flex items-center gap-2">
        {Icon && <Icon className="h-3 w-3 sm:h-4 sm:w-4" />}
        {label}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="text-xs sm:text-sm transition-none"
      />
    </div>
  );
}

function SemesterSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs sm:text-sm flex items-center gap-2">
        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
        Current Semester
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="text-xs sm:text-sm">
          <SelectValue placeholder="Select semester" />
        </SelectTrigger>
        <SelectContent>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <SelectItem
              key={sem}
              value={sem.toString()}
              className="text-xs sm:text-sm"
            >
              {sem}
              {sem === 1
                ? "st"
                : sem === 2
                ? "nd"
                : sem === 3
                ? "rd"
                : "th"}{" "}
              Semester
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function GraduationCalendar({
  selected,
  onSelect,
  disabled,
}: {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  disabled?: boolean;
}) {
  return (
    <CalendarComponent
      mode="single"
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      className="rounded-md border shadow-sm"
      captionLayout="dropdown"
      fromYear={new Date().getFullYear() - 5}
      toYear={new Date().getFullYear() + 5}
    />
  );
}

function GraduationDatePicker({
  value,
  onChange,
  disabled,
}: {
  value: Date;
  onChange: (value: Date) => void;
  disabled?: boolean;
}) {
  const safeValue =
    value instanceof Date && !isNaN(value.getTime()) ? value : new Date();

  return (
    <div className="space-y-2">
      <Label className="text-xs sm:text-sm flex items-center gap-2">
        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
        Expected Graduation
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal text-xs sm:text-sm h-9 sm:h-10",
              !safeValue && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4 opacity-70" />
            {safeValue ? format(safeValue, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          side="bottom"
          align="start"
          sideOffset={4}
          avoidCollisions={false}
          collisionPadding={20}
        >
          <GraduationCalendar
            selected={safeValue}
            onSelect={(date) => {
              if (date) {
                onChange(date);
              }
            }}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          <div className="lg:hidden">
            <Skeleton className="w-7 h-7 rounded" />
          </div>
          <div className="hidden lg:block">
            <Skeleton className="w-7 h-7 rounded" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-5 w-24 rounded" />
          </div>
          <Skeleton className="h-5 w-16 rounded hidden xs:block" />
        </div>
      </header>

      <main className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Header Card Skeleton */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg" />
              <div className="space-y-2 min-w-0 flex-1">
                <Skeleton className="h-6 w-32 sm:h-7 sm:w-48 rounded" />
                <Skeleton className="h-4 w-48 sm:h-5 sm:w-64 rounded" />
              </div>
            </div>
            <Skeleton className="h-9 w-full xs:w-24 sm:h-10 sm:w-28 rounded" />
          </div>
          <Skeleton className="h-5 w-32 rounded" />
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Academic Information & Timetable Skeleton */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-48 rounded" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-9 w-full rounded" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-40 rounded" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-lg" />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Skeleton className="h-9 flex-1 rounded" />
                  <Skeleton className="h-9 w-full sm:w-20 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Preferences & Stats Skeleton */}
          <div className="space-y-4 sm:space-y-6">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-40 rounded" />
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-36 rounded" />
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-12 rounded" />
                    <Skeleton className="h-2 w-full rounded" />
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-8 rounded" />
                      <Skeleton className="h-3 w-8 rounded" />
                      <Skeleton className="h-3 w-8 rounded" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-48 rounded" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full ml-3" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <Skeleton className="h-6 w-24 rounded mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-3 px-4">
          <div className="lg:hidden">
            <MobileSidebarTrigger />
          </div>
          <div className="hidden lg:block">
            <SidebarTrigger />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Assignments</h1>
          </div>
        </div>
      </header>

      <main className="p-4">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />

            <h2 className="text-sm font-semibold mb-1">Failed to load data</h2>

            <p className="text-xs text-muted-foreground mb-3">{error}</p>

            <button
              onClick={onRetry}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-xs h-8"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
