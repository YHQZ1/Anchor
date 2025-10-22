"use client";

import React from "react";
import {
  CheckSquare,
  Calendar,
  TrendingUp,
  Clock,
  BookOpen,
} from "lucide-react";
import { SidebarTrigger } from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Don't return null during SSR - this causes hydration mismatches
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
      title: "Pending Assignments",
      value: "8",
      icon: CheckSquare,
      trend: "+2 from last week",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Attendance Rate",
      value: "92%",
      icon: Calendar,
      trend: "+5% from last month",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Active Courses",
      value: "6",
      icon: BookOpen,
      trend: "Spring 2025",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Avg Performance",
      value: "85%",
      icon: TrendingUp,
      trend: "+3% improvement",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-500/10",
    },
  ];

  const upcomingAssignments = [
    {
      title: "Data Structures Lab Report",
      course: "CS 301",
      dueDate: "Tomorrow",
      priority: "high",
    },
    {
      title: "Algorithm Analysis Essay",
      course: "CS 402",
      dueDate: "In 3 days",
      priority: "medium",
    },
    {
      title: "Database Design Project",
      course: "CS 305",
      dueDate: "In 5 days",
      priority: "medium",
    },
    {
      title: "Web Development Assignment",
      course: "CS 201",
      dueDate: "Next week",
      priority: "low",
    },
  ];

  const recentActivity = [
    {
      type: "assignment",
      title: "Submitted Operating Systems Quiz",
      time: "2 hours ago",
    },
    {
      type: "attendance",
      title: "Marked present in Computer Networks",
      time: "5 hours ago",
    },
    {
      type: "grade",
      title: "Received grade for Software Engineering",
      time: "1 day ago",
    },
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge
            variant="destructive"
            className="text-white dark:text-white transition-none"
          >
            High Priority
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="secondary" className="transition-none">
            Medium Priority
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="transition-none">
            Low Priority
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="transition-none">
            Normal
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome back, Student
            </span>
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
                <p className="text-xs text-muted-foreground">{stat.trend}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Assignments */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Upcoming Assignments</h2>
              <a
                href="/assignments"
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                View all →
              </a>
            </div>
            <div className="space-y-4">
              {upcomingAssignments.map((assignment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer"
                >
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {assignment.course}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getPriorityBadge(assignment.priority)}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{assignment.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 bg-primary" />
                  <div>
                    <p className="font-medium text-sm">{activity.title}</p>
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
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 rounded-lg border border-border hover:bg-accent/50 text-left">
              <CheckSquare className="h-6 w-6 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Add Assignment</h3>
              <p className="text-sm text-muted-foreground">
                Track a new assignment
              </p>
            </button>
            <button className="p-4 rounded-lg border border-border hover:bg-accent/50 text-left">
              <Calendar className="h-6 w-6 mb-2 text-primary" />
              <h3 className="font-medium mb-1">Mark Attendance</h3>
              <p className="text-sm text-muted-foreground">
                Update the attendance for today
              </p>
            </button>
            <button className="p-4 rounded-lg border border-border hover:bg-accent/50 text-left">
              <TrendingUp className="h-6 w-6 mb-2 text-primary" />
              <h3 className="font-medium mb-1">View Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Check your progress
              </p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
