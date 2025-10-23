/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import {
  Archive,
  RotateCcw,
  Search,
  BookOpen,
  MoreVertical,
  Eye,
} from "lucide-react";
import { SidebarTrigger } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface ArchiveItem {
  id: string;
  course_id: string;
  archived_at: string;
  reason: string;
  notes: string;
  courses: {
    id: string;
    course_code: string;
    course_name: string;
    instructor: string;
    credits: number;
    color: string;
    created_at: string;
  };
}

export default function ArchivesPage() {
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [unarchiveConfirm, setUnarchiveConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token");

      const response = await fetch("/api/archives", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch archives");

      const data = await response.json();
      setArchives(data.archives || []);
    } catch (err) {
      setError("Failed to load archived courses");
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (archiveId: string) => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token");

      const response = await fetch(`/api/archives?id=${archiveId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to unarchive course");

      setArchives((prev) => prev.filter((archive) => archive.id !== archiveId));
      setUnarchiveConfirm(null);
    } catch (err) {
      setError("Failed to unarchive course");
    }
  };

  const filteredArchives = archives.filter(
    (archive) =>
      archive.courses.course_code
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      archive.courses.course_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      archive.courses.instructor
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <ArchivesSkeleton />;
  if (error) return <ErrorState error={error} onRetry={fetchArchives} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Archived Courses</h1>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search archived courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArchives.map((archive) => (
            <ArchiveCard
              key={archive.id}
              archive={archive}
              onUnarchive={() => setUnarchiveConfirm(archive.id)}
              formatDate={formatDate}
            />
          ))}
        </div>

        {filteredArchives.length === 0 && (
          <EmptyState hasSearchQuery={!!searchQuery} />
        )}
      </main>

      <UnarchiveDialog
        open={!!unarchiveConfirm}
        onOpenChange={(open) => setUnarchiveConfirm(open ? unarchiveConfirm : null)}
        onConfirm={() => unarchiveConfirm && handleUnarchive(unarchiveConfirm)}
      />
    </div>
  );
}

// Extracted Components

function ArchiveCard({
  archive,
  onUnarchive,
  formatDate,
}: {
  archive: ArchiveItem;
  onUnarchive: () => void;
  formatDate: (date: string) => string;
}) {
  return (
    <Card key={archive.id} className="relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {archive.courses.course_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {archive.courses.course_code}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onUnarchive}
                className="text-green-600"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span>Instructor</span>
          <span className="font-medium">
            {archive.courses.instructor || "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Credits</span>
          <span className="font-medium">{archive.courses.credits}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Archived</span>
          <span className="font-medium">{formatDate(archive.archived_at)}</span>
        </div>
        {archive.reason && (
          <div className="text-sm">
            <span className="text-muted-foreground">Reason: </span>
            <span>{archive.reason}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UnarchiveDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore Course</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to restore this course? It will be moved back
            to your active courses.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700"
          >
            Restore
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function EmptyState({ hasSearchQuery }: { hasSearchQuery: boolean }) {
  return (
    <div className="text-center py-12">
      <Archive className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
      <h3 className="text-lg font-medium mb-2">No archived courses</h3>
      <p className="text-sm text-muted-foreground">
        {hasSearchQuery
          ? "No courses match your search"
          : "Courses you archive will appear here"}
      </p>
    </div>
  );
}

function ArchivesSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Archived Courses</h1>
          </div>
        </div>
      </header>
      <main className="p-6 space-y-6">
        <div className="h-10 w-full max-w-md bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-6 animate-pulse"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
                <div className="h-8 w-8 bg-muted rounded" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-muted rounded" />
                  <div className="h-4 w-20 bg-muted rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-12 bg-muted rounded" />
                  <div className="h-4 w-8 bg-muted rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
              </div>
            </div>
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
            <h1 className="text-xl font-semibold">Archived Courses</h1>
          </div>
        </div>
      </header>
      <main className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Archive className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Failed to load archives
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={onRetry}>Retry</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
