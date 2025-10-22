"use client";

import React from "react";
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
} from "lucide-react";
import { SidebarTrigger } from "@/components/Sidebar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CoursesPage() {
  const [mounted, setMounted] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center gap-4 px-6">
            <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </header>
        <main className="p-6">
          <div className="h-96 bg-muted/20 rounded-xl animate-pulse"></div>
        </main>
      </div>
    );
  }

  const stats = [
    {
      title: "Active Courses",
      value: "6",
      icon: BookOpen,
      trend: "Spring 2025",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Total Credits",
      value: "21",
      icon: TrendingUp,
      trend: "This semester",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Pending Tasks",
      value: "12",
      icon: CheckSquare,
      trend: "Across all courses",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Avg Performance",
      value: "85%",
      icon: TrendingUp,
      trend: "+3% from last sem",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
  ];

  const courses = [
    {
      code: "CS 301",
      name: "Data Structures & Algorithms",
      instructor: "Dr. Sarah Johnson",
      credits: 4,
      schedule: "Mon, Wed, Fri 10:00 AM",
      room: "Room 204",
      attendance: 87.5,
      assignments: 3,
      nextClass: "Tomorrow 10:00 AM",
      color: "bg-purple-500",
      performance: 88,
      description: "Advanced data structures and algorithm analysis with complexity theory",
      resources: 12,
      grade: "A-"
    },
    {
      code: "CS 402",
      name: "Algorithm Analysis",
      instructor: "Prof. Michael Chen",
      credits: 3,
      schedule: "Tue, Thu 2:00 PM",
      room: "Room 305",
      attendance: 86.4,
      assignments: 2,
      nextClass: "Today 2:00 PM",
      color: "bg-purple-500",
      performance: 92,
      description: "Advanced algorithm design and analysis techniques",
      resources: 8,
      grade: "A"
    },
    {
      code: "CS 305",
      name: "Database Management Systems",
      instructor: "Dr. Emily Williams",
      credits: 4,
      schedule: "Mon, Wed 1:00 PM",
      room: "Lab 101",
      attendance: 72.9,
      assignments: 4,
      nextClass: "Wed 1:00 PM",
      color: "bg-purple-500",
      performance: 78,
      description: "Database design, SQL, and transaction management",
      resources: 15,
      grade: "B+"
    },
    {
      code: "CS 201",
      name: "Web Development",
      instructor: "Prof. James Anderson",
      credits: 3,
      schedule: "Tue, Thu 11:00 AM",
      room: "Lab 203",
      attendance: 91.7,
      assignments: 1,
      nextClass: "Today 11:00 AM",
      color: "bg-purple-500",
      performance: 90,
      description: "Modern web development with React and Node.js",
      resources: 10,
      grade: "A-"
    },
    {
      code: "CS 303",
      name: "Operating Systems",
      instructor: "Dr. Robert Taylor",
      credits: 4,
      schedule: "Mon, Wed, Fri 3:00 PM",
      room: "Room 401",
      attendance: 90.9,
      assignments: 2,
      nextClass: "Tomorrow 3:00 PM",
      color: "bg-purple-500",
      performance: 85,
      description: "Process management, memory allocation, and file systems",
      resources: 14,
      grade: "B+"
    },
    {
      code: "MATH 201",
      name: "Discrete Mathematics",
      instructor: "Prof. Linda Martinez",
      credits: 3,
      schedule: "Tue, Thu 9:00 AM",
      room: "Room 102",
      attendance: 95.8,
      assignments: 0,
      nextClass: "Today 9:00 AM",
      color: "bg-purple-500",
      performance: 94,
      description: "Logic, set theory, combinatorics, and graph theory",
      resources: 6,
      grade: "A"
    },
  ];

  const upcomingClasses = [
    {
      course: "MATH 201",
      time: "Today 9:00 AM",
      room: "Room 102",
      type: "Lecture",
      in: "30 minutes",
    },
    {
      course: "CS 201",
      time: "Today 11:00 AM",
      room: "Lab 203",
      type: "Lab",
      in: "2 hours",
    },
    {
      course: "CS 402",
      time: "Today 2:00 PM",
      room: "Room 305",
      type: "Lecture",
      in: "5 hours",
    },
  ];

  const getAttendanceBadge = (attendance: number) => {
    if (attendance >= 90) return <Badge variant="default" className="transition-none">Excellent</Badge>;
    if (attendance >= 75) return <Badge variant="secondary" className="transition-none">Good</Badge>;
    return <Badge variant="destructive" className="text-white dark:text-white transition-none">At Risk</Badge>;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Courses</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="h-4 w-4" />
              Add Course
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Stats Grid */}
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
                <p className="text-xs text-muted-foreground">
                  {stat.trend}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses by name, code, or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses Grid */}
          <div className="lg:col-span-2 space-y-4">
            {courses.map((course, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card p-6 hover:bg-accent/50 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${course.color}`}>
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {course.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {course.code} • {course.credits} Credits • Grade: {course.grade}
                      </p>
                    </div>
                  </div>
                  
                  {/* Three-dots Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 rounded-lg hover:bg-accent">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Course
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-sm mb-4 text-muted-foreground">
                  {course.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-accent">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Instructor
                      </span>
                    </div>
                    <p className="text-sm font-medium">{course.instructor}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-accent">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Next Class
                      </span>
                    </div>
                    <p className="text-sm font-medium">{course.nextClass}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Attendance
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {course.attendance}%
                      </span>
                      {getAttendanceBadge(course.attendance)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Performance
                      </span>
                      <span className="font-medium">{course.performance}%</span>
                    </div>
                    <Progress value={course.performance} className="h-2 transition-none" />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {course.assignments} pending
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {course.resources} resources
                        </span>
                      </div>
                    </div>
                    <button className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Classes */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold mb-6">Today&apos;s Schedule</h2>
              <div className="space-y-4">
                {upcomingClasses.map((cls, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-border bg-accent"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{cls.course}</h3>
                      <Badge variant="secondary" className="transition-none">
                        {cls.type}
                      </Badge>
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
                      Starts in {cls.in}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold mb-6">Quick Stats</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Classes This Week
                    </span>
                    <span className="font-semibold">18/20</span>
                  </div>
                  <Progress value={90} className="h-2 transition-none" />
                </div>

                <div className="p-4 rounded-lg bg-accent">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Assignments Due
                    </span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">5</span>
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground">
                    This week
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-accent">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Study Hours
                    </span>
                    <span className="font-semibold">24.5</span>
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground">
                    This week
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}