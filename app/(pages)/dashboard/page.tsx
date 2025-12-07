/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Calendar,
  TrendingUp,
  Clock,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { SidebarTrigger, MobileSidebarTrigger } from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  id: string;
  course_code: string;
  course_name: string;
  instructor?: string;
  credits: number;
  color: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed" | "overdue";
  progress: number;
  course_id: string;
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

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  time: string;
  created_at: string;
}

interface Stat {
  title: string;
  value: string;
  icon: any;
  trend: string;
  color: string;
  bgColor: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Student");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stat[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>(
    []
  );
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const headers = { Authorization: `Bearer ${token}` };

      const [profileRes, assignmentsRes, coursesRes, attendanceRes] =
        await Promise.all([
          fetch("/api/profile", { headers }),
          fetch("/api/assignments?upcoming_only=true&status=pending", {
            headers,
          }),
          fetch("/api/courses", { headers }),
          fetch("/api/attendance?summary_only=true", { headers }),
        ]);

      if (
        profileRes.status === 401 ||
        assignmentsRes.status === 401 ||
        coursesRes.status === 401 ||
        attendanceRes.status === 401
      ) {
        window.location.href = "/auth";
        return;
      }

      if (
        !profileRes.ok ||
        !assignmentsRes.ok ||
        !coursesRes.ok ||
        !attendanceRes.ok
      ) {
        throw new Error("Failed to fetch dashboard data");
      }

      const [profileData, assignmentsData, coursesData, attendanceData] =
        await Promise.all([
          profileRes.json(),
          assignmentsRes.json(),
          coursesRes.json(),
          attendanceRes.json(),
        ]);

      const userName =
        profileData.profile?.full_name ||
        profileData.user?.username ||
        "Student";
      setUserName(userName);

      processDashboardData(
        assignmentsData.assignments || [],
        coursesData.courses || [],
        attendanceData.summary || [],
        profileData.profile
      );
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const processDashboardData = (
    assignments: Assignment[],
    coursesList: Course[],
    attendanceSummary: AttendanceSummary[],
    userProfile: any
  ) => {
    const pendingAssignments = assignments.length;
    const activeCourses = coursesList.length;
    const attendanceThreshold = userProfile?.min_attendance_percentage || 75;

    const actualAttendance = calculateActualAttendance(attendanceSummary);

    const actualPerformance = calculateActualPerformance(assignments);

    setStats([
      {
        title: "Pending Assignments",
        value: pendingAssignments.toString(),
        icon: CheckSquare,
        trend: `${
          pendingAssignments > 0 ? "+" : ""
        }${pendingAssignments} due soon`,
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-100 dark:bg-purple-500/10",
      },
      {
        title: "Attendance Rate",
        value: `${actualAttendance}%`,
        icon: Calendar,
        trend: getAttendanceTrend(actualAttendance, attendanceThreshold),
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-100 dark:bg-purple-500/10",
      },
      {
        title: "Active Courses",
        value: activeCourses.toString(),
        icon: BookOpen,
        trend: "Current semester",
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-100 dark:bg-purple-500/10",
      },
      {
        title: "Avg Performance",
        value: `${actualPerformance}%`,
        icon: TrendingUp,
        trend: getPerformanceTrend(actualPerformance),
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-100 dark:bg-purple-500/10",
      },
    ]);

    setUpcomingAssignments(assignments.slice(0, 4));
    setRecentActivity(
      generateActivityFromData(
        assignments,
        attendanceSummary,
        attendanceThreshold
      )
    );
  };

  const calculateActualAttendance = (
    attendanceSummary: AttendanceSummary[]
  ): number => {
    if (attendanceSummary.length === 0) return 0;

    const totalClasses = attendanceSummary.reduce(
      (sum, course) => sum + course.total_classes,
      0
    );
    const attendedClasses = attendanceSummary.reduce(
      (sum, course) => sum + course.present + course.late,
      0
    );

    return totalClasses > 0
      ? Math.round((attendedClasses / totalClasses) * 100)
      : 0;
  };

  const calculateActualPerformance = (assignments: Assignment[]): number => {
    if (assignments.length === 0) return 0;

    const completedAssignments = assignments.filter(
      (assignment) =>
        assignment.status === "completed" || assignment.progress === 100
    );

    return Math.round((completedAssignments.length / assignments.length) * 100);
  };

  const getAttendanceTrend = (
    attendance: number,
    threshold: number
  ): string => {
    if (attendance >= threshold + 15) return "Excellent";
    if (attendance >= threshold) return "Good";
    if (attendance >= threshold - 15) return "Needs improvement";
    return "Critical";
  };

  const getPerformanceTrend = (performance: number): string => {
    if (performance >= 90) return "Excellent";
    if (performance >= 75) return "Good";
    if (performance >= 60) return "Needs work";
    return "Critical";
  };

  const generateActivityFromData = (
    assignments: Assignment[],
    attendanceSummary: AttendanceSummary[],
    threshold: number
  ): RecentActivity[] => {
    const activities: RecentActivity[] = [];
    const now = new Date();

    const recentAssignments = assignments
      .sort(
        (a, b) =>
          new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
      )
      .slice(0, 2);

    recentAssignments.forEach((assignment) => {
      activities.push({
        id: `assignment-${assignment.id}`,
        type: "assignment",
        title: `Added "${assignment.title}"`,
        time: "Recently",
        created_at: assignment.due_date,
      });
    });

    if (attendanceSummary.length > 0) {
      const bestCourse = attendanceSummary.reduce((prev, current) =>
        prev.attendance_percentage > current.attendance_percentage
          ? prev
          : current
      );

      activities.push({
        id: `attendance-${bestCourse.course_code}`,
        type: "attendance",
        title: `${bestCourse.attendance_percentage}% in ${bestCourse.course_code}`,
        time: "Current",
        created_at: now.toISOString(),
      });
    }

    activities.push({
      id: "system-threshold",
      type: "system",
      title: `Your attendance target: ${threshold}%`,
      time: "Just now",
      created_at: now.toISOString(),
    });

    return activities.slice(0, 3);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge
            variant="destructive"
            className="text-white dark:text-white text-[10px]"
          >
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="secondary" className="text-[10px]">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="text-[10px]">
            Low
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            Normal
          </Badge>
        );
    }
  };

  const formatDueDate = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `In ${diffDays} days`;
    return due.toLocaleDateString();
  };

  if (loading) return <DashboardSkeleton />;

  if (error) return <ErrorState error={error} onRetry={fetchDashboardData} />;

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
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden xs:block">
              Welcome, {userName}
            </span>
          </div>
        </div>
      </header>

      <main className="p-3 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 xs:grid-cols-2 lg:grid-cols-4 gap-2">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-card p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-md ${stat.bgColor}`}>
                  <stat.icon className={`h-3 w-3 ${stat.color}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-muted-foreground line-clamp-1">
                  {stat.title}
                </p>
                <p className="text-sm font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-1">
                  {stat.trend}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Upcoming Assignments */}
          <div className="xl:col-span-2 rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Upcoming Assignments</h2>
              <a
                href="/assignments"
                className="text-xs font-medium text-primary hover:text-primary/80"
              >
                View all →
              </a>
            </div>
            <div className="space-y-2">
              {upcomingAssignments.length > 0 ? (
                upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex flex-col p-2 rounded border border-border hover:bg-accent/50 cursor-pointer gap-1"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-xs mb-0.5 truncate">
                        {assignment.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        {assignment.courses.course_code}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {getPriorityBadge(assignment.priority)}
                      <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDueDate(assignment.due_date)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <CheckSquare className="h-6 w-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">No upcoming assignments</p>
                  <p className="text-[10px]">You&apos;re all caught up!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border border-border bg-card p-3">
            <h2 className="text-base font-semibold mb-3">Recent Activity</h2>
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-2">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs truncate">
                      {activity.title}
                    </p>
                    <p className="text-[10px] mt-0.5 text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-border bg-card p-3">
          <h2 className="text-base font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
            <button
              onClick={() => (window.location.href = "/assignments")}
              className="p-2 rounded border border-border hover:bg-accent/50 text-left transition-none"
            >
              <CheckSquare className="h-4 w-4 mb-1 text-primary" />
              <h3 className="font-medium text-xs mb-0.5">Add Assignment</h3>
              <p className="text-[10px] text-muted-foreground">
                Track a new assignment
              </p>
            </button>
            <button
              onClick={() => (window.location.href = "/attendance")}
              className="p-2 rounded border border-border hover:bg-accent/50 text-left transition-none"
            >
              <Calendar className="h-4 w-4 mb-1 text-primary" />
              <h3 className="font-medium text-xs mb-0.5">Mark Attendance</h3>
              <p className="text-[10px] text-muted-foreground">
                Update today&apos;s attendance
              </p>
            </button>
            <button className="p-2 rounded border border-border hover:bg-accent/50 text-left transition-none">
              <TrendingUp className="h-4 w-4 mb-1 text-primary" />
              <h3 className="font-medium text-xs mb-0.5">View Analytics</h3>
              <p className="text-[10px] text-muted-foreground">
                Check your progress
              </p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-3 px-4">
          <div className="lg:hidden">
            <Skeleton className="w-7 h-7 rounded" />
          </div>
          <div className="hidden lg:block">
            <Skeleton className="w-7 h-7 rounded" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-5 w-20 rounded" />
          </div>
          <Skeleton className="h-5 w-12 rounded hidden xs:block" />
        </div>
      </header>
      <main className="p-3 space-y-4">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 xs:grid-cols-2 lg:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="w-6 h-6 rounded-md" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-12 rounded" />
                <Skeleton className="h-4 w-8 rounded" />
                <Skeleton className="h-2 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-3 w-10 rounded" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex flex-col p-2 rounded border border-border gap-1"
                >
                  <div className="flex-1 space-y-1 min-w-0">
                    <Skeleton className="h-3 w-3/4 rounded" />
                    <Skeleton className="h-2 w-12 rounded" />
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <Skeleton className="h-4 w-12 rounded" />
                    <div className="flex items-center gap-0.5">
                      <Skeleton className="h-3 w-3 rounded" />
                      <Skeleton className="h-2 w-8 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <Skeleton className="h-4 w-20 rounded mb-3" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="w-1.5 h-1.5 rounded-full mt-1.5" />
                  <div className="flex-1 space-y-1 min-w-0">
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-2 w-16 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="rounded-lg border border-border bg-card p-3">
          <Skeleton className="h-4 w-20 rounded mb-3" />
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-2 rounded border border-border">
                <Skeleton className="h-4 w-4 rounded mb-1" />
                <Skeleton className="h-3 w-16 rounded mb-0.5" />
                <Skeleton className="h-2 w-24 rounded" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
  title = "Failed to load data",
}: {
  error: string;
  onRetry: () => void;
  title?: string;
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
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        </div>
      </header>

      <main className="p-4">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
            <h2 className="text-sm font-semibold mb-1">{title}</h2>
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
