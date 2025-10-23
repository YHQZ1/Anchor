"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  CheckSquare,
  Home,
  Settings,
  Moon,
  Sun,
  User,
  User2,
  LogOut,
  Bell,
  Shield,
  Archive,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

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
  if (!context)
    throw new Error("useSidebar must be used within SidebarProvider");
  return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  const toggleSidebar = React.useCallback(() => setOpen((prev) => !prev), []);
  return (
    <SidebarContext.Provider value={{ open, setOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function SidebarTrigger() {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9 hover:text-accent-foreground cursor-pointer"
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

const MENU_ITEMS = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Assignments", url: "/assignments", icon: CheckSquare },
  { title: "Attendance", url: "/attendance", icon: Calendar },
  { title: "Courses", url: "/courses", icon: BookOpen },
  { title: "Archives", url: "/archive", icon: Archive },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface UserData {
  name: string;
  email: string;
}

function SSRSafeDropdownMenu({ children, open }: { children: React.ReactNode; open: boolean }) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer text-sidebar-foreground">
        <User2 className="h-5 w-5 shrink-0" />
        {open && (
          <div className="flex-1 truncate">
            <div className="font-medium">Student</div>
            <div className="text-xs text-sidebar-foreground/60">
              student@example.com
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      {children}
    </DropdownMenu>
  );
}

function SSRSafeAlertDialog({ children, open }: { children: React.ReactNode; open: boolean }) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <button className="flex cursor-pointer w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground">
        <LogOut className="h-5 w-5 shrink-0" />
        {open && <span>Logout</span>}
      </button>
    );
  }

  return (
    <AlertDialog>
      {children}
    </AlertDialog>
  );
}

function ThemeAwareLogo() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc = !mounted 
    ? "/logo-light.png"
    : currentTheme === "dark" 
      ? "/logo-dark.png" 
      : "/logo-light.png";

  return (
    <div className="relative w-10 h-10 flex-shrink-0">
      <Image
        src={logoSrc}
        alt="Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}

function ThemeToggleButton({ open }: { open: boolean }) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="flex w-full items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium mb-2 text-sidebar-foreground hover:bg-sidebar-accent">
        <div className="h-5 w-5 shrink-0" />
        {open && <span>Toggle Theme</span>}
      </button>
    );
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex w-full items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium mb-2 text-sidebar-foreground hover:bg-sidebar-accent"
    >
      {isDark ? (
        <Sun className="h-5 w-5 shrink-0" />
      ) : (
        <Moon className="h-5 w-5 shrink-0" />
      )}
      {open && <span>Toggle Theme</span>}
    </button>
  );
}

export function AppSidebar() {
  const { open } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = React.useState<UserData>({
    name: "Student",
    email: "student@example.com",
  });

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) return;

        const response = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData({
            name: data.profile?.full_name || data.profile?.username || "Student",
            email: data.profile?.email || "student@example.com",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const isActive = (url: string) => pathname.startsWith(url);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-sidebar border-sidebar-border border-r transition-[width] duration-300 ${
        open ? "w-64" : "w-16"
      }`}
    >
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div
          className={`flex items-center ${
            open ? "justify-start gap-2 w-full" : "justify-center"
          }`}
        >
          <ThemeAwareLogo />
          {open && (
            <span className="text-3xl font-semibold tracking-wide">Anchor</span>
          )}
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-8rem)] overflow-y-auto px-3 py-4">
        <nav className="space-y-1">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.title}
              href={item.url}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                isActive(item.url)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {open && <span className="truncate">{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-3">
        <SSRSafeDropdownMenu open={open}>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent transition-none">
              <User2 className="h-5 w-5 shrink-0" />
              {open && (
                <div className="flex-1 truncate">
                  <div className="font-medium">{userData.name}</div>
                  <div className="text-xs text-sidebar-foreground/60">
                    {userData.email}
                  </div>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 transition-none" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer transition-none"
              onClick={() => router.push("/settings")}
            >
              <User className="h-4 w-4 mr-2" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer transition-none"
              onClick={() => router.push("/settings?section=account")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer transition-none"
              onClick={() => router.push("/settings?section=notifications")}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer transition-none"
              onClick={() => router.push("/settings?section=privacy")}
            >
              <Shield className="h-4 w-4 mr-2" />
              Privacy & Security
            </DropdownMenuItem>
          </DropdownMenuContent>
        </SSRSafeDropdownMenu>

        <ThemeToggleButton open={open} />

        <SSRSafeAlertDialog open={open}>
          <AlertDialogTrigger asChild>
            <button className="flex cursor-pointer w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent">
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
                You&apos;ll be signed out of your account, and your session data
                will be cleared.
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
        </SSRSafeAlertDialog>
      </div>
    </aside>
  );
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div
        className={`flex-1 overflow-auto transition-[margin] duration-300 ${
          open ? "ml-64" : "ml-16"
        }`}
      >
        {children}
      </div>
    </div>
  );
}