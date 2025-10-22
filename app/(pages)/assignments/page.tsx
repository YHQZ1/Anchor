"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Clock,
  Filter,
  Search,
  Calendar,
  FileText,
  Download,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { SidebarTrigger } from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AssignmentsPage() {
  const [mounted, setMounted] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const assignments = [
    {
      id: 1,
      title: "Data Structures Lab Report",
      course: "CS 301",
      courseName: "Data Structures & Algorithms",
      dueDate: "2025-10-22",
      dueTime: "11:59 PM",
      status: "pending",
      priority: "high",
      description:
        "Complete analysis of sorting algorithms with time complexity comparisons",
      files: ["Lab_Instructions.pdf", "Starter_Code.zip"],
      submitted: false,
      progress: 60,
    },
    {
      id: 2,
      title: "Algorithm Analysis Essay",
      course: "CS 402",
      courseName: "Advanced Algorithms",
      dueDate: "2025-10-24",
      dueTime: "11:59 PM",
      status: "pending",
      priority: "medium",
      description: "Write a 3000-word essay on dynamic programming approaches",
      files: ["Essay_Guidelines.pdf"],
      submitted: false,
      progress: 30,
    },
    {
      id: 3,
      title: "Database Design Project",
      course: "CS 305",
      courseName: "Database Management Systems",
      dueDate: "2025-10-26",
      dueTime: "11:59 PM",
      status: "pending",
      priority: "medium",
      description:
        "Design and implement a normalized database schema for an e-commerce system",
      files: ["Project_Requirements.pdf", "Sample_Data.csv"],
      submitted: false,
      progress: 45,
    },
    {
      id: 4,
      title: "Web Development Assignment",
      course: "CS 201",
      courseName: "Web Technologies",
      dueDate: "2025-10-28",
      dueTime: "11:59 PM",
      status: "not-started",
      priority: "low",
      description:
        "Build a responsive landing page using React and Tailwind CSS",
      files: ["Design_Mockup.fig", "Requirements.pdf"],
      submitted: false,
      progress: 0,
    },
    {
      id: 5,
      title: "Operating Systems Quiz",
      course: "CS 303",
      courseName: "Operating Systems",
      dueDate: "2025-10-20",
      dueTime: "11:59 PM",
      status: "submitted",
      priority: "high",
      description:
        "Multiple choice quiz covering process scheduling and memory management",
      files: [],
      submitted: true,
      progress: 100,
      submittedDate: "2025-10-19",
    },
    {
      id: 6,
      title: "Computer Networks Lab",
      course: "CS 401",
      courseName: "Computer Networks",
      dueDate: "2025-10-25",
      dueTime: "11:59 PM",
      status: "pending",
      priority: "high",
      description: "Configure and test a network topology using packet tracer",
      files: ["Lab_Manual.pdf", "Topology_File.pkt"],
      submitted: false,
      progress: 20,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge variant="default" className="transition-none">
            Submitted
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="transition-none">
            Pending
          </Badge>
        );
      case "not-started":
        return (
          <Badge variant="outline" className="transition-none">
            Not Started
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

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `${diffDays} days left`;
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesStatus =
      filterStatus === "all" || assignment.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || assignment.priority === filterPriority;
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.courseName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const stats = [
    {
      label: "Total Assignments",
      value: assignments.length,
      icon: CheckSquare,
    },
    {
      label: "Pending",
      value: assignments.filter((a) => !a.submitted).length,
      icon: Clock,
    },
    {
      label: "Submitted",
      value: assignments.filter((a) => a.submitted).length,
      icon: CheckCircle2,
    },
    {
      label: "Due This Week",
      value: assignments.filter((a) => {
        const daysLeft = Math.ceil(
          (new Date(a.dueDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return daysLeft >= 0 && daysLeft <= 7;
      }).length,
      icon: Calendar,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Assignments</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/10">
                  <stat.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Status Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-accent">
                  <Filter className="h-4 w-4" />
                  {filterStatus === "all"
                    ? "All Status"
                    : filterStatus.replace("-", " ")}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterStatus("not-started")}
                >
                  Not Started
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("submitted")}>
                  Submitted
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Priority Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-accent">
                  <Filter className="h-4 w-4" />
                  {filterPriority === "all" ? "All Priority" : filterPriority}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setFilterPriority("all")}>
                  All Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority("high")}>
                  High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority("medium")}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority("low")}>
                  Low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No assignments found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-xl border border-border bg-card p-6 hover:bg-accent/50 cursor-pointer"
              >
                {/* Assignment Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <CheckSquare className="h-5 w-5 mt-0.5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {assignment.course} • {assignment.courseName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(assignment.status)}
                  </div>
                </div>

                {/* Assignment Description */}
                <p className="text-sm mb-4 text-muted-foreground">
                  {assignment.description}
                </p>

                {/* Progress Bar */}
                {!assignment.submitted && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-muted-foreground">
                        {assignment.progress}%
                      </span>
                    </div>
                    <Progress value={assignment.progress} className="h-2 transition-none" />
                  </div>
                )}

                {/* Files */}
                {assignment.files.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium mb-2 text-muted-foreground">
                      Attached Files:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {assignment.files.map((file, index) => (
                        <button
                          key={index}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-accent"
                        >
                          <FileText className="h-3 w-3" />
                          {file}
                          <Download className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}{" "}
                        at {assignment.dueTime}
                      </span>
                    </div>
                    <span
                      className={`font-medium ${
                        getDaysUntilDue(assignment.dueDate) === "Overdue"
                          ? "text-red-500"
                          : getDaysUntilDue(assignment.dueDate).includes(
                              "today"
                            ) ||
                            getDaysUntilDue(assignment.dueDate).includes(
                              "tomorrow"
                            )
                          ? "text-orange-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {getDaysUntilDue(assignment.dueDate)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent">
                      View Details
                      <ExternalLink className="inline h-3 w-3 ml-1" />
                    </button>
                    {!assignment.submitted && (
                      <button className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white">
                        Submit Assignment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
