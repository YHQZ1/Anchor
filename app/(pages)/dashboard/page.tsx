"use client";

import React from "react";
import { useTheme } from "next-themes";
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
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

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
          <Badge variant="destructive" className="text-white dark:text-white">
            High Priority
          </Badge>
        );
      case "medium":
        return <Badge variant="secondary">Medium Priority</Badge>;
      case "low":
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-slate-900"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-30 border-b ${
          theme === "dark"
            ? "bg-black/95 border-white/10"
            : "bg-white/95 border-slate-200"
        } backdrop-blur supports-[backdrop-filter]:bg-background/60`}
      >
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-slate-600"
              }`}
            >
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
              className={`rounded-xl border p-6 ${
                theme === "dark"
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-400" : "text-slate-600"
                  }`}
                >
                  {stat.title}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-500" : "text-slate-500"
                  }`}
                >
                  {stat.trend}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Assignments */}
          <div
            className={`lg:col-span-2 rounded-xl border p-6 ${
              theme === "dark"
                ? "bg-white/5 border-white/10"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Upcoming Assignments</h2>
              <a
                href="/assignments"
                className={`text-sm font-medium ${
                  theme === "dark"
                    ? "text-purple-400 hover:text-purple-300"
                    : "text-purple-600 hover:text-purple-700"
                }`}
              >
                View all →
              </a>
            </div>
            <div className="space-y-4">
              {upcomingAssignments.map((assignment, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    theme === "dark"
                      ? "border-white/10 hover:bg-white/5"
                      : "border-slate-200 hover:bg-slate-50"
                  } transition-colors cursor-pointer`}
                >
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{assignment.title}</h3>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-slate-600"
                      }`}
                    >
                      {assignment.course}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getPriorityBadge(assignment.priority)}
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{assignment.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div
            className={`rounded-xl border p-6 ${
              theme === "dark"
                ? "bg-white/5 border-white/10"
                : "bg-white border-slate-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex gap-3">
                  <div
                    className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      theme === "dark" ? "bg-purple-400" : "bg-purple-600"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p
                      className={`text-xs mt-1 ${
                        theme === "dark" ? "text-gray-500" : "text-slate-500"
                      }`}
                    >
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className={`rounded-xl border p-6 ${
            theme === "dark"
              ? "bg-white/5 border-white/10"
              : "bg-white border-slate-200"
          }`}
        >
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              className={`p-4 rounded-lg border text-left transition-colors ${
                theme === "dark"
                  ? "border-white/10 hover:bg-white/5"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <CheckSquare
                className={`h-6 w-6 mb-2 ${
                  theme === "dark" ? "text-purple-400" : "text-purple-600"
                }`}
              />
              <h3 className="font-medium mb-1">Add Assignment</h3>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }`}
              >
                Track a new assignment
              </p>
            </button>
            <button
              className={`p-4 rounded-lg border text-left transition-colors ${
                theme === "dark"
                  ? "border-white/10 hover:bg-white/5"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Calendar
                className={`h-6 w-6 mb-2 ${
                  theme === "dark" ? "text-purple-400" : "text-purple-600"
                }`}
              />
              <h3 className="font-medium mb-1">Mark Attendance</h3>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }`}
              >
                Update the attendance for today
              </p>
            </button>
            <button
              className={`p-4 rounded-lg border text-left transition-colors ${
                theme === "dark"
                  ? "border-white/10 hover:bg-white/5"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <TrendingUp
                className={`h-6 w-6 mb-2 ${
                  theme === "dark" ? "text-purple-400" : "text-purple-600"
                }`}
              />
              <h3 className="font-medium mb-1">View Analytics</h3>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }`}
              >
                Check your progress
              </p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
