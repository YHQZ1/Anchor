/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SidebarTrigger, MobileSidebarTrigger } from "@/components/Sidebar";
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
  color: string;
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

export default function Classes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [viewingClass, setViewingClass] = useState<Class | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const [newClass, setNewClass] = useState({
    course_id: "",
    day_of_week: 1,
    start_time: "09:00",
    end_time: "10:00",
    room: "",
    class_type: "lecture",
  });

  useEffect(() => {
    fetchClassesData();
  }, []);

  const fetchClassesData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const headers = { Authorization: `Bearer ${token}` };

      const [classesRes, coursesRes] = await Promise.all([
        fetch("/api/classes", { headers }),
        fetch("/api/courses", { headers }),
      ]);

      if (classesRes.status === 401 || coursesRes.status === 401) {
        window.location.href = "/auth";
        return;
      }

      if (!classesRes.ok || !coursesRes.ok) {
        throw new Error("Failed to fetch classes data");
      }

      const [classesData, coursesData] = await Promise.all([
        classesRes.json(),
        coursesRes.json(),
      ]);

      setClasses(classesData.classes || []);
      setCourses(coursesData.courses || []);
    } catch (err) {
      setError("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token");

      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newClass),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add class");
      }

      const data = await response.json();
      setClasses((prev) => [data.class, ...prev]);
      setShowAddModal(false);
      setNewClass({
        course_id: "",
        day_of_week: 1,
        start_time: "09:00",
        end_time: "10:00",
        room: "",
        class_type: "lecture",
      });
      toast.success("Class added successfully");
    } catch (err) {
      toast.error("Failed to add class", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    }
  };

  const handleUpdateClass = async (classId: string, updates: any) => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token");

      const response = await fetch("/api/classes", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: classId, ...updates }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update class");
      }

      const data = await response.json();
      setClasses((prev) =>
        prev.map((cls) => (cls.id === classId ? data.class : cls))
      );
      setShowEditModal(false);
      toast.success("Class updated successfully");
    } catch (err) {
      toast.error("Failed to update class", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token");

      const response = await fetch(`/api/classes?id=${classId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete class");

      setClasses((prev) => prev.filter((cls) => cls.id !== classId));
      setDeleteConfirm(null);
      toast.success("Class deleted successfully");
    } catch (err) {
      toast.error("Failed to delete class");
    }
  };

  const stats = calculateStats(classes);
  const filteredClasses = classes.filter(
    (cls) =>
      cls.courses.course_code
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      cls.courses.course_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      cls.room?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayClasses = getTodayClasses(classes);
  const weeklySchedule = getWeeklySchedule(classes, currentWeek);

  if (loading) return <ClassesSkeleton />;
  if (error) return <ErrorState error={error} onRetry={fetchClassesData} />;

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
            <h1 className="text-lg font-semibold">Classes</h1>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 cursor-pointer text-xs h-8 px-2"
            variant={"outline"}
          >
            <Plus className="h-3 w-3" />
            <span className="hidden xs:inline">Add Class</span>
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
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-xs"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-4">
            <WeeklySchedule
              weeklySchedule={weeklySchedule}
              currentWeek={currentWeek}
              onWeekChange={setCurrentWeek}
            />

            <div>
              <h2 className="text-lg font-semibold mb-3">All Classes</h2>
              <div className="space-y-3">
                {filteredClasses.length > 0 ? (
                  filteredClasses.map((cls) => (
                    <ClassCard
                      key={cls.id}
                      classItem={cls}
                      onView={() => {
                        setViewingClass(cls);
                        setShowViewModal(true);
                      }}
                      onEdit={() => {
                        setEditingClass(cls);
                        setShowEditModal(true);
                      }}
                      onDelete={() => setDeleteConfirm(cls.id)}
                    />
                  ))
                ) : (
                  <EmptyState
                    onAddClass={() => setShowAddModal(true)}
                    hasSearchQuery={!!searchQuery}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Sidebar todayClasses={todayClasses} classes={classes} />
          </div>
        </div>
      </main>

      {/* Modals */}
      {showAddModal && (
        <ClassModal
          title="Add New Class"
          classItem={newClass}
          courses={courses}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddClass}
          onChange={setNewClass}
        />
      )}

      {showEditModal && editingClass && (
        <ClassModal
          title="Edit Class"
          classItem={editingClass}
          courses={courses}
          onClose={() => setShowEditModal(false)}
          onSubmit={() =>
            handleUpdateClass(editingClass.id, {
              course_id: editingClass.course_id,
              day_of_week: editingClass.day_of_week,
              start_time: editingClass.start_time,
              end_time: editingClass.end_time,
              room: editingClass.room,
              class_type: editingClass.class_type,
            })
          }
          onChange={setEditingClass}
        />
      )}

      {showViewModal && viewingClass && (
        <ClassDetailsModal
          classItem={viewingClass}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            setEditingClass(viewingClass);
            setShowEditModal(true);
          }}
        />
      )}

      {/* Alert Dialog */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md mx-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm sm:text-base">
              Delete Class
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Are you sure you want to delete this class? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs cursor-pointer sm:text-sm h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteClass(deleteConfirm)}
              className="bg-destructive cursor-pointer hover:bg-destructive/90 text-xs sm:text-sm h-9"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function calculateStats(classes: Class[]) {
  const totalClasses = classes.length;
  const uniqueCourses = new Set(classes.map((cls) => cls.course_id)).size;

  const today = new Date().getDay();
  const classesToday = classes.filter(
    (cls) => cls.day_of_week === today
  ).length;

  const classTypes = classes.reduce((acc, cls) => {
    acc[cls.class_type] = (acc[cls.class_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonType =
    Object.entries(classTypes).sort(([, a], [, b]) => b - a)[0]?.[0] || "None";

  return [
    {
      title: "Total Classes",
      value: totalClasses.toString(),
      icon: Calendar,
      trend: "This semester",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Courses",
      value: uniqueCourses.toString(),
      icon: BookOpen,
      trend: "With classes",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Today's Classes",
      value: classesToday.toString(),
      icon: Clock,
      trend: "Scheduled today",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Most Common",
      value: mostCommonType,
      icon: Users,
      trend: "Class type",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
  ];
}

function getTodayClasses(classes: Class[]) {
  const today = new Date().getDay();
  return classes
    .filter((cls) => cls.day_of_week === today)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
}

function getWeeklySchedule(classes: Class[], weekStart: Date) {
  const days = [];
  const startOfWeek = new Date(weekStart);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);

    const dayClasses = classes
      .filter((cls) => cls.day_of_week === day.getDay())
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    days.push({
      date: new Date(day),
      dayName: day.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: day.getDate(),
      classes: dayClasses,
    });
  }

  return days;
}

function formatTime(timeString: string) {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function getDayName(dayNumber: number) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayNumber];
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

function ClassCard({
  classItem,
  onView,
  onEdit,
  onDelete,
}: {
  classItem: Class;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="rounded-lg border border-border bg-card p-3 hover:bg-accent/50 cursor-pointer transition-none"
      onClick={onView}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div
            className={`p-2 rounded-md ${getColorClass(
              classItem.courses.color
            )} flex-shrink-0`}
          >
            <BookOpen className="h-3 w-3 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 truncate">
              {classItem.courses.course_name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {classItem.courses.course_code} •{" "}
              {getDayName(classItem.day_of_week)}
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
              Edit Class
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Time</span>
          </div>
          <p className="text-xs font-medium">
            {formatTime(classItem.start_time)} -{" "}
            {formatTime(classItem.end_time)}
          </p>
        </div>

        <div className="p-2 rounded-md bg-accent">
          <div className="flex items-center gap-1 mb-1">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Location</span>
          </div>
          <p className="text-xs font-medium truncate">
            {classItem.room || "TBA"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Badge variant="secondary" className="text-[10px] capitalize">
          {classItem.class_type}
        </Badge>
        <Button
          variant="ghost"
          className="text-xs cursor-pointer font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 h-6 px-2"
          onClick={onView}
        >
          View →
        </Button>
      </div>
    </div>
  );
}

function WeeklySchedule({
  weeklySchedule,
  currentWeek,
  onWeekChange,
}: {
  weeklySchedule: any[];
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
}) {
  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    onWeekChange(newDate);
  };

  const today = new Date();
  const isToday = (date: Date) => date.toDateString() === today.toDateString();

  return (
    <Card>
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Weekly Schedule</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("prev")}
              className="h-7 w-7 p-0 cursor-pointer"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("next")}
              className="h-7 w-7 p-0 cursor-pointer"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-7 gap-1 mb-3">
          {weeklySchedule.map((day, index) => (
            <div
              key={index}
              className={`p-1.5 rounded text-center ${
                isToday(day.date)
                  ? "bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20"
                  : "bg-accent"
              }`}
            >
              <div className="text-[10px] font-medium text-muted-foreground">
                {day.dayName}
              </div>
              <div
                className={`text-sm font-bold ${
                  isToday(day.date)
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-foreground"
                }`}
              >
                {day.dayNumber}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {day.classes.length}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {weeklySchedule.map((day) =>
            day.classes.map((cls: Class) => (
              <div
                key={cls.id}
                className="flex items-center justify-between p-2 rounded border border-border bg-card"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full ${getColorClass(
                      cls.courses.color
                    )} flex-shrink-0`}
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-xs truncate">
                      {cls.courses.course_code}
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <Badge
                    variant="secondary"
                    className="text-[10px] mb-0.5 capitalize"
                  >
                    {cls.class_type}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[60px]">
                    {cls.room}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Sidebar({
  todayClasses,
  classes,
}: {
  todayClasses: Class[];
  classes: Class[];
}) {
  const quickStats = {
    totalHours: Math.round(classes.length * 1.5),
    differentRooms: new Set(classes.map((cls) => cls.room)).size,
    earliestClass:
      classes.length > 0
        ? formatTime(
            classes.sort((a, b) => a.start_time.localeCompare(b.start_time))[0]
              .start_time
          )
        : "N/A",
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-base">Today's Classes</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          {todayClasses.length > 0 ? (
            todayClasses.map((cls, index) => (
              <div
                key={index}
                className="p-2 rounded border border-border bg-accent"
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium text-xs">
                    {cls.courses.course_code}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {cls.class_type}
                  </Badge>
                </div>
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{cls.room || "TBA"}</span>
                  </div>
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
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Weekly Hours
              </span>
              <span className="font-semibold text-sm">
                {quickStats.totalHours}h
              </span>
            </div>
            <p className="text-[10px] mt-0.5 text-muted-foreground">
              Estimated
            </p>
          </div>

          <div className="p-2 rounded bg-accent">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Different Rooms
              </span>
              <span className="font-semibold text-sm text-purple-600 dark:text-purple-400">
                {quickStats.differentRooms}
              </span>
            </div>
            <p className="text-[10px] mt-0.5 text-muted-foreground">
              This semester
            </p>
          </div>

          <div className="p-2 rounded bg-accent">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Earliest Class
              </span>
              <span className="font-semibold text-sm">
                {quickStats.earliestClass}
              </span>
            </div>
            <p className="text-[10px] mt-0.5 text-muted-foreground">
              Start time
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({
  onAddClass,
  hasSearchQuery,
}: {
  onAddClass: () => void;
  hasSearchQuery: boolean;
}) {
  return (
    <div className="text-center py-6">
      <Calendar className="h-6 w-6 mx-auto mb-2 text-muted-foreground opacity-50" />
      <h3 className="text-sm font-medium mb-1">No classes found</h3>
      <p className="text-xs text-muted-foreground mb-3">
        {hasSearchQuery
          ? "Try adjusting your search terms"
          : "Get started by adding your first class"}
      </p>
      <Button onClick={onAddClass} className="cursor-pointer text-xs h-8">
        Add Your First Class
      </Button>
    </div>
  );
}

function ClassModal({
  title,
  classItem,
  courses,
  onClose,
  onSubmit,
  onChange,
}: {
  title: string;
  classItem: any;
  courses: Course[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (classItem: any) => void;
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
              <Label className="mb-2 text-xs">Course *</Label>
              <Select
                value={classItem.course_id}
                onValueChange={(value) =>
                  onChange({ ...classItem, course_id: value })
                }
                required
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem
                      key={course.id}
                      value={course.id}
                      className="text-xs"
                    >
                      {course.course_code} - {course.course_name}
                    </SelectItem>
                  ))}
                  {courses.length === 0 && (
                    <SelectItem value="no-courses" disabled className="text-xs">
                      No courses available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 text-xs">Day of Week *</Label>
              <Select
                value={classItem.day_of_week.toString()}
                onValueChange={(value) =>
                  onChange({ ...classItem, day_of_week: parseInt(value) })
                }
                required
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0" className="text-xs">
                    Sunday
                  </SelectItem>
                  <SelectItem value="1" className="text-xs">
                    Monday
                  </SelectItem>
                  <SelectItem value="2" className="text-xs">
                    Tuesday
                  </SelectItem>
                  <SelectItem value="3" className="text-xs">
                    Wednesday
                  </SelectItem>
                  <SelectItem value="4" className="text-xs">
                    Thursday
                  </SelectItem>
                  <SelectItem value="5" className="text-xs">
                    Friday
                  </SelectItem>
                  <SelectItem value="6" className="text-xs">
                    Saturday
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="mb-2 text-xs">Start Time *</Label>
                <Input
                  type="time"
                  required
                  value={classItem.start_time}
                  onChange={(e) =>
                    onChange({ ...classItem, start_time: e.target.value })
                  }
                  className="text-xs"
                />
              </div>
              <div>
                <Label className="mb-2 text-xs">End Time *</Label>
                <Input
                  type="time"
                  required
                  value={classItem.end_time}
                  onChange={(e) =>
                    onChange({ ...classItem, end_time: e.target.value })
                  }
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 text-xs">Room/Location</Label>
              <Input
                type="text"
                value={classItem.room}
                onChange={(e) =>
                  onChange({ ...classItem, room: e.target.value })
                }
                placeholder="e.g., Room 301, Lab A"
                className="text-xs"
              />
            </div>

            <div>
              <Label className="mb-2 text-xs">Class Type</Label>
              <Select
                value={classItem.class_type}
                onValueChange={(value) =>
                  onChange({ ...classItem, class_type: value })
                }
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lecture" className="text-xs">
                    Lecture
                  </SelectItem>
                  <SelectItem value="lab" className="text-xs">
                    Lab
                  </SelectItem>
                  <SelectItem value="tutorial" className="text-xs">
                    Tutorial
                  </SelectItem>
                  <SelectItem value="seminar" className="text-xs">
                    Seminar
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
            {title.includes("Add") ? "Add Class" : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function ClassDetailsModal({
  classItem,
  onClose,
  onEdit,
}: {
  classItem: Class;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Class Details</CardTitle>
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
            <div
              className={`p-3 rounded-lg ${getColorClass(
                classItem.courses.color
              )}`}
            >
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold mb-1">
                {classItem.courses.course_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {classItem.courses.course_code}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-2 rounded bg-accent">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-3 w-3 text-purple-600" />
                <span className="font-medium text-xs">Schedule</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Day:</span>
                  <span className="font-medium">
                    {getDayName(classItem.day_of_week)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">
                    {formatTime(classItem.start_time)} -{" "}
                    {formatTime(classItem.end_time)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-2 rounded bg-accent">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-3 w-3 text-purple-600" />
                <span className="font-medium text-xs">Location</span>
              </div>
              <p className="text-xs font-medium">
                {classItem.room || "Location not specified"}
              </p>
            </div>

            <div className="p-2 rounded bg-accent">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-3 w-3 text-purple-600" />
                <span className="font-medium text-xs">Class Type</span>
              </div>
              <Badge variant="secondary" className="text-xs capitalize">
                {classItem.class_type}
              </Badge>
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
            Edit Class
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function ClassesSkeleton() {
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
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-12 rounded" />
                  <Skeleton className="h-6 w-16 rounded" />
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
            <h1 className="text-lg font-semibold">Classes</h1>
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
