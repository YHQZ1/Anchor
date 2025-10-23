/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  CheckSquare,
  Plus,
  Search,
  MoreVertical,
  Archive,
  Trash2,
  Edit,
  Eye,
  AlertCircle,
  CheckCircle,
  X,
  FileText,
  BarChart3,
} from "lucide-react";
import { SidebarTrigger } from "@/components/Sidebar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Course {
  id: string;
  course_code: string;
  course_name: string;
  instructor: string;
  credits: number;
  color: string;
  created_at: string;
  archived?: boolean;
}

interface Class {
  id: string;
  course_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
  class_type: string;
  courses: {
    course_code: string;
    course_name: string;
    color: string;
  };
}

interface Assignment {
  id: string;
  course_id: string;
  title: string;
  status: string;
  due_date: string;
  priority: string;
  courses: {
    course_code: string;
    course_name: string;
  };
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

interface UserProfile {
  min_attendance_percentage: number;
}

export default function CoursesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<
    AttendanceSummary[]
  >([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [archiveConfirm, setArchiveConfirm] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);

  const [newCourse, setNewCourse] = useState({
    course_code: "",
    course_name: "",
    instructor: "",
    credits: 3,
    color: "purple",
  });

  useEffect(() => {
    fetchCoursesData();
  }, []);

  const fetchCoursesData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const headers = { Authorization: `Bearer ${token}` };

      const [
        profileRes,
        coursesRes,
        classesRes,
        assignmentsRes,
        attendanceRes,
      ] = await Promise.all([
        fetch("/api/profile", { headers }),
        fetch("/api/courses", { headers }),
        fetch("/api/classes", { headers }),
        fetch("/api/assignments?status=pending", { headers }),
        fetch("/api/attendance?summary_only=true", { headers }),
      ]);

      if (
        profileRes.status === 401 ||
        coursesRes.status === 401 ||
        classesRes.status === 401 ||
        assignmentsRes.status === 401 ||
        attendanceRes.status === 401
      ) {
        window.location.href = "/auth";
        return;
      }

      if (
        !coursesRes.ok ||
        !classesRes.ok ||
        !assignmentsRes.ok ||
        !attendanceRes.ok
      ) {
        throw new Error("Failed to fetch courses data");
      }

      const [
        profileData,
        coursesData,
        classesData,
        assignmentsData,
        attendanceData,
      ] = await Promise.all([
        profileRes.json(),
        coursesRes.json(),
        classesRes.json(),
        assignmentsRes.json(),
        attendanceRes.json(),
      ]);

      const activeCourses = (coursesData.courses || []).filter(
        (course: Course) => !course.archived
      );
      setUserProfile(profileData.profile);
      setCourses(activeCourses);
      setClasses(classesData.classes || []);
      setAssignments(assignmentsData.assignments || []);
      setAttendanceSummary(attendanceData.summary || []);
    } catch (err) {
      setError("Failed to load courses data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token");

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCourse),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add course");
      }

      const data = await response.json();
      setCourses((prev) => [data.course, ...prev]);
      setShowAddModal(false);
      setNewCourse({
        course_code: "",
        course_name: "",
        instructor: "",
        credits: 3,
        color: "purple",
      });
    } catch (err) {
      setAlertError(
        err instanceof Error ? err.message : "Failed to add course"
      );
    }
  };

  const handleUpdateCourse = async (courseId: string, updates: any) => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token");

      const response = await fetch("/api/courses", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: courseId, ...updates }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update course");
      }

      const data = await response.json();
      setCourses((prev) =>
        prev.map((course) => (course.id === courseId ? data.course : course))
      );
      setShowEditModal(false);
    } catch (err) {
      setAlertError(
        err instanceof Error ? err.message : "Failed to update course"
      );
    }
  };

  const handleArchiveCourse = async (courseId: string) => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token");

      const response = await fetch("/api/archives", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: courseId,
          reason: "Archived by user",
          notes: "Course archived from the courses page",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to archive course");
      }

      setCourses((prev) => prev.filter((course) => course.id !== courseId));
      setArchiveConfirm(null);
      setAlertSuccess("Course archived successfully");
    } catch (err) {
      setAlertError(
        err instanceof Error ? err.message : "Failed to archive course"
      );
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token");

      const response = await fetch(`/api/courses?id=${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete course");

      setCourses((prev) => prev.filter((course) => course.id !== courseId));
      setDeleteConfirm(null);
    } catch (err) {
      setAlertError("Failed to delete course");
    }
  };

  const stats = calculateStats(
    courses,
    assignments,
    attendanceSummary,
    userProfile
  );
  const filteredCourses = courses.filter(
    (course) =>
      course.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <CoursesSkeleton />;
  if (error) return <ErrorState error={error} onRetry={fetchCoursesData} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Courses</h1>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 cursor-pointer transition-none"
            variant={"outline"}
          >
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <StatsGrid stats={stats} />

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search courses by name, code, or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  attendanceSummary={attendanceSummary}
                  assignments={assignments}
                  classes={classes}
                  userProfile={userProfile}
                  onView={() => {
                    setViewingCourse(course);
                    setShowViewModal(true);
                  }}
                  onEdit={() => {
                    setEditingCourse(course);
                    setShowEditModal(true);
                  }}
                  onArchive={() => setArchiveConfirm(course.id)}
                  onDelete={() => setDeleteConfirm(course.id)}
                />
              ))
            ) : (
              <EmptyState
                onAddCourse={() => setShowAddModal(true)}
                hasSearchQuery={!!searchQuery}
              />
            )}
          </div>

          <Sidebar classes={classes} assignments={assignments} />
        </div>
      </main>

      {showAddModal && (
        <CourseModal
          title="Add New Course"
          course={newCourse}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCourse}
          onChange={setNewCourse}
        />
      )}

      {showEditModal && editingCourse && (
        <CourseModal
          title="Edit Course"
          course={editingCourse}
          onClose={() => setShowEditModal(false)}
          onSubmit={() =>
            handleUpdateCourse(editingCourse.id, {
              course_code: editingCourse.course_code,
              course_name: editingCourse.course_name,
              instructor: editingCourse.instructor,
              credits: editingCourse.credits,
              color: editingCourse.color,
            })
          }
          onChange={setEditingCourse}
        />
      )}

      {showViewModal && viewingCourse && (
        <CourseDetailsModal
          course={viewingCourse}
          attendanceSummary={attendanceSummary}
          assignments={assignments}
          classes={classes}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            setEditingCourse(viewingCourse);
            setShowEditModal(true);
          }}
        />
      )}

      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action will also
              delete all associated classes and attendance records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteCourse(deleteConfirm)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!archiveConfirm}
        onOpenChange={() => setArchiveConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this course? Archived courses can
              be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                archiveConfirm && handleArchiveCourse(archiveConfirm)
              }
              className="bg-purple-600 hover:bg-purple-700"
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {alertError && (
        <AlertMessage
          type="error"
          message={alertError}
          onClose={() => setAlertError(null)}
        />
      )}
      {alertSuccess && (
        <AlertMessage
          type="success"
          message={alertSuccess}
          onClose={() => setAlertSuccess(null)}
        />
      )}
    </div>
  );
}

function calculateStats(
  courses: Course[],
  assignments: Assignment[],
  attendanceSummary: AttendanceSummary[],
  profile: UserProfile | null
) {
  const activeCourses = courses.length;
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const pendingAssignments = assignments.length;

  const totalClasses = attendanceSummary.reduce(
    (sum, course) => sum + course.total_classes,
    0
  );
  const attendedClasses = attendanceSummary.reduce(
    (sum, course) => sum + course.present + course.late,
    0
  );
  const avgAttendance =
    totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

  const attendanceThreshold = profile?.min_attendance_percentage || 75;

  return [
    {
      title: "Active Courses",
      value: activeCourses.toString(),
      icon: BookOpen,
      trend: "This semester",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Total Credits",
      value: totalCredits.toString(),
      icon: TrendingUp,
      trend: "Current load",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Pending Tasks",
      value: pendingAssignments.toString(),
      icon: CheckSquare,
      trend: "Across all courses",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Avg Attendance",
      value: `${avgAttendance}%`,
      icon: TrendingUp,
      trend:
        avgAttendance >= attendanceThreshold ? "On track" : "Needs improvement",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
  ];
}

function getColorClass(color: string) {
  const colorMap: { [key: string]: string } = {
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    indigo: "bg-indigo-500",
    pink: "bg-pink-500",
    orange: "bg-orange-500",
  };
  return colorMap[color] || "bg-purple-500";
}

function getAttendanceBadge(attendance: number, threshold: number) {
  if (attendance >= threshold + 15)
    return <Badge variant="default">Excellent</Badge>;
  if (attendance >= threshold) return <Badge variant="secondary">Good</Badge>;
  return (
    <Badge variant="destructive" className="text-white dark:text-white">
      At Risk
    </Badge>
  );
}

function formatTime(timeString: string) {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function getCourseAttendance(
  courseCode: string,
  attendanceSummary: AttendanceSummary[]
) {
  return (
    attendanceSummary.find((a) => a.course_code === courseCode) || {
      attendance_percentage: 0,
      total_classes: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    }
  );
}

function getCourseAssignments(courseId: string, assignments: Assignment[]) {
  return assignments.filter((assignment) => assignment.course_id === courseId);
}

function getCourseClasses(courseCode: string, classes: Class[]) {
  return classes.filter((cls) => cls.courses.course_code === courseCode);
}

function getNextClassForCourse(courseCode: string, classes: Class[]) {
  const today = new Date();
  const dayOfWeek = today.getDay();

  const courseClasses = classes
    .filter(
      (cls) =>
        cls.courses.course_code === courseCode && cls.day_of_week >= dayOfWeek
    )
    .sort((a, b) => {
      if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
      return a.start_time.localeCompare(b.start_time);
    });

  if (courseClasses.length === 0) return "No upcoming classes";

  const nextClass = courseClasses[0];
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = days[nextClass.day_of_week];

  return `${dayName} ${formatTime(nextClass.start_time)}`;
}

function getUpcomingClasses(classes: Class[]) {
  const today = new Date();
  const dayOfWeek = today.getDay();

  return classes
    .filter((cls) => cls.day_of_week === dayOfWeek)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .slice(0, 3)
    .map((cls) => {
      const startTime = new Date(`1970-01-01T${cls.start_time}`);
      const now = new Date();
      const classTime = new Date();
      classTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

      const timeDiff = classTime.getTime() - now.getTime();
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesDiff = Math.floor(
        (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
      );

      let timeUntil = "";
      if (hoursDiff > 0) timeUntil = `in ${hoursDiff}h ${minutesDiff}m`;
      else if (minutesDiff > 0) timeUntil = `in ${minutesDiff} minutes`;
      else timeUntil = "Now";

      return {
        course: cls.courses.course_code,
        time: `${formatTime(cls.start_time)} - ${formatTime(cls.end_time)}`,
        room: cls.room || "TBA",
        type: cls.class_type.charAt(0).toUpperCase() + cls.class_type.slice(1),
        in: timeUntil,
      };
    });
}

function calculateQuickStats(classes: Class[], assignments: Assignment[]) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const classesThisWeek = classes.filter(
    (cls) => cls.day_of_week === dayOfWeek
  ).length;

  const weekFromNow = new Date();
  weekFromNow.setDate(today.getDate() + 7);
  const assignmentsDueThisWeek = assignments.filter((assignment) => {
    const dueDate = new Date(assignment.due_date);
    return dueDate <= weekFromNow;
  }).length;

  return {
    classesThisWeek,
    assignmentsDue: assignmentsDueThisWeek,
    studyHours: Math.round(classesThisWeek * 1.5),
  };
}

// Extracted Components

function StatsGrid({ stats }: { stats: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </p>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.trend}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CourseCard({
  course,
  attendanceSummary,
  assignments,
  classes,
  userProfile,
  onView,
  onEdit,
  onArchive,
  onDelete,
}: {
  course: Course;
  attendanceSummary: AttendanceSummary[];
  assignments: Assignment[];
  classes: Class[];
  userProfile: UserProfile | null;
  onView: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const attendance = getCourseAttendance(course.course_code, attendanceSummary);
  const courseAssignments = getCourseAssignments(course.id, assignments);
  const nextClass = getNextClassForCourse(course.course_code, classes);
  const threshold = userProfile?.min_attendance_percentage || 75;

  return (
    <div
      className="rounded-xl border border-border bg-card p-6 hover:bg-accent/50 cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${getColorClass(course.color)}`}>
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{course.course_name}</h3>
            <p className="text-sm text-muted-foreground">
              {course.course_code} • {course.credits} Credits
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="cursor-pointer" onClick={onView}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Course
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={onArchive}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-lg bg-accent">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Instructor</span>
          </div>
          <p className="text-sm font-medium">
            {course.instructor || "Not assigned"}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-accent">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Next Class</span>
          </div>
          <p className="text-sm font-medium">{nextClass}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Attendance</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {attendance.attendance_percentage}%
            </span>
            {getAttendanceBadge(attendance.attendance_percentage, threshold)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Performance</span>
            <span className="font-medium">
              {attendance.attendance_percentage}%
            </span>
          </div>
          <Progress value={attendance.attendance_percentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {courseAssignments.length} pending
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {attendance.total_classes} classes
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            onClick={onView}
          >
            View Details →
          </Button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  classes,
  assignments,
}: {
  classes: Class[];
  assignments: Assignment[];
}) {
  const upcomingClasses = getUpcomingClasses(classes);
  const quickStats = calculateQuickStats(classes, assignments);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingClasses.length > 0 ? (
            upcomingClasses.map((cls, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-border bg-accent"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">{cls.course}</h3>
                  <Badge variant="secondary">{cls.type}</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{cls.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{cls.room}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border text-xs font-medium text-purple-600 dark:text-purple-400">
                  Starts {cls.in}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No classes today</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-accent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Classes Today
              </span>
              <span className="font-semibold">
                {quickStats.classesThisWeek}
              </span>
            </div>
            <Progress
              value={
                (quickStats.classesThisWeek / Math.max(classes.length, 1)) * 100
              }
              className="h-2"
            />
          </div>

          <div className="p-4 rounded-lg bg-accent">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Assignments Due
              </span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {quickStats.assignmentsDue}
              </span>
            </div>
            <p className="text-xs mt-1 text-muted-foreground">This week</p>
          </div>

          <div className="p-4 rounded-lg bg-accent">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Recommended Study
              </span>
              <span className="font-semibold">{quickStats.studyHours}h</span>
            </div>
            <p className="text-xs mt-1 text-muted-foreground">This week</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({
  onAddCourse,
  hasSearchQuery,
}: {
  onAddCourse: () => void;
  hasSearchQuery: boolean;
}) {
  return (
    <div className="text-center py-12">
      <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
      <h3 className="text-lg font-medium mb-2">No courses found</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {hasSearchQuery
          ? "Try adjusting your search terms"
          : "Get started by adding your first course"}
      </p>
      <Button onClick={onAddCourse} className="px-4 py-2 cursor-pointer">
        Add Your First Course
      </Button>
    </div>
  );
}

function CourseModal({
  title,
  course,
  onClose,
  onSubmit,
  onChange,
}: {
  title: string;
  course: any;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (course: any) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="cursor-pointer"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label className="mb-2">Course Code</Label>
              <Input
                type="text"
                required
                value={course.course_code}
                onChange={(e) =>
                  onChange({ ...course, course_code: e.target.value })
                }
                placeholder="e.g., CS 301"
              />
            </div>
            <div>
              <Label className="mb-2">Course Name</Label>
              <Input
                type="text"
                required
                value={course.course_name}
                onChange={(e) =>
                  onChange({ ...course, course_name: e.target.value })
                }
                placeholder="e.g., Data Structures & Algorithms"
              />
            </div>
            <div>
              <Label className="mb-2">Instructor</Label>
              <Input
                type="text"
                value={course.instructor}
                onChange={(e) =>
                  onChange({ ...course, instructor: e.target.value })
                }
                placeholder="e.g., Dr. Sarah Johnson"
              />
            </div>
            <div>
              <Label className="mb-2">Credits</Label>
              <Select
                value={course.credits.toString()}
                onValueChange={(value) =>
                  onChange({ ...course, credits: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((credit) => (
                    <SelectItem key={credit} value={credit.toString()}>
                      {credit} credit{credit !== 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2">Color</Label>
              <Select
                value={course.color}
                onValueChange={(value) => onChange({ ...course, color: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="indigo">Indigo</SelectItem>
                  <SelectItem value="pink">Pink</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button className="flex-1 cursor-pointer" onClick={onSubmit}>
            {title.includes("Add") ? "Add Course" : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function CourseDetailsModal({
  course,
  attendanceSummary,
  assignments,
  classes,
  onClose,
  onEdit,
}: {
  course: Course;
  attendanceSummary: AttendanceSummary[];
  assignments: Assignment[];
  classes: Class[];
  onClose: () => void;
  onEdit: () => void;
}) {
  const attendance = getCourseAttendance(course.course_code, attendanceSummary);
  const courseAssignments = getCourseAssignments(course.id, assignments);
  const courseClasses = getCourseClasses(course.course_code, classes);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Course Details</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="cursor-pointer"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-lg ${getColorClass(course.color)}`}>
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">{course.course_name}</h3>
              <p className="text-lg text-muted-foreground">
                {course.course_code}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {course.credits} Credits •{" "}
                {course.instructor || "No instructor assigned"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-accent text-center">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">
                {attendance.attendance_percentage}%
              </p>
              <p className="text-sm text-muted-foreground">Attendance</p>
            </div>
            <div className="p-4 rounded-lg bg-accent text-center">
              <CheckSquare className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">{courseAssignments.length}</p>
              <p className="text-sm text-muted-foreground">Pending Tasks</p>
            </div>
            <div className="p-4 rounded-lg bg-accent text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">{courseClasses.length}</p>
              <p className="text-sm text-muted-foreground">Weekly Classes</p>
            </div>
            <div className="p-4 rounded-lg bg-accent text-center">
              <FileText className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">{attendance.total_classes}</p>
              <p className="text-sm text-muted-foreground">Total Classes</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Attendance Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-500/10">
                <p className="text-2xl font-bold text-green-600">
                  {attendance.present}
                </p>
                <p className="text-sm text-muted-foreground">Present</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-500/10">
                <p className="text-2xl font-bold text-red-600">
                  {attendance.absent}
                </p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-500/10">
                <p className="text-2xl font-bold text-yellow-600">
                  {attendance.late}
                </p>
                <p className="text-sm text-muted-foreground">Late</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-500/10">
                <p className="text-2xl font-bold text-blue-600">
                  {attendance.excused}
                </p>
                <p className="text-sm text-muted-foreground">Excused</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Class Schedule</h4>
            <div className="space-y-2">
              {courseClasses.length > 0 ? (
                courseClasses.map((cls, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-accent"
                  >
                    <div>
                      <p className="font-medium">
                        {
                          [
                            "Sunday",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                          ][cls.day_of_week]
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(cls.start_time)} -{" "}
                        {formatTime(cls.end_time)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{cls.class_type}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {cls.room}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No classes scheduled
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={onClose}
          >
            Close
          </Button>
          <Button className="flex-1 cursor-pointer" onClick={onEdit}>
            Edit Course
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function AlertMessage({
  type,
  message,
  onClose,
}: {
  type: "error" | "success";
  message: string;
  onClose: () => void;
}) {
  const isError = type === "error";
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm transform transition-all duration-300 ease-out animate-in slide-in-from-right-full">
      <Card
        className={`border-${
          isError ? "destructive" : "green-200 dark:border-green-800"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {isError ? (
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  isError
                    ? "text-destructive"
                    : "text-green-900 dark:text-green-400"
                }`}
              >
                {isError ? "Error" : "Success"}
              </p>
              <p
                className={`text-sm ${
                  isError
                    ? "text-muted-foreground"
                    : "text-green-700 dark:text-green-300"
                }`}
              >
                {message}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={`h-6 w-6 p-0 cursor-pointer flex-shrink-0 ${
                isError ? "" : "text-green-600 hover:text-green-800"
              }`}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CoursesSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <Skeleton className="w-8 h-8 rounded" />
          <div className="flex-1">
            <Skeleton className="h-6 w-32 rounded" />
          </div>
          <Skeleton className="h-9 w-32 rounded" />
        </div>
      </header>
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-8 w-16 rounded" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-48 rounded" />
                      <Skeleton className="h-4 w-32 rounded" />
                    </div>
                  </div>
                  <Skeleton className="w-8 h-8 rounded" />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Skeleton className="h-16 rounded-lg" />
                  <Skeleton className="h-16 rounded-lg" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-2 w-full rounded" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
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
            <h1 className="text-xl font-semibold">Courses</h1>
          </div>
        </div>
      </header>
      <main className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Failed to load data</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
