"use client";

import React from "react";
import {
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
  Download,
  Clock,
} from "lucide-react";
import { SidebarTrigger } from "@/components/Sidebar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function AttendancePage() {
  const [mounted, setMounted] = React.useState(false);

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

  const overallStats = [
    {
      title: "Overall Attendance",
      value: "87.5%",
      icon: Calendar,
      trend: "Above threshold",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Classes Attended",
      value: "245/280",
      icon: CheckCircle,
      trend: "35 absences",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Subjects at Risk",
      value: "2",
      icon: AlertTriangle,
      trend: "Need attention",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Safe Absences",
      value: "8",
      icon: TrendingUp,
      trend: "Before threshold",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
  ];

  const subjects = [
    {
      code: "CS 301",
      name: "Data Structures",
      attended: 42,
      total: 48,
      percentage: 87.5,
      safeAbsences: 3,
      status: "safe",
      details: {
        instructor: "Dr. Sarah Johnson",
        schedule: "Mon, Wed, Fri - 10:00 AM",
        room: "CS Building 301",
        lastAttendance: "2025-01-15",
        nextClass: "2025-01-17",
      },
    },
    {
      code: "CS 402",
      name: "Algorithm Analysis",
      attended: 38,
      total: 44,
      percentage: 86.4,
      safeAbsences: 2,
      status: "safe",
      details: {
        instructor: "Prof. Michael Chen",
        schedule: "Tue, Thu - 2:00 PM",
        room: "Engineering Hall 205",
        lastAttendance: "2025-01-14",
        nextClass: "2025-01-16",
      },
    },
    {
      code: "CS 305",
      name: "Database Systems",
      attended: 35,
      total: 48,
      percentage: 72.9,
      safeAbsences: 0,
      status: "warning",
      details: {
        instructor: "Dr. Emily Rodriguez",
        schedule: "Mon, Wed, Fri - 1:00 PM",
        room: "CS Building 105",
        lastAttendance: "2025-01-15",
        nextClass: "2025-01-17",
      },
    },
    {
      code: "CS 201",
      name: "Web Development",
      attended: 44,
      total: 48,
      percentage: 91.7,
      safeAbsences: 5,
      status: "safe",
      details: {
        instructor: "Prof. David Kim",
        schedule: "Tue, Thu - 11:00 AM",
        room: "Tech Center 102",
        lastAttendance: "2025-01-14",
        nextClass: "2025-01-16",
      },
    },
    {
      code: "CS 303",
      name: "Operating Systems",
      attended: 40,
      total: 44,
      percentage: 90.9,
      safeAbsences: 4,
      status: "safe",
      details: {
        instructor: "Dr. Robert Wilson",
        schedule: "Mon, Wed - 3:00 PM",
        room: "Engineering Hall 301",
        lastAttendance: "2025-01-15",
        nextClass: "2025-01-17",
      },
    },
    {
      code: "MATH 201",
      name: "Discrete Mathematics",
      attended: 46,
      total: 48,
      percentage: 95.8,
      safeAbsences: 7,
      status: "excellent",
      details: {
        instructor: "Dr. Lisa Thompson",
        schedule: "Tue, Thu, Fri - 9:00 AM",
        room: "Math Building 201",
        lastAttendance: "2025-01-14",
        nextClass: "2025-01-16",
      },
    },
  ];

  const recentActivity = [
    {
      date: "Today",
      subject: "CS 301",
      status: "present",
      time: "10:00 AM",
      type: "Regular Class",
    },
    {
      date: "Today",
      subject: "CS 402",
      status: "present",
      time: "2:00 PM",
      type: "Lab Session",
    },
    {
      date: "Yesterday",
      subject: "CS 305",
      status: "absent",
      time: "1:00 PM",
      type: "Regular Class",
      reason: "Medical Leave",
    },
    {
      date: "Yesterday",
      subject: "MATH 201",
      status: "present",
      time: "9:00 AM",
      type: "Tutorial",
    },
    {
      date: "2 days ago",
      subject: "CS 303",
      status: "present",
      time: "3:00 PM",
      type: "Regular Class",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return (
          <Badge variant="default" className="transition-none">
            Excellent
          </Badge>
        );
      case "safe":
        return (
          <Badge variant="secondary" className="transition-none">
            Safe
          </Badge>
        );
      case "warning":
        return (
          <Badge
            variant="destructive"
            className="text-white dark:text-white transition-none"
          >
            At Risk
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="transition-none">
            Unknown
          </Badge>
        );
    }
  };

  const getProgressValue = (percentage: number) => {
    return percentage;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Attendance</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-input bg-background text-foreground hover:bg-accent">
              <Upload className="h-4 w-4" />
              Upload Timetable
            </button>
            <button className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white">
              <Calendar className="h-4 w-4" />
              Mark Today
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {overallStats.map((stat, index) => (
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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subject-wise Attendance */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Subject-wise Breakdown</h2>
              <button className="text-sm font-medium cursor-pointer text-primary hover:text-primary/80">
                <Download className="h-4 w-4 inline mr-1" />
                Export
              </button>
            </div>

            <Accordion
              type="single"
              collapsible
              className="space-y-4 transition-none"
            >
              {subjects.map((subject, index) => (
                <AccordionItem
                  key={index}
                  value={`subject-${index}`}
                  className="border border-border rounded-lg transition-none"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline cursor-pointer transition-none">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <h3 className="font-medium text-base">
                            {subject.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {subject.code}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(subject.status)}
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {subject.percentage.toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {subject.attended}/{subject.total} classes
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 transition-none">
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">
                            Attendance Progress
                          </span>
                          <span className="text-muted-foreground">
                            {subject.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={getProgressValue(subject.percentage)}
                          className="h-2 transition-none"
                        />
                      </div>

                      {/* Subject Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Instructor</p>
                          <p className="font-medium">
                            {subject.details.instructor}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Schedule</p>
                          <p className="font-medium">
                            {subject.details.schedule}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Room</p>
                          <p className="font-medium">{subject.details.room}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Next Class</p>
                          <p className="font-medium">
                            {subject.details.nextClass}
                          </p>
                        </div>
                      </div>

                      {/* Safe Absences */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
                        <span className="text-muted-foreground">
                          Safe absences remaining
                        </span>
                        <span className="font-medium">
                          {subject.safeAbsences} classes
                        </span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent"
                >
                  {activity.status === "present" ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {activity.subject}
                    </p>
                    <p className="text-xs mt-0.5 text-muted-foreground">
                      {activity.date} • {activity.time} • {activity.type}
                    </p>
                    {activity.reason && (
                      <p className="text-xs mt-1 text-red-600 dark:text-red-400">
                        Reason: {activity.reason}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      activity.status === "present" ? "default" : "destructive"
                    }
                    className={
                      activity.status === "absent"
                        ? "text-white dark:text-white transition-none"
                        : "transition-none"
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Insights */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-6">Insights & Predictions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border bg-accent">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-medium">Subjects at Risk</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">CS 305</span> is below 75%.
                Attend all remaining classes to stay above threshold.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-accent">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-medium">This Week</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                You&apos;ve attended{" "}
                <span className="font-semibold">18/20</span> classes. Keep up
                the good work!
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-accent">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-medium">Projected Status</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                If current trend continues, you&apos;ll end the semester at{" "}
                <span className="font-semibold">88.2%</span> attendance.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
