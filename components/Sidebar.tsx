"use client";

import * as React from "react";
import {
  BookOpen,
  Calendar,
  CheckSquare,
  Home,
  BarChart3,
  Settings,
  ChevronDown,
  Moon,
  Sun,
  User2,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Sidebar Context
interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined
);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

// SidebarProvider Component
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);

  const toggleSidebar = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

// SidebarTrigger Component
export function SidebarTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
      </svg>
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
}

// Main Sidebar Component
export function AppSidebar() {
  const { open } = useSidebar();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => setMounted(true), []);

  const menuItems = [
    { title: "Dashboard", url: "/pages/dashboard", icon: Home },
    { title: "Assignments", url: "/pages/assignments", icon: CheckSquare },
    { title: "Attendance", url: "/pages/attendance", icon: Calendar },
    { title: "Courses", url: "/pages/courses", icon: BookOpen },
    { title: "Analytics", url: "/pages/analytics", icon: BarChart3 },
    { title: "Settings", url: "/pages/settings", icon: Settings },
  ];

  const isActive = (url: string) => pathname === url;

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    router.push("/");
    alert("You have been logged out.");
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ${
        open ? "w-64" : "w-16"
      } ${
        theme === "dark"
          ? "bg-sidebar border-sidebar-border"
          : "bg-sidebar border-sidebar-border"
      } border-r`}
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        {open ? (
          <h1
            className={`text-xl font-bold ${
              theme === "dark" ? "text-purple-400" : "text-purple-600"
            }`}
          >
            Anchor
          </h1>
        ) : (
          <span
            className={`text-xl font-bold ${
              theme === "dark" ? "text-purple-400" : "text-purple-600"
            }`}
          >
            A
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col h-[calc(100vh-8rem)] overflow-y-auto px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.title}
              href={item.url}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.url)
                  ? theme === "dark"
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {open && <span className="truncate">{item.title}</span>}
            </a>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-3">
        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`flex w-full items-center cursor-pointer gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-2 ${
              theme === "dark"
                ? "text-sidebar-foreground hover:bg-sidebar-accent"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 shrink-0" />
            ) : (
              <Moon className="h-5 w-5 shrink-0" />
            )}
            {open && <span>Toggle Theme</span>}
          </button>
        )}

        {/* User Menu */}
        <div
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer ${
            theme === "dark"
              ? "text-sidebar-foreground hover:bg-sidebar-accent"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
        >
          <User2 className="h-5 w-5 shrink-0" />
          {open && (
            <>
              <div className="flex-1 truncate">
                <div className="font-medium">Student</div>
                <div className="text-xs text-sidebar-foreground/60">
                  student@example.com
                </div>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </>
          )}
        </div>
        {/* Logout Confirmation Dialog */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className={`flex w-full items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                theme === "dark"
                  ? "text-sidebar-foreground hover:bg-sidebar-accent"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {open && <span>Logout</span>}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to log out?
              </AlertDialogTitle>
              <AlertDialogDescription>
                You’ll be signed out of your account, and your session data will
                be cleared.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
              className="cursor-pointer"
                onClick={() => {
                  localStorage.removeItem("jwtToken");
                  router.replace("/");
                }}
              >
                Log out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}

// Sidebar Layout Wrapper
export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div
        className={`flex-1 overflow-auto transition-all duration-300 ${
          open ? "ml-64" : "ml-16"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
