/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import {
  Archive,
  RotateCcw,
  Search,
  MoreVertical,
  Eye,
} from "lucide-react";
import { SidebarTrigger, MobileSidebarTrigger } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
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
import { useRouter } from "next/navigation";

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

export default function Archives() {
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [unarchiveConfirm, setUnarchiveConfirm] = useState<string | null>(null);
  const router = useRouter();

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

      toast.success("Course restored successfully", {
        description: "The course has been moved back to your active courses",
      });

      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err) {
      toast.error("Failed to restore course", {
        description: "Please try again",
      });
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
        <div className="flex h-14 sm:h-16 items-center gap-4 px-4 sm:px-6">
          <div className="lg:hidden">
            <MobileSidebarTrigger />
          </div>
          <div className="hidden lg:block">
            <SidebarTrigger />
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-semibold">Archived Courses</h1>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex-1 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border border-input bg-background max-w-md">
          <Search className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search archived courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
        onOpenChange={(open) =>
          setUnarchiveConfirm(open ? unarchiveConfirm : null)
        }
        onConfirm={() => unarchiveConfirm && handleUnarchive(unarchiveConfirm)}
      />
    </div>
  );
}

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
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg truncate">
              {archive.courses.course_name}
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {archive.courses.course_code}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 p-0 cursor-pointer">
                <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="text-xs sm:text-sm cursor-pointer">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onUnarchive}
                className="text-green-600 text-xs sm:text-sm cursor-pointer"
              >
                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Restore
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span>Instructor</span>
          <span className="font-medium truncate ml-2 max-w-[120px]">
            {archive.courses.instructor || "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span>Credits</span>
          <span className="font-medium">{archive.courses.credits}</span>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span>Archived</span>
          <span className="font-medium">{formatDate(archive.archived_at)}</span>
        </div>
        {archive.reason && (
          <div className="text-xs sm:text-sm">
            <span className="text-muted-foreground">Reason: </span>
            <span className="line-clamp-2">{archive.reason}</span>
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
      <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm sm:text-base">Restore Course</AlertDialogTitle>
          <AlertDialogDescription className="text-xs sm:text-sm">
            Are you sure you want to restore this course? It will be moved back
            to your active courses.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer text-xs sm:text-sm h-9 sm:h-10">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700 cursor-pointer text-xs sm:text-sm h-9 sm:h-10"
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
    <div className="text-center py-8 sm:py-12">
      <Archive className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
      <h3 className="text-base sm:text-lg font-medium mb-2">No archived courses</h3>
      <p className="text-xs sm:text-sm text-muted-foreground">
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
        <div className="flex h-14 sm:h-16 items-center gap-4 px-4 sm:px-6">
          <div className="lg:hidden">
            <MobileSidebarTrigger />
          </div>
          <div className="hidden lg:block">
            <SidebarTrigger />
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-semibold">Archived Courses</h1>
          </div>
        </div>
      </header>
      <main className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="h-9 sm:h-10 w-full max-w-md bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-4 sm:p-6 animate-pulse"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-32 sm:h-6 sm:w-40 bg-muted rounded" />
                  <div className="h-3 w-24 sm:h-4 sm:w-32 bg-muted rounded" />
                </div>
                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-muted rounded" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between">
                  <div className="h-3 w-16 sm:h-4 sm:w-20 bg-muted rounded" />
                  <div className="h-3 w-20 sm:h-4 sm:w-24 bg-muted rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-3 w-12 sm:h-4 sm:w-16 bg-muted rounded" />
                  <div className="h-3 w-8 sm:h-4 sm:w-12 bg-muted rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-3 w-16 sm:h-4 sm:w-20 bg-muted rounded" />
                  <div className="h-3 w-20 sm:h-4 sm:w-24 bg-muted rounded" />
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
        <div className="flex h-14 sm:h-16 items-center gap-4 px-4 sm:px-6">
          <div className="lg:hidden">
            <MobileSidebarTrigger />
          </div>
          <div className="hidden lg:block">
            <SidebarTrigger />
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-semibold">Archived Courses</h1>
          </div>
        </div>
      </header>
      <main className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-64 sm:h-96">
          <div className="text-center">
            <Archive className="h-8 w-8 sm:h-12 sm:w-12 text-destructive mx-auto mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold mb-2">
              Failed to load archives
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={onRetry} className="cursor-pointer text-xs sm:text-sm h-9 sm:h-10">Retry</Button>
          </div>
        </div>
      </main>
    </div>
  );
}