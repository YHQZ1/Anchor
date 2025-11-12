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
  X,
  FileText,
  BarChart3,
} from "lucide-react";
import { SidebarTrigger, MobileSidebarTrigger } from "@/components/Sidebar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
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

export default function Courses() {
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
      toast.success("Course added successfully", {
        description: `${data.course.course_code} has been added to your courses`,
      });
    } catch (err) {
      toast.error("Failed to add course", {
        description: err instanceof Error ? err.message : "Please try again",
      });
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
      toast.success("Course updated successfully", {
        description: "Your changes have been saved",
      });
    } catch (err) {
      toast.error("Failed to update course", {
        description: err instanceof Error ? err.message : "Please try again",
      });
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
      toast.success("Course archived successfully", {
        description: "The course has been moved to archives",
      });
    } catch (err) {
      toast.error("Failed to archive course", {
        description: err instanceof Error ? err.message : "Please try again",
      });
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
      toast.success("Course deleted successfully", {
        description: "The course and its associated data have been removed",
      });
    } catch (err) {
      toast.error("Failed to delete course", {
        description: "Please try again",
      });
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
        <div className="flex h-14 items-center gap-3 px-4">
          <div className="lg:hidden">
            <MobileSidebarTrigger />
          </div>
          <div className="hidden lg:block">
            <SidebarTrigger />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Courses</h1>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 cursor-pointer text-xs h-8 px-2"
            variant={"outline"}
          >
            <Plus className="h-3 w-3" />
            <span className="hidden xs:inline">Add Course</span>
          </Button>
        </div>
      </header>

      <main className="p-3 space-y-4">
        <StatsGrid stats={stats} />

        {/* Search Bar */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input bg-background">
          <Search className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-xs"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-3">
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

          {/* Sidebar */}
          <div className="space-y-4">
            <Sidebar classes={classes} assignments={assignments} />
          </div>
        </div>
      </main>

      {/* Modals */}
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

      {/* Alert Dialogs */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md mx-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">
              Delete Course
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete this course? This action will also
              delete all associated classes and attendance records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteCourse(deleteConfirm)}
              className="bg-destructive hover:bg-destructive/90 text-xs h-9"
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
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md mx-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">
              Archive Course
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to archive this course? Archived courses can
              be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                archiveConfirm && handleArchiveCourse(archiveConfirm)
              }
              className="bg-purple-600 hover:bg-purple-700 text-xs h-9"
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper Functions

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
    return (
      <Badge variant="default" className="text-[10px]">
        Excellent
      </Badge>
    );
  if (attendance >= threshold)
    return (
      <Badge variant="secondary" className="text-[10px]">
        Good
      </Badge>
    );
  return (
    <Badge
      variant="destructive"
      className="text-white dark:text-white text-[10px]"
    >
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
      className="rounded-lg border border-border bg-card p-3 hover:bg-accent/50 cursor-pointer transition-none"
      onClick={onView}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div
            className={`p-2 rounded-md ${getColorClass(
              course.color
            )} flex-shrink-0`}
          >
            <BookOpen className="h-3 w-3 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 truncate">
              {course.course_name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {course.course_code} • {course.credits} Credits
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              className="h-6 w-6 p-0 cursor-pointer flex-shrink-0"
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              className="cursor-pointer text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
            >
              <Eye className="h-3 w-3 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-3 w-3 mr-2" />
              Edit Course
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onArchive();
              }}
            >
              <Archive className="h-3 w-3 mr-2" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3 w-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="p-2 rounded-md bg-accent">
          <div className="flex items-center gap-1 mb-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              Instructor
            </span>
          </div>
          <p className="text-xs font-medium truncate">
            {course.instructor || "Not assigned"}
          </p>
        </div>

        <div className="p-2 rounded-md bg-accent">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              Next Class
            </span>
          </div>
          <p className="text-xs font-medium truncate">{nextClass}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Attendance</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold">
              {attendance.attendance_percentage}%
            </span>
            {getAttendanceBadge(attendance.attendance_percentage, threshold)}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Performance</span>
            <span className="font-medium">
              {attendance.attendance_percentage}%
            </span>
          </div>
          <Progress value={attendance.attendance_percentage} className="h-1" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <CheckSquare className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {courseAssignments.length} pending
              </span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {attendance.total_classes} classes
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 h-6 px-2"
            onClick={onView}
          >
            View →
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
    <div className="space-y-4">
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-base">Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          {upcomingClasses.length > 0 ? (
            upcomingClasses.map((cls, index) => (
              <div
                key={index}
                className="p-2 rounded border border-border bg-accent"
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium text-xs">{cls.course}</h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {cls.type}
                  </Badge>
                </div>
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{cls.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span className="truncate">{cls.room}</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-border text-[10px] font-medium text-purple-600 dark:text-purple-400">
                  Starts {cls.in}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Calendar className="h-5 w-5 mx-auto mb-1 opacity-50" />
              <p className="text-xs">No classes today</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-base">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          <div className="p-2 rounded bg-accent">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                Classes Today
              </span>
              <span className="font-semibold text-sm">
                {quickStats.classesThisWeek}
              </span>
            </div>
            <Progress
              value={
                (quickStats.classesThisWeek / Math.max(classes.length, 1)) * 100
              }
              className="h-1"
            />
          </div>

          <div className="p-2 rounded bg-accent">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Assignments Due
              </span>
              <span className="font-semibold text-sm text-purple-600 dark:text-purple-400">
                {quickStats.assignmentsDue}
              </span>
            </div>
            <p className="text-[10px] mt-0.5 text-muted-foreground">
              This week
            </p>
          </div>

          <div className="p-2 rounded bg-accent">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Recommended Study
              </span>
              <span className="font-semibold text-sm">
                {quickStats.studyHours}h
              </span>
            </div>
            <p className="text-[10px] mt-0.5 text-muted-foreground">
              This week
            </p>
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
    <div className="text-center py-6">
      <BookOpen className="h-6 w-6 mx-auto mb-2 text-muted-foreground opacity-50" />
      <h3 className="text-sm font-medium mb-1">No courses found</h3>
      <p className="text-xs text-muted-foreground mb-3">
        {hasSearchQuery
          ? "Try adjusting your search terms"
          : "Get started by adding your first course"}
      </p>
      <Button onClick={onAddCourse} className="cursor-pointer text-xs h-8">
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="cursor-pointer h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <Label className="mb-2 text-xs">Course Code</Label>
              <Input
                type="text"
                required
                value={course.course_code}
                onChange={(e) =>
                  onChange({ ...course, course_code: e.target.value })
                }
                placeholder="e.g., CS 301"
                className="text-xs"
              />
            </div>
            <div>
              <Label className="mb-2 text-xs">Course Name</Label>
              <Input
                type="text"
                required
                value={course.course_name}
                onChange={(e) =>
                  onChange({ ...course, course_name: e.target.value })
                }
                placeholder="e.g., Data Structures & Algorithms"
                className="text-xs"
              />
            </div>
            <div>
              <Label className="mb-2 text-xs">Instructor</Label>
              <Input
                type="text"
                value={course.instructor}
                onChange={(e) =>
                  onChange({ ...course, instructor: e.target.value })
                }
                placeholder="e.g., Dr. Sarah Johnson"
                className="text-xs"
              />
            </div>
            <div>
              <Label className="mb-2 text-xs">Credits</Label>
              <Select
                value={course.credits.toString()}
                onValueChange={(value) =>
                  onChange({ ...course, credits: parseInt(value) })
                }
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((credit) => (
                    <SelectItem
                      key={credit}
                      value={credit.toString()}
                      className="text-xs"
                    >
                      {credit} credit{credit !== 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 text-xs">Color</Label>
              <Select
                value={course.color}
                onValueChange={(value) => onChange({ ...course, color: value })}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purple" className="text-xs">
                    Purple
                  </SelectItem>
                  <SelectItem value="blue" className="text-xs">
                    Blue
                  </SelectItem>
                  <SelectItem value="green" className="text-xs">
                    Green
                  </SelectItem>
                  <SelectItem value="yellow" className="text-xs">
                    Yellow
                  </SelectItem>
                  <SelectItem value="red" className="text-xs">
                    Red
                  </SelectItem>
                  <SelectItem value="indigo" className="text-xs">
                    Indigo
                  </SelectItem>
                  <SelectItem value="pink" className="text-xs">
                    Pink
                  </SelectItem>
                  <SelectItem value="orange" className="text-xs">
                    Orange
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 cursor-pointer text-xs h-9"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 cursor-pointer text-xs h-9"
            onClick={onSubmit}
          >
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Course Details</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="cursor-pointer h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-lg ${getColorClass(course.color)}`}>
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold mb-1 truncate">
                {course.course_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {course.course_code}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {course.credits} Credits •{" "}
                {course.instructor || "No instructor assigned"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-accent text-center">
              <BarChart3 className="h-4 w-4 mx-auto mb-1 text-purple-600" />
              <p className="text-lg font-bold">
                {attendance.attendance_percentage}%
              </p>
              <p className="text-xs text-muted-foreground">Attendance</p>
            </div>
            <div className="p-2 rounded bg-accent text-center">
              <CheckSquare className="h-4 w-4 mx-auto mb-1 text-purple-600" />
              <p className="text-lg font-bold">{courseAssignments.length}</p>
              <p className="text-xs text-muted-foreground">Pending Tasks</p>
            </div>
            <div className="p-2 rounded bg-accent text-center">
              <Calendar className="h-4 w-4 mx-auto mb-1 text-purple-600" />
              <p className="text-lg font-bold">{courseClasses.length}</p>
              <p className="text-xs text-muted-foreground">Weekly Classes</p>
            </div>
            <div className="p-2 rounded bg-accent text-center">
              <FileText className="h-4 w-4 mx-auto mb-1 text-purple-600" />
              <p className="text-lg font-bold">{attendance.total_classes}</p>
              <p className="text-xs text-muted-foreground">Total Classes</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-sm">Attendance Breakdown</h4>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded bg-green-100 dark:bg-green-500/10">
                <p className="text-base font-bold text-green-600">
                  {attendance.present}
                </p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div className="p-2 rounded bg-red-100 dark:bg-red-500/10">
                <p className="text-base font-bold text-red-600">
                  {attendance.absent}
                </p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
              <div className="p-2 rounded bg-yellow-100 dark:bg-yellow-500/10">
                <p className="text-base font-bold text-yellow-600">
                  {attendance.late}
                </p>
                <p className="text-xs text-muted-foreground">Late</p>
              </div>
              <div className="p-2 rounded bg-blue-100 dark:bg-blue-500/10">
                <p className="text-base font-bold text-blue-600">
                  {attendance.excused}
                </p>
                <p className="text-xs text-muted-foreground">Excused</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-sm">Class Schedule</h4>
            <div className="space-y-2">
              {courseClasses.length > 0 ? (
                courseClasses.map((cls, index) => (
                  <div
                    key={index}
                    className="flex flex-col p-2 rounded bg-accent gap-1"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-xs">
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
                      <p className="text-xs text-muted-foreground">
                        {formatTime(cls.start_time)} -{" "}
                        {formatTime(cls.end_time)}
                      </p>
                    </div>
                    <div className="text-left">
                      <Badge variant="secondary" className="text-[10px]">
                        {cls.class_type}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cls.room}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-3 text-xs">
                  No classes scheduled
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 cursor-pointer text-xs h-9"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            className="flex-1 cursor-pointer text-xs h-9"
            onClick={onEdit}
          >
            Edit Course
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function CoursesSkeleton() {
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
          <Skeleton className="h-8 w-16 rounded" />
        </div>
      </header>
      <main className="p-3 space-y-4">
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
        <Skeleton className="h-9 w-full rounded" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    <Skeleton className="w-8 h-8 rounded-md" />
                    <div className="flex-1 space-y-1 min-w-0">
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                    </div>
                  </div>
                  <Skeleton className="w-6 h-6 rounded" />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Skeleton className="h-10 rounded" />
                  <Skeleton className="h-10 rounded" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-1 w-full rounded" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
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
            <h1 className="text-lg font-semibold">Courses</h1>
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
