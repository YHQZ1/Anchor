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
            className="text-white dark:text-white text-xs"
          >
            High Priority
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="secondary" className="text-xs">
            Medium Priority
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="text-xs">
            Low Priority
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
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

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 sm:h-16 items-center gap-4 px-4 sm:px-6">
            <div className="lg:hidden">
              <MobileSidebarTrigger />
            </div>
            <div className="hidden lg:block">
              <SidebarTrigger />
            </div>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-semibold">Dashboard</h1>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6">
          <div className="flex items-center justify-center h-64 sm:h-96">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-destructive mx-auto mb-3 sm:mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold mb-2">
                Failed to load data
              </h2>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                {error}
              </p>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm sm:text-base"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 sm:h-16 items-center gap-4 px-4 sm:px-6">
          {/* Mobile trigger (visible on mobile) */}
          <div className="lg:hidden">
            <MobileSidebarTrigger />
          </div>
          {/* Desktop trigger (visible on desktop) */}
          <div className="hidden lg:block">
            <SidebarTrigger />
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Welcome back, {userName}
            </span>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-card p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon
                    className={`h-4 w-4 sm:h-6 sm:w-6 ${stat.color}`}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.trend}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Upcoming Assignments */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold">
                Upcoming Assignments
              </h2>
              <a
                href="/assignments"
                className="text-xs sm:text-sm font-medium text-primary hover:text-primary/80"
              >
                View all →
              </a>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {upcomingAssignments.length > 0 ? (
                upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer gap-2 sm:gap-0"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base mb-1 truncate">
                        {assignment.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {assignment.courses.course_code}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      {getPriorityBadge(assignment.priority)}
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{formatDueDate(assignment.due_date)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <CheckSquare className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">
                    No upcoming assignments
                  </p>
                  <p className="text-xs sm:text-sm">
                    You&apos;re all caught up!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
              Recent Activity
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs sm:text-sm truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <button
              onClick={() => (window.location.href = "/assignments")}
              className="p-3 sm:p-4 rounded-lg border border-border hover:bg-accent/50 text-left transition-colors"
            >
              <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6 mb-2 text-primary" />
              <h3 className="font-medium text-sm sm:text-base mb-1">
                Add Assignment
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Track a new assignment
              </p>
            </button>
            <button
              onClick={() => (window.location.href = "/attendance")}
              className="p-3 sm:p-4 rounded-lg border border-border hover:bg-accent/50 text-left transition-colors"
            >
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mb-2 text-primary" />
              <h3 className="font-medium text-sm sm:text-base mb-1">
                Mark Attendance
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Update the attendance for today
              </p>
            </button>
            <button className="p-3 sm:p-4 rounded-lg border border-border hover:bg-accent/50 text-left transition-colors">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 mb-2 text-primary" />
              <h3 className="font-medium text-sm sm:text-base mb-1">
                View Analytics
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
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
        <div className="flex h-14 sm:h-16 items-center gap-4 px-4 sm:px-6">
          <div className="lg:hidden">
            <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded" />
          </div>
          <div className="hidden lg:block">
            <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-5 w-24 sm:h-6 sm:w-32 rounded" />
          </div>
          <Skeleton className="h-5 w-16 sm:h-6 sm:w-24 rounded hidden sm:block" />
        </div>
      </header>
      <main className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 sm:h-4 sm:w-24 rounded" />
                <Skeleton className="h-6 w-12 sm:h-8 sm:w-16 rounded" />
                <Skeleton className="h-2 w-24 sm:h-3 sm:w-32 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <Skeleton className="h-5 w-36 sm:h-6 sm:w-48 rounded" />
              <Skeleton className="h-4 w-12 sm:h-4 sm:w-16 rounded" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border border-border gap-2 sm:gap-0"
                >
                  <div className="flex-1 space-y-2 min-w-0">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <Skeleton className="h-5 w-16 rounded" />
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded" />
                      <Skeleton className="h-3 w-12 sm:h-4 sm:w-16 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <Skeleton className="h-5 w-28 sm:h-6 sm:w-32 rounded mb-4 sm:mb-6" />
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-2 h-2 rounded-full mt-2" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-2 w-20 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <Skeleton className="h-5 w-28 sm:h-6 sm:w-32 rounded mb-4 sm:mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 sm:p-4 rounded-lg border border-border"
              >
                <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded mb-2" />
                <Skeleton className="h-4 w-24 sm:h-5 sm:w-32 rounded mb-1" />
                <Skeleton className="h-3 w-32 sm:h-4 sm:w-48 rounded" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
