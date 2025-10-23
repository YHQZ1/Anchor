/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Clock,
  AlertCircle,
} from "lucide-react";
import { SidebarTrigger } from "@/components/Sidebar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Course {
  id: string;
  course_code: string;
  course_name: string;
  color: string;
}

interface AttendanceRecord {
  id: string;
  course_id: string;
  class_date: string;
  status: "present" | "absent" | "late" | "excused";
  marked_at: string;
  courses: Course;
}

interface AttendanceSummary {
  course_code: string;
  course_name: string;
  color: string;
  total_classes: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_percentage: number;
}

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<
    AttendanceSummary[]
  >([]);
  const [recentActivity, setRecentActivity] = useState<AttendanceRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    min_attendance_percentage: number;
  } | null>(null);

  const [markAttendanceData, setMarkAttendanceData] = useState({
    course_id: "",
    class_date: new Date().toISOString().split("T")[0],
    status: "present" as "present" | "absent" | "late" | "excused",
  });

  useEffect(() => {
    fetchAttendanceData();
    fetchCourses();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) return;

      const response = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const headers = { Authorization: `Bearer ${token}` };

      const [summaryRes, activityRes] = await Promise.all([
        fetch("/api/attendance?summary_only=true", { headers }),
        fetch("/api/attendance?limit=10", { headers }),
      ]);

      if (summaryRes.status === 401 || activityRes.status === 401) {
        window.location.href = "/auth";
        return;
      }

      if (!summaryRes.ok || !activityRes.ok)
        throw new Error("Failed to fetch attendance data");

      const [summaryData, activityData] = await Promise.all([
        summaryRes.json(),
        activityRes.json(),
      ]);

      setAttendanceSummary(summaryData.summary || []);
      setRecentActivity(activityData.attendance || []);
    } catch (err) {
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) return;

      const response = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token");

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(markAttendanceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mark attendance");
      }

      fetchAttendanceData();
      setShowMarkAttendance(false);
      setMarkAttendanceData({
        course_id: "",
        class_date: new Date().toISOString().split("T")[0],
        status: "present",
      });
    } catch (err) {
      console.error("Error marking attendance:", err);
      alert(err instanceof Error ? err.message : "Failed to mark attendance");
    }
  };

  const handleExportData = () => {
    const csvContent = [
      [
        "Course Code",
        "Course Name",
        "Total Classes",
        "Present",
        "Absent",
        "Late",
        "Excused",
        "Percentage",
      ],
      ...attendanceSummary.map((course) => [
        course.course_code,
        course.course_name,
        course.total_classes,
        course.present,
        course.absent,
        course.late,
        course.excused,
        `${course.attendance_percentage}%`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = calculateOverallStats(attendanceSummary, userProfile);

  if (loading) return <AttendanceSkeleton />;
  if (error) return <ErrorState error={error} onRetry={fetchAttendanceData} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Attendance</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleExportData}
              className="cursor-pointer transition-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowMarkAttendance(true)}
              className="cursor-pointer transition-none"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Mark Today
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <StatsGrid stats={stats} userProfile={userProfile} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SubjectBreakdown
            attendanceSummary={attendanceSummary}
            userProfile={userProfile}
            onExport={handleExportData}
          />
          <RecentActivity recentActivity={recentActivity} />
        </div>

        {attendanceSummary.length > 0 && (
          <AttendanceInsights stats={stats} userProfile={userProfile} />
        )}
      </main>

      <MarkAttendanceModal
        open={showMarkAttendance}
        onOpenChange={setShowMarkAttendance}
        markAttendanceData={markAttendanceData}
        setMarkAttendanceData={setMarkAttendanceData}
        courses={courses}
        onMarkAttendance={handleMarkAttendance}
      />
    </div>
  );
}

// Helper Functions

function calculateOverallStats(
  attendanceSummary: AttendanceSummary[],
  userProfile: any
) {
  if (attendanceSummary.length === 0) {
    return {
      overallAttendance: 0,
      totalClasses: 0,
      attendedClasses: 0,
      subjectsAtRisk: 0,
      safeAbsences: 0,
    };
  }

  const threshold = userProfile?.min_attendance_percentage || 75;

  const totalClasses = attendanceSummary.reduce(
    (sum, course) => sum + course.total_classes,
    0
  );
  const attendedClasses = attendanceSummary.reduce(
    (sum, course) => sum + course.present + course.late,
    0
  );
  const overallAttendance =
    totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

  const subjectsAtRisk = attendanceSummary.filter(
    (course) => course.attendance_percentage < threshold
  ).length;

  const safeAbsences = attendanceSummary.reduce((sum, course) => {
    const minRequired = Math.ceil(course.total_classes * (threshold / 100));
    const currentAttended = course.present + course.late;
    return sum + Math.max(0, minRequired - currentAttended);
  }, 0);

  return {
    overallAttendance,
    totalClasses,
    attendedClasses,
    subjectsAtRisk,
    safeAbsences,
    threshold,
  };
}

function getStatusBadge(percentage: number, threshold: number) {
  if (percentage >= 90) {
    return <Badge variant="default">Excellent</Badge>;
  } else if (percentage >= threshold) {
    return <Badge variant="secondary">Safe</Badge>;
  } else {
    return (
      <Badge variant="destructive" className="text-white dark:text-white">
        At Risk
      </Badge>
    );
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "present":
      return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />;
    case "absent":
      return <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />;
    case "late":
      return <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />;
    case "excused":
      return <AlertTriangle className="h-5 w-5 text-blue-500 flex-shrink-0" />;
    default:
      return <CheckCircle className="h-5 w-5 text-gray-500 flex-shrink-0" />;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

// Extracted Components

function StatsGrid({ stats, userProfile }: { stats: any; userProfile: any }) {
  const statItems = [
    {
      title: "Overall Attendance",
      value: `${stats.overallAttendance}%`,
      icon: Calendar,
      trend:
        stats.overallAttendance >=
        (userProfile?.min_attendance_percentage || 75)
          ? "Above threshold"
          : "Below threshold",
    },
    {
      title: "Classes Attended",
      value: `${stats.attendedClasses}/${stats.totalClasses}`,
      icon: CheckCircle,
      trend: `${stats.totalClasses - stats.attendedClasses} absences`,
    },
    {
      title: "Subjects at Risk",
      value: `${stats.subjectsAtRisk}`,
      icon: AlertTriangle,
      trend: "Need attention",
    },
    {
      title: "Safe Absences",
      value: `${stats.safeAbsences}`,
      icon: TrendingUp,
      trend: `Before ${userProfile?.min_attendance_percentage || 75}%`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-500/10">
                <stat.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SubjectBreakdown({
  attendanceSummary,
  userProfile,
  onExport,
}: {
  attendanceSummary: AttendanceSummary[];
  userProfile: any;
  onExport: () => void;
}) {
  const threshold = userProfile?.min_attendance_percentage || 75;

  return (
    <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Subject-wise Breakdown</h2>
        <Button variant="ghost" onClick={onExport}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      {attendanceSummary.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No attendance data</h3>
          <p className="text-sm text-muted-foreground">
            Start marking your attendance to see your progress
          </p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {attendanceSummary.map((course, index) => (
            <AccordionItem
              key={course.course_code}
              value={`course-${index}`}
              className="border border-border rounded-lg"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline cursor-pointer">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <h3 className="font-medium text-base">
                        {course.course_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {course.course_code}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(course.attendance_percentage, threshold)}
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {course.attendance_percentage}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.present + course.late}/{course.total_classes}{" "}
                        classes
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        Attendance Progress
                      </span>
                      <span className="text-muted-foreground">
                        {course.attendance_percentage}%
                      </span>
                    </div>
                    <Progress
                      value={course.attendance_percentage}
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Present</p>
                      <p className="font-medium">{course.present}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Absent</p>
                      <p className="font-medium">{course.absent}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Late</p>
                      <p className="font-medium">{course.late}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Excused</p>
                      <p className="font-medium">{course.excused}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
                    <span className="text-muted-foreground">
                      Classes needed to reach {threshold}%
                    </span>
                    <span className="font-medium">
                      {Math.max(
                        0,
                        Math.ceil(course.total_classes * (threshold / 100)) -
                          (course.present + course.late)
                      )}{" "}
                      classes
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}

function RecentActivity({
  recentActivity,
}: {
  recentActivity: AttendanceRecord[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
      <div className="space-y-4">
        {recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-accent"
            >
              {getStatusIcon(activity.status)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {activity.courses.course_code}
                </p>
                <p className="text-xs mt-0.5 text-muted-foreground">
                  {formatDate(activity.class_date)} •{" "}
                  {new Date(activity.class_date).toLocaleDateString()}
                </p>
              </div>
              <Badge
                variant={
                  activity.status === "present"
                    ? "default"
                    : activity.status === "absent"
                    ? "destructive"
                    : "secondary"
                }
              >
                {activity.status}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AttendanceInsights({
  stats,
  userProfile,
}: {
  stats: any;
  userProfile: any;
}) {
  const threshold = userProfile?.min_attendance_percentage || 75;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights & Predictions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-border bg-accent">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-medium">Subjects at Risk</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {stats.subjectsAtRisk > 0
                ? `${stats.subjectsAtRisk} subject${
                    stats.subjectsAtRisk > 1 ? "s" : ""
                  } below ${threshold}%. Focus on regular attendance.`
                : `All subjects are above the ${threshold}% threshold.`}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-accent">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-medium">Overall Progress</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Current overall attendance is{" "}
              <span className="font-semibold">{stats.overallAttendance}%</span>.{" "}
              {stats.overallAttendance >= threshold
                ? "Maintain this consistency!"
                : `Aim for ${threshold}% or higher.`}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-accent">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-medium">Safe Buffer</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              You can miss up to{" "}
              <span className="font-semibold">{stats.safeAbsences}</span> more
              classes while staying above {threshold}% threshold.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MarkAttendanceModal({
  open,
  onOpenChange,
  markAttendanceData,
  setMarkAttendanceData,
  courses,
  onMarkAttendance,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  markAttendanceData: any;
  setMarkAttendanceData: (data: any) => void;
  courses: Course[];
  onMarkAttendance: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark Today's Attendance</AlertDialogTitle>
          <AlertDialogDescription>
            Record your attendance for today's classes.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Course</label>
            <Select
              value={markAttendanceData.course_id}
              onValueChange={(value) =>
                setMarkAttendanceData((prev: any) => ({
                  ...prev,
                  course_id: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.course_code} - {course.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Date</label>
            <input
              type="date"
              value={markAttendanceData.class_date}
              onChange={(e) =>
                setMarkAttendanceData((prev: any) => ({
                  ...prev,
                  class_date: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select
              value={markAttendanceData.status}
              onValueChange={(value) =>
                setMarkAttendanceData((prev: any) => ({
                  ...prev,
                  status: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="excused">Excused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onMarkAttendance}
            disabled={!markAttendanceData.course_id}
          >
            Mark Attendance
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AttendanceSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Attendance</h1>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-32 rounded" />
            <Skeleton className="h-9 w-32 rounded" />
          </div>
        </div>
      </header>
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-8 w-16 rounded" />
                  <Skeleton className="h-3 w-32 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-32 rounded" />
                        <Skeleton className="h-4 w-24 rounded" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded" />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <Skeleton className="h-6 w-32 rounded mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-5 h-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                </div>
              ))}
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
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Attendance</h1>
          </div>
        </div>
      </header>
      <main className="p-6">
        <div className="flex items-center justify-center h-96">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Failed to load attendance data
              </CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={onRetry} className="w-full">
                Retry
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
