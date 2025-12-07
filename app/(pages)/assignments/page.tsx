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
  AlertCircle,
} from "lucide-react";
import { SidebarTrigger, MobileSidebarTrigger } from "@/components/Sidebar";
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

export default function Assignments() {
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
    } catch {
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
        return (
          <Badge variant="default" className="text-[10px]">
            Submitted
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="secondary" className="text-[10px]">
            In Progress
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-[10px]">
            Not Started
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="destructive" className="text-[10px]">
            Overdue
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
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
        <div className="flex h-14 items-center gap-3 px-4">
          <div className="lg:hidden">
            <MobileSidebarTrigger />
          </div>
          <div className="hidden lg:block">
            <SidebarTrigger />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Assignments</h1>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            variant={"outline"}
            className="flex items-center gap-1 cursor-pointer text-xs h-8 px-2"
          >
            <Plus className="h-3 w-3" />
            <span className="hidden xs:inline">Add Assignment</span>
          </Button>
        </div>
      </header>

      <main className="p-3 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 xs:grid-cols-2 lg:grid-cols-4 gap-2">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-500/10">
                    <stat.icon className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-sm font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Card */}
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col gap-2">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-7 pr-2 rounded border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring text-xs"
                />
              </div>

              <div className="flex gap-2">
                {/* Status Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex cursor-pointer transition-none items-center gap-1 h-8 text-xs flex-1"
                    >
                      <Filter className="h-3 w-3" />
                      <span>
                        {filterStatus === "all"
                          ? "Status"
                          : filterStatus.replace("-", " ")}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() => setFilterStatus("all")}
                      className="text-xs"
                    >
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterStatus("pending")}
                      className="text-xs"
                    >
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterStatus("in-progress")}
                      className="text-xs"
                    >
                      In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterStatus("completed")}
                      className="text-xs"
                    >
                      Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterStatus("overdue")}
                      className="text-xs"
                    >
                      Overdue
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Priority Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center transition-none gap-1 cursor-pointer h-8 text-xs flex-1"
                    >
                      <Filter className="h-3 w-3" />
                      <span>
                        {filterPriority === "all" ? "Priority" : filterPriority}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() => setFilterPriority("all")}
                      className="text-xs"
                    >
                      All Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterPriority("high")}
                      className="text-xs"
                    >
                      High
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterPriority("medium")}
                      className="text-xs"
                    >
                      Medium
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterPriority("low")}
                      className="text-xs"
                    >
                      Low
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments List */}
        <div className="space-y-3">
          {filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <CardTitle className="text-sm font-medium mb-1">
                  No assignments found
                </CardTitle>
                <CardDescription className="text-xs">
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

      {/* Add/Edit Modals */}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md mx-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">
              Delete Assignment
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete this assignment? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteConfirm && handleDeleteAssignment(deleteConfirm)
              }
              className="bg-destructive hover:bg-destructive/90 text-xs h-9"
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
    <Card className="hover:bg-accent/50 transition-none">
      <CardHeader className="p-3">
        <div className="flex flex-col gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1">
              <CheckSquare className="h-3 w-3 mt-0.5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm mb-0.5 truncate">
                  {assignment.title}
                </CardTitle>
                <CardDescription className="text-xs truncate">
                  {assignment.courses.course_code} •{" "}
                  {assignment.courses.course_name}
                </CardDescription>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 justify-between">
            {getStatusBadge(assignment.status)}
            <div className="flex gap-0.5">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                title="Edit assignment"
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                title="Delete assignment"
                className="h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0">
        <p className="text-xs mb-2 text-muted-foreground line-clamp-2">
          {assignment.description}
        </p>

        {assignment.status !== "completed" && (
          <div className="mb-2">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-muted-foreground">
                {assignment.progress}%
              </span>
            </div>
            <Progress value={assignment.progress} className="h-1" />
            <div className="flex gap-0.5 mt-1 flex-wrap">
              {[0, 25, 50, 75, 100].map((value) => (
                <Button
                  key={value}
                  variant={
                    assignment.progress === value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => onProgressUpdate(assignment.id, value)}
                  className="h-5 px-1.5 text-[10px] cursor-pointer min-w-[35px]"
                >
                  {value}%
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 pt-0">
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center gap-1 text-xs flex-wrap">
            <div className="flex items-center gap-0.5">
              <CalendarIcon className="h-3 w-3" />
              <span className="whitespace-nowrap">
                Due: {new Date(assignment.due_date).toLocaleDateString()}
              </span>
            </div>
            <span
              className={`font-medium whitespace-nowrap ${
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

          <div className="flex gap-1">
            {assignment.status !== "completed" && (
              <Button
                size="sm"
                onClick={() => onProgressUpdate(assignment.id, 100)}
                className="cursor-pointer text-[10px] h-6"
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
              <label className="text-xs font-medium mb-1 block">Title</label>
              <input
                type="text"
                required
                value={assignment.title}
                onChange={(e) =>
                  onChange({ ...assignment, title: e.target.value })
                }
                className="w-full px-2 py-1.5 rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring text-xs"
                placeholder="Assignment title"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">
                Description
              </label>
              <textarea
                value={assignment.description}
                onChange={(e) =>
                  onChange({ ...assignment, description: e.target.value })
                }
                className="w-full px-2 py-1.5 rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring text-xs"
                placeholder="Assignment description"
                rows={3}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Course</label>
              <Select
                value={assignment.course_id}
                onValueChange={(value) =>
                  onChange({ ...assignment, course_id: value })
                }
              >
                <SelectTrigger className="text-xs h-8">
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
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Priority</label>
              <Select
                value={assignment.priority}
                onValueChange={(value) =>
                  onChange({ ...assignment, priority: value })
                }
              >
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" className="text-xs">
                    Low
                  </SelectItem>
                  <SelectItem value="medium" className="text-xs">
                    Medium
                  </SelectItem>
                  <SelectItem value="high" className="text-xs">
                    High
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 cursor-pointer text-xs h-8"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 cursor-pointer text-xs h-8"
            onClick={onSubmit}
          >
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
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded-md" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-12 rounded" />
                  <Skeleton className="h-4 w-6 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full rounded" />
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1 rounded" />
              <Skeleton className="h-8 flex-1 rounded" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="p-3">
                <div className="flex flex-col gap-2">
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                  <div className="flex items-center gap-1 justify-between">
                    <Skeleton className="h-4 w-12 rounded" />
                    <div className="flex gap-0.5">
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <Skeleton className="h-3 w-full rounded mb-2" />
                <Skeleton className="h-1 w-full rounded" />
              </CardContent>
              <CardFooter className="p-3 pt-0">
                <div className="flex flex-col gap-1 w-full">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-6 w-20 rounded" />
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
        <div className="flex h-14 items-center gap-3 px-4">
          <div className="lg:hidden">
            <MobileSidebarTrigger />
          </div>
          <div className="hidden lg:block">
            <SidebarTrigger />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Assignments</h1>
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
