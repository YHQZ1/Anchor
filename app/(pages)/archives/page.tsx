/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import {
  Archive,
  RotateCcw,
  Search,
  MoreVertical,
  Eye,
  AlertCircle,
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
  const [selectedArchive, setSelectedArchive] = useState<ArchiveItem | null>(
    null
  );
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

  const handleViewDetails = (archive: ArchiveItem) => {
    setSelectedArchive(archive);
    // You can implement a modal or navigation to details page here
    toast.info("View Details", {
      description: `Details for ${archive.courses.course_code} - ${archive.courses.course_name}`,
    });
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
            <h1 className="text-lg sm:text-xl font-semibold">
              Archived Courses
            </h1>
          </div>
        </div>
      </header>

      <main className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search archived courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 text-xs sm:text-sm h-9 sm:h-10 bg-background"
            />
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground self-end sm:self-center">
            {filteredArchives.length} of {archives.length} courses
          </div>
        </div>

        {/* Archive Cards Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {filteredArchives.map((archive) => (
            <ArchiveCard
              key={archive.id}
              archive={archive}
              onUnarchive={() => setUnarchiveConfirm(archive.id)}
              onViewDetails={() => handleViewDetails(archive)}
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
  onViewDetails,
  formatDate,
}: {
  archive: ArchiveItem;
  onUnarchive: () => void;
  onViewDetails: () => void;
  formatDate: (date: string) => string;
}) {
  return (
    <Card className="relative hover:shadow-md transition-shadow duration-200">
      <CardHeader className="p-3 sm:p-4 md:p-6 pb-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <CardTitle className="text-sm sm:text-base md:text-lg truncate mb-1">
              {archive.courses.course_name}
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {archive.courses.course_code}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 cursor-pointer flex-shrink-0"
              >
                <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 sm:w-48">
              <DropdownMenuItem
                onClick={onViewDetails}
                className="text-xs sm:text-sm cursor-pointer"
              >
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
      <CardContent className="p-3 sm:p-4 md:p-6 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Instructor</span>
          <span className="font-medium truncate ml-2 max-w-[100px] sm:max-w-[120px]">
            {archive.courses.instructor || "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Credits</span>
          <span className="font-medium">{archive.courses.credits}</span>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Archived</span>
          <span className="font-medium">{formatDate(archive.archived_at)}</span>
        </div>
        {archive.reason && (
          <div className="text-xs sm:text-sm pt-1 sm:pt-2 border-t border-border">
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
      <AlertDialogContent className="max-w-[90vw] sm:max-w-md mx-4 sm:mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm sm:text-base">
            Restore Course
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs sm:text-sm">
            Are you sure you want to restore this course? It will be moved back
            to your active courses.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel className="cursor-pointer text-xs sm:text-sm h-9 sm:h-10 w-full sm:w-auto mt-0">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700 cursor-pointer text-xs sm:text-sm h-9 sm:h-10 w-full sm:w-auto"
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
    <div className="text-center py-8 sm:py-12 md:py-16">
      <Archive className="h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
      <h3 className="text-base sm:text-lg md:text-xl font-medium mb-2">
        {hasSearchQuery ? "No courses found" : "No archived courses"}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
        {hasSearchQuery
          ? "Try adjusting your search terms"
          : "Courses you archive will appear here for future reference"}
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
            <h1 className="text-lg sm:text-xl font-semibold">
              Archived Courses
            </h1>
          </div>
        </div>
      </header>
      <main className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Search Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <div className="h-9 sm:h-10 w-full sm:max-w-md bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-3 sm:p-4 md:p-6 animate-pulse"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="space-y-2 flex-1 pr-2">
                  <div className="h-4 sm:h-5 w-3/4 bg-muted rounded" />
                  <div className="h-3 sm:h-4 w-1/2 bg-muted rounded" />
                </div>
                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-muted rounded flex-shrink-0" />
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
  title = "Failed to load data",
}: {
  error: string;
  onRetry: () => void;
  title?: string;
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
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        </div>
      </header>

      <main className="p-4">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
            <h2 className="text-sm font-semibold mb-1">{title}</h2>
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
