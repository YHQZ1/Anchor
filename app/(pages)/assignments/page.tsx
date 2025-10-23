/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, JSX } from "react";
import {
  CheckSquare,
  Clock,
  Filter,
  Search,
  Calendar as CalendarIcon,
  FileText,
  Plus,
  X,
  Edit,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { SidebarTrigger } from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Course {
  id: string;
  course_code: string;
  course_name: string;
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

export default function AssignmentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    course_id: "",
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    priority: "medium" as "low" | "medium" | "high",
  });

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch("/api/assignments", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        window.location.href = "/auth";
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch assignments");

      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) return;

      const response = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token");

      const dueDate = new Date(newAssignment.due_date);
      if (dueDate <= new Date())
        throw new Error("Due date must be in the future");

      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newAssignment,
          due_date: dueDate.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add assignment");
      }

      const data = await response.json();
      setAssignments((prev) => [data.assignment, ...prev]);
      setShowAddModal(false);
      setNewAssignment({
        title: "",
        description: "",
        course_id: "",
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        priority: "medium",
      });
    } catch (err) {
      console.error("Error adding assignment:", err);
    }
  };

  const handleUpdateAssignment = async (assignmentId: string, updates: any) => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token");

      const response = await fetch("/api/assignments", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: assignmentId, ...updates }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update assignment");
      }

      const data = await response.json();
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === assignmentId ? data.assignment : assignment
        )
      );
      setEditingAssignment(null);
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating assignment:", err);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token");

      const response = await fetch(`/api/assignments?id=${assignmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete assignment");

      setAssignments((prev) =>
        prev.filter((assignment) => assignment.id !== assignmentId)
      );
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting assignment:", err);
    }
  };

  const handleProgressUpdate = (assignmentId: string, progress: number) => {
      const updates: { progress: number; status?: string } = { progress };
      if (progress === 100) updates.status = "completed";
      else if (progress > 0) updates.status = "in-progress";
      handleUpdateAssignment(assignmentId, updates);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Submitted</Badge>;
      case "in-progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "pending":
        return <Badge variant="outline">Not Started</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
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
      assignment.courses.course_code
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      assignment.courses.course_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

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
      value: assignments.filter(
        (a) => a.status === "pending" || a.status === "in-progress"
      ).length,
      icon: Clock,
    },
    {
      label: "Completed",
      value: assignments.filter((a) => a.status === "completed").length,
      icon: CheckCircle2,
    },
    {
      label: "Due This Week",
      value: assignments.filter((a) => {
        const daysLeft = Math.ceil(
          (new Date(a.due_date).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return daysLeft >= 0 && daysLeft <= 7;
      }).length,
      icon: CalendarIcon,
    },
  ];

  if (loading) return <AssignmentsSkeleton />;
  if (error) return <ErrorState error={error} onRetry={fetchAssignments} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Assignments</h1>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            variant={"outline"}
            className="flex items-center gap-2 cursor-pointer transition-none"
          >
            <Plus className="h-4 w-4" />
            Add Assignment
          </Button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/10">
                    <stat.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex cursor-pointer transition-none items-center gap-2 h-10"
                  >
                    <Filter className="h-4 w-4" />
                    {filterStatus === "all"
                      ? "All Status"
                      : filterStatus.replace("-", " ")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilterStatus("in-progress")}
                  >
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilterStatus("completed")}
                  >
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("overdue")}>
                    Overdue
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center transition-none gap-2 cursor-pointer h-10"
                  >
                    <Filter className="h-4 w-4" />
                    {filterPriority === "all" ? "All Priority" : filterPriority}
                  </Button>
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
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <CardTitle className="text-lg font-medium mb-2">
                  No assignments found
                </CardTitle>
                <CardDescription>
                  {assignments.length === 0
                    ? "You don't have any assignments yet"
                    : "Try adjusting your filters or search query"}
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onEdit={() => {
                  setEditingAssignment(assignment);
                  setShowEditModal(true);
                }}
                onDelete={() => setDeleteConfirm(assignment.id)}
                onProgressUpdate={handleProgressUpdate}
                getStatusBadge={getStatusBadge}
                getDaysUntilDue={getDaysUntilDue}
              />
            ))
          )}
        </div>
      </main>

      {showAddModal && (
        <AssignmentModal
          title="Add New Assignment"
          assignment={newAssignment}
          courses={courses}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddAssignment}
          onChange={setNewAssignment}
        />
      )}

      {showEditModal && editingAssignment && (
        <AssignmentModal
          title="Edit Assignment"
          assignment={editingAssignment}
          courses={courses}
          onClose={() => {
            setShowEditModal(false);
            setEditingAssignment(null);
          }}
          onSubmit={() =>
            handleUpdateAssignment(editingAssignment.id, {
              title: editingAssignment.title,
              description: editingAssignment.description,
              due_date: editingAssignment.due_date,
              priority: editingAssignment.priority,
            })
          }
          onChange={setEditingAssignment}
        />
      )}

      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assignment? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteConfirm && handleDeleteAssignment(deleteConfirm)
              }
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Extracted Components

function AssignmentCard({
  assignment,
  onEdit,
  onDelete,
  onProgressUpdate,
  getStatusBadge,
  getDaysUntilDue,
}: {
  assignment: Assignment;
  onEdit: () => void;
  onDelete: () => void;
  onProgressUpdate: (id: string, progress: number) => void;
  getStatusBadge: (status: string) => JSX.Element;
  getDaysUntilDue: (dueDate: string) => string;
}) {
  return (
    <Card className="hover:bg-accent/50">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-2">
              <CheckSquare className="h-5 w-5 mt-0.5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
              <div>
                <CardTitle className="text-lg mb-1">
                  {assignment.title}
                </CardTitle>
                <CardDescription>
                  {assignment.courses.course_code} •{" "}
                  {assignment.courses.course_name}
                </CardDescription>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge(assignment.status)}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                title="Edit assignment"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                title="Delete assignment"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm mb-4 text-muted-foreground">
          {assignment.description}
        </p>

        {assignment.status !== "completed" && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-muted-foreground">
                {assignment.progress}%
              </span>
            </div>
            <Progress value={assignment.progress} className="h-2" />
            <div className="flex gap-1 mt-2">
              {[0, 25, 50, 75, 100].map((value) => (
                <Button
                  key={value}
                  variant={
                    assignment.progress === value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => onProgressUpdate(assignment.id, value)}
                  className="h-6 px-2 text-xs cursor-pointer"
                >
                  {value}%
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 w-full">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>
                Due: {new Date(assignment.due_date).toLocaleDateString()}
              </span>
            </div>
            <span
              className={`font-medium ${
                getDaysUntilDue(assignment.due_date) === "Overdue"
                  ? "text-red-500"
                  : getDaysUntilDue(assignment.due_date).includes("today") ||
                    getDaysUntilDue(assignment.due_date).includes("tomorrow")
                  ? "text-orange-500"
                  : "text-muted-foreground"
              }`}
            >
              {getDaysUntilDue(assignment.due_date)}
            </span>
          </div>

          <div className="flex gap-2">
            {assignment.status !== "completed" && (
              <Button
                size="sm"
                onClick={() => onProgressUpdate(assignment.id, 100)}
                className="cursor-pointer"
              >
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

function AssignmentModal({
  title,
  assignment,
  courses,
  onClose,
  onSubmit,
  onChange,
}: {
  title: string;
  assignment: any;
  courses: Course[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (assignment: any) => void;
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
              <label className="text-sm font-medium mb-1 block">Title</label>
              <input
                type="text"
                required
                value={assignment.title}
                onChange={(e) =>
                  onChange({ ...assignment, title: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Assignment title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Description
              </label>
              <textarea
                value={assignment.description}
                onChange={(e) =>
                  onChange({ ...assignment, description: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Assignment description"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Course</label>
              <Select
                value={assignment.course_id}
                onValueChange={(value) =>
                  onChange({ ...assignment, course_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.course_code} - {course.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Priority</label>
              <Select
                value={assignment.priority}
                onValueChange={(value) =>
                  onChange({ ...assignment, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
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
            {title.includes("Add") ? "Add Assignment" : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function AssignmentsSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <Skeleton className="w-8 h-8 rounded" />
          <div className="flex-1">
            <Skeleton className="h-6 w-32 rounded" />
          </div>
        </div>
      </header>
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-6 w-8 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4 rounded" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full rounded mb-4" />
                <Skeleton className="h-2 w-full rounded" />
              </CardContent>
              <CardFooter>
                <div className="flex justify-between w-full">
                  <Skeleton className="h-4 w-48 rounded" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 rounded" />
                    <Skeleton className="h-9 w-32 rounded" />
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
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
            <h1 className="text-xl font-semibold">Assignments</h1>
          </div>
        </div>
      </header>
      <main className="p-6">
        <div className="flex items-center justify-center h-96">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                Failed to load assignments
              </CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={onRetry} className="w-full cursor-pointer">
                Retry
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
