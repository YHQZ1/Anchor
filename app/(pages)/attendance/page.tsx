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
import { SidebarTrigger, MobileSidebarTrigger } from "@/components/Sidebar";
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

export default function Attendance() {
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
      setError("Failed to load attendance");
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
        <div className="flex h-14 sm:h-16 items-center gap-3 px-4 sm:px-6">
          <div className="lg:hidden">
            <MobileSidebarTrigger />
          </div>
          <div className="hidden lg:block">
            <SidebarTrigger />
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-semibold">Attendance</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportData}
              className="cursor-pointer transition-none h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Export</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowMarkAttendance(true)}
              className="cursor-pointer transition-none h-9 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Mark Today</span>
              <span className="sm:hidden">Mark</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        <StatsGrid stats={stats} userProfile={userProfile} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
    return (
      <Badge variant="default" className="transition-none text-xs">
        Excellent
      </Badge>
    );
  } else if (percentage >= threshold) {
    return (
      <Badge variant="secondary" className="transition-none text-xs">
        Safe
      </Badge>
    );
  } else {
    return (
      <Badge
        variant="destructive"
        className="text-white dark:text-white transition-none text-xs"
      >
        At Risk
      </Badge>
    );
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "present":
      return <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />;
    case "absent":
      return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
    case "late":
      return <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
    case "excused":
      return <AlertTriangle className="h-4 w-4 text-blue-500 flex-shrink-0" />;
    default:
      return <CheckCircle className="h-4 w-4 text-gray-500 flex-shrink-0" />;
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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {statItems.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/10">
                <stat.icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground line-clamp-1">
                {stat.title}
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {stat.trend}
              </p>
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
    <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Subject-wise Breakdown</h2>
        <Button
          variant="ghost"
          onClick={onExport}
          className="transition-none h-8 text-xs"
        >
          <Download className="h-3 w-3 mr-1" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>

      {attendanceSummary.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
          <h3 className="text-base font-medium mb-2">No attendance data</h3>
          <p className="text-xs text-muted-foreground">
            Start marking your attendance to see your progress
          </p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {attendanceSummary.map((course, index) => (
            <AccordionItem
              key={course.course_code}
              value={`course-${index}`}
              className="border border-border rounded-lg transition-none"
            >
              <AccordionTrigger className="px-3 py-2 hover:no-underline cursor-pointer">
                <div className="flex items-center justify-between w-full pr-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="text-left min-w-0 flex-1">
                      <h3 className="font-medium text-sm transition-none truncate">
                        {course.course_name}
                      </h3>
                      <p className="text-xs text-muted-foreground transition-none truncate">
                        {course.course_code}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {getStatusBadge(course.attendance_percentage, threshold)}
                    <div className="text-right">
                      <p className="text-sm font-bold transition-none">
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
              <AccordionContent className="px-3 pb-3">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        Attendance Progress
                      </span>
                      <span className="text-muted-foreground">
                        {course.attendance_percentage}%
                      </span>
                    </div>
                    <Progress
                      value={course.attendance_percentage}
                      className="h-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
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

                  <div className="flex items-center justify-between p-2 rounded-lg bg-accent text-xs">
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
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-2">
        {recentActivity.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-xs text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-accent"
            >
              {getStatusIcon(activity.status)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs truncate">
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
                className="text-xs"
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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg">Insights & Predictions</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border border-border bg-accent">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-medium text-sm">Subjects at Risk</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.subjectsAtRisk > 0
                ? `${stats.subjectsAtRisk} subject${
                    stats.subjectsAtRisk > 1 ? "s" : ""
                  } below ${threshold}%. Focus on regular attendance.`
                : `All subjects are above the ${threshold}% threshold.`}
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-accent">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-medium text-sm">Overall Progress</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Current overall attendance is{" "}
              <span className="font-semibold">{stats.overallAttendance}%</span>.{" "}
              {stats.overallAttendance >= threshold
                ? "Maintain this consistency!"
                : `Aim for ${threshold}% or higher.`}
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-accent">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-medium text-sm">Safe Buffer</h3>
            </div>
            <p className="text-xs text-muted-foreground">
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
      <AlertDialogContent className="max-w-[95vw] sm:max-w-md mx-2">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm sm:text-base">
            Mark Today's Attendance
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs sm:text-sm">
            Record your attendance for today's classes.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-xs sm:text-sm font-medium mb-1 block">
              Course
            </label>
            <Select
              value={markAttendanceData.course_id}
              onValueChange={(value) =>
                setMarkAttendanceData((prev: any) => ({
                  ...prev,
                  course_id: value,
                }))
              }
            >
              <SelectTrigger className="text-xs sm:text-sm h-9">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem
                    key={course.id}
                    value={course.id}
                    className="text-xs sm:text-sm"
                  >
                    {course.course_code} - {course.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium mb-1 block">
              Date
            </label>
            <input
              type="date"
              value={markAttendanceData.class_date}
              onChange={(e) =>
                setMarkAttendanceData((prev: any) => ({
                  ...prev,
                  class_date: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium mb-1 block">
              Status
            </label>
            <Select
              value={markAttendanceData.status}
              onValueChange={(value) =>
                setMarkAttendanceData((prev: any) => ({
                  ...prev,
                  status: value,
                }))
              }
            >
              <SelectTrigger className="text-xs sm:text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present" className="text-xs sm:text-sm">
                  Present
                </SelectItem>
                <SelectItem value="absent" className="text-xs sm:text-sm">
                  Absent
                </SelectItem>
                <SelectItem value="late" className="text-xs sm:text-sm">
                  Late
                </SelectItem>
                <SelectItem value="excused" className="text-xs sm:text-sm">
                  Excused
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="text-xs sm:text-sm h-9">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onMarkAttendance}
            disabled={!markAttendanceData.course_id}
            className="text-xs sm:text-sm h-9"
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
        <div className="flex h-14 sm:h-16 items-center gap-3 px-4 sm:px-6">
          <div className="lg:hidden">
            <Skeleton className="w-7 h-7 rounded" />
          </div>
          <div className="hidden lg:block">
            <Skeleton className="w-7 h-7 rounded" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-5 w-24 sm:w-32 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-16 sm:w-20 rounded" />
            <Skeleton className="h-9 w-16 sm:w-20 rounded" />
          </div>
        </div>
      </header>
      <main className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16 sm:w-20 rounded" />
                  <Skeleton className="h-5 w-10 sm:h-6 sm:w-12 rounded" />
                  <Skeleton className="h-2 w-20 sm:w-24 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-32 sm:w-40 rounded" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-28 sm:w-32 rounded" />
                        <Skeleton className="h-3 w-20 sm:w-24 rounded" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-12 rounded" />
                        <Skeleton className="h-5 w-8 rounded" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <Skeleton className="h-5 w-24 sm:w-28 rounded mb-4" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-2 w-20 rounded" />
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
        <div className="flex h-14 items-center gap-3 px-4">
          <div className="lg:hidden">
            <MobileSidebarTrigger />
          </div>
          <div className="hidden lg:block">
            <SidebarTrigger />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Attendance</h1>
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
