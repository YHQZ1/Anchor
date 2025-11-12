/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useTheme } from "next-themes";
import {
  Settings,
  Bell,
  Database,
  Palette,
  Download,
  Trash2,
  Save,
  ChevronRight,
  BookOpen,
  AlertTriangle,
  Zap,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { LucideProps } from "lucide-react";
import { SidebarTrigger, MobileSidebarTrigger } from "@/components/Sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface Setting {
  title: string;
  description: string;
  type: "toggle" | "select" | "slider" | "theme" | "button" | "status";
  value?: boolean | string | number;
  options?: string[];
  action?: string;
  icon?: React.ComponentType<LucideProps>;
  destructive?: boolean;
  requiresSetup?: boolean;
  status?: "connected" | "disconnected" | "syncing";
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

interface SettingsState {
  academic: {
    moodle_auto_sync: boolean;
    sync_frequency: string;
    min_attendance: number;
    warning_threshold: number;
  };
  notifications: {
    new_assignment_alerts: boolean;
    reminder_timing: string;
    attendance_warnings: boolean;
    submission_confirmations: boolean;
  };
  moodle: {
    status: "connected" | "disconnected" | "syncing";
    auto_submission: boolean;
    last_sync: string | null;
  };
  productivity: {
    weekly_overview: boolean;
    priority_method: string;
    study_suggestions: boolean;
  };
  appearance: {
    theme: string;
    compact_mode: boolean;
  };
  data: {
    export_format: string;
  };
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("academic");
  const [saving, setSaving] = React.useState(false);
  const searchParams = useSearchParams();

  const [settings, setSettings] = React.useState<SettingsState>({
    academic: {
      moodle_auto_sync: true,
      sync_frequency: "Every 2 hours",
      min_attendance: 75,
      warning_threshold: 10,
    },
    notifications: {
      new_assignment_alerts: true,
      reminder_timing: "1 day before",
      attendance_warnings: true,
      submission_confirmations: true,
    },
    moodle: {
      status: "disconnected",
      auto_submission: false,
      last_sync: null,
    },
    productivity: {
      weekly_overview: true,
      priority_method: "Due date",
      study_suggestions: false,
    },
    appearance: {
      theme: "system",
      compact_mode: false,
    },
    data: {
      export_format: "json",
    },
  });

  React.useEffect(() => {
    setMounted(true);
    const section = searchParams.get("section");
    if (
      section &&
      [
        "academic",
        "notifications",
        "moodle",
        "productivity",
        "appearance",
        "data",
      ].includes(section)
    ) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const simulateAPICall = () =>
    new Promise((resolve) => setTimeout(resolve, 800));

  const handleToggleChange = (section: keyof SettingsState, key: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !(prev[section] as any)[key],
      },
    }));
    toast.success("Setting updated");
  };

  const handleSelectChange = (
    section: keyof SettingsState,
    key: string,
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    toast.success("Setting updated");
  };

  const handleSliderChange = (
    section: keyof SettingsState,
    key: string,
    value: number[]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value[0],
      },
    }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    await simulateAPICall();
    setSaving(false);
    toast.success("All settings saved successfully!");
  };

  const handleAction = async (action: string) => {
    switch (action) {
      case "configure_moodle":
        toast.loading("Opening Moodle configuration...");
        await simulateAPICall();
        setSettings((prev) => ({
          ...prev,
          moodle: {
            ...prev.moodle,
            status: "connected",
            last_sync: new Date().toISOString(),
          },
        }));
        toast.success("Moodle connected successfully!");
        break;

      case "manage_courses":
        toast.info("Course management would open here");
        break;

      case "sync_now":
        setSettings((prev) => ({
          ...prev,
          moodle: { ...prev.moodle, status: "syncing" },
        }));
        await simulateAPICall();
        setSettings((prev) => ({
          ...prev,
          moodle: {
            ...prev.moodle,
            status: "connected",
            last_sync: new Date().toISOString(),
          },
        }));
        toast.success("Sync completed! 3 new assignments found.");
        break;

      case "export_data":
        toast.loading("Preparing your data export...");
        await simulateAPICall();
        toast.success(
          "Data exported successfully! Download will start automatically."
        );
        break;

      case "clear_cache":
        toast.loading("Clearing cache...");
        await simulateAPICall();
        toast.success("Cache cleared successfully!");
        break;

      case "delete_data":
        if (
          window.confirm(
            "Are you sure you want to delete all your data? This action cannot be undone."
          )
        ) {
          toast.loading("Deleting your data...");
          await simulateAPICall();
          toast.success("All data has been deleted successfully.");
        }
        break;

      default:
        toast.info(`Action: ${action}`);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 sm:h-16 items-center gap-4 px-4 sm:px-6">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-muted rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-5 w-24 sm:h-6 sm:w-32 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6">
          <div className="h-64 sm:h-96 bg-muted/20 rounded-xl animate-pulse"></div>
        </main>
      </div>
    );
  }

  const settingsSections = [
    {
      id: "academic",
      title: "Academic",
      icon: BookOpen,
      description: "Attendance goals and sync preferences",
    },
    {
      id: "moodle",
      title: "Moodle Integration",
      icon: Zap,
      description: "Connect and configure Moodle sync",
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: Bell,
      description: "Alerts and reminders",
    },
    {
      id: "productivity",
      title: "Productivity",
      icon: TrendingUp,
      description: "Workload management and insights",
    },
    {
      id: "appearance",
      title: "Appearance",
      icon: Palette,
      description: "Theme and display preferences",
    },
    {
      id: "data",
      title: "Data Management",
      icon: Database,
      description: "Export, import, and manage your data",
    },
  ];

  const academicSettings: Setting[] = [
    {
      title: "Moodle Auto-Sync",
      description: "Automatically sync assignments from Moodle",
      type: "toggle",
      value: settings.academic.moodle_auto_sync,
    },
    {
      title: "Sync Frequency",
      description: "How often to check for new assignments",
      type: "select",
      value: settings.academic.sync_frequency,
      options: [
        "Every 30 minutes",
        "Every 2 hours",
        "Every 6 hours",
        "Once daily",
      ],
    },
    {
      title: "Minimum Attendance %",
      description: "Target attendance percentage for each course",
      type: "slider",
      value: settings.academic.min_attendance,
      min: 50,
      max: 100,
      step: 5,
      suffix: "%",
    },
    {
      title: "Attendance Warning Threshold",
      description: "Alert me when attendance drops below target",
      type: "slider",
      value: settings.academic.warning_threshold,
      min: 5,
      max: 25,
      step: 5,
      suffix: "% below target",
    },
  ];

  const moodleSettings: Setting[] = [
    {
      title: "Moodle Connection",
      description:
        settings.moodle.status === "connected"
          ? `Connected - Last sync: ${
              settings.moodle.last_sync
                ? new Date(settings.moodle.last_sync).toLocaleTimeString()
                : "Never"
            }`
          : "Connect your Moodle account to sync assignments",
      type: "status",
      status: settings.moodle.status,
      action:
        settings.moodle.status === "connected"
          ? "sync_now"
          : "configure_moodle",
    },
    {
      title: "Auto-Submission",
      description:
        "Automatically submit assignments via Anchor (requires Moodle connection)",
      type: "toggle",
      value: settings.moodle.auto_submission,
      requiresSetup: settings.moodle.status !== "connected",
    },
    {
      title: "Manage Synced Courses",
      description: "Select which courses to track and sync",
      type: "button",
      action: "manage_courses",
    },
  ];

  const notificationSettings: Setting[] = [
    {
      title: "New Assignment Alerts",
      description: "Notify about new assignments from Moodle",
      type: "toggle",
      value: settings.notifications.new_assignment_alerts,
    },
    {
      title: "Deadline Reminders",
      description: "Remind before assignment due dates",
      type: "select",
      value: settings.notifications.reminder_timing,
      options: [
        "12 hours before",
        "1 day before",
        "2 days before",
        "1 week before",
      ],
    },
    {
      title: "Attendance Warnings",
      description: "Alert when attendance is at risk",
      type: "toggle",
      value: settings.notifications.attendance_warnings,
    },
    {
      title: "Submission Confirmations",
      description: "Confirm when assignments are submitted via Anchor",
      type: "toggle",
      value: settings.notifications.submission_confirmations,
    },
  ];

  const productivitySettings: Setting[] = [
    {
      title: "Weekly Workload Overview",
      description: "Show upcoming assignments for the week ahead",
      type: "toggle",
      value: settings.productivity.weekly_overview,
    },
    {
      title: "Assignment Priority",
      description: "How to sort and prioritize assignments",
      type: "select",
      value: settings.productivity.priority_method,
      options: [
        "Due date",
        "Course importance",
        "Estimated effort",
        "Custom order",
      ],
    },
    {
      title: "Study Time Suggestions",
      description: "Recommend optimal study sessions based on your schedule",
      type: "toggle",
      value: settings.productivity.study_suggestions,
    },
  ];

  const appearanceSettings: Setting[] = [
    {
      title: "Theme",
      description: "Choose between light and dark mode",
      type: "theme",
      value: theme,
    },
    {
      title: "Compact Mode",
      description: "Use compact spacing for dense information",
      type: "toggle",
      value: settings.appearance.compact_mode,
    },
  ];

  const dataSettings: Setting[] = [
    {
      title: "Export Academic Data",
      description: "Download assignments, attendance, and grades as JSON",
      type: "button",
      action: "export_data",
      icon: Download,
    },
    {
      title: "Clear Sync Cache",
      description: "Refresh all data from Moodle and clear local cache",
      type: "button",
      action: "clear_cache",
      icon: RefreshCw,
    },
    {
      title: "Delete All Data",
      description: "Permanently remove all your information from Anchor",
      type: "button",
      action: "delete_data",
      icon: Trash2,
      destructive: true,
    },
  ];

  const renderSetting = (setting: Setting, section: string) => {
    const sectionKey = section as keyof SettingsState;
    const sectionSettings = settings[sectionKey] as any;
    const settingKey =
      Object.keys(sectionSettings).find(
        (k) => sectionSettings[k] === setting.value
      ) || "";

    switch (setting.type) {
      case "toggle":
        return (
          <div className="flex items-center justify-end sm:justify-start">
            <button
              onClick={() => handleToggleChange(sectionKey, settingKey)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-none ${
                setting.value ? "bg-purple-600" : "bg-muted"
              } ${
                setting.requiresSetup
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              disabled={setting.requiresSetup}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  setting.value ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        );

      case "select":
        return (
          <select
            value={setting.value as string}
            onChange={(e) =>
              handleSelectChange(sectionKey, settingKey, e.target.value)
            }
            className="w-full sm:w-48 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm transition-none focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            {setting.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "slider":
        return (
          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {setting.value}
                {setting.suffix}
              </span>
            </div>
            <Slider
              value={[setting.value as number]}
              onValueChange={(value) =>
                handleSliderChange(sectionKey, settingKey, value)
              }
              max={setting.max}
              min={setting.min}
              step={setting.step}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {setting.min}
                {setting.suffix}
              </span>
              <span>
                {setting.max}
                {setting.suffix}
              </span>
            </div>
          </div>
        );

      case "theme":
        return (
          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
            <button
              onClick={() => setTheme("light")}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-none ${
                theme === "light"
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "border-input bg-background text-foreground hover:bg-accent cursor-pointer"
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-none ${
                theme === "dark"
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "border-input bg-background text-foreground hover:bg-accent cursor-pointer"
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-none ${
                theme === "system"
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "border-input bg-background text-foreground hover:bg-accent cursor-pointer"
              }`}
            >
              System
            </button>
          </div>
        );

      case "status":
        const statusText = setting.status
          ? setting.status.charAt(0).toUpperCase() + setting.status.slice(1)
          : "Unknown";
        return (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
            <div
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                setting.status === "connected"
                  ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400"
                  : setting.status === "syncing"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400"
              }`}
            >
              {setting.status === "connected" && (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {setting.status === "syncing" && (
                <RefreshCw className="h-4 w-4 animate-spin" />
              )}
              {setting.status === "disconnected" && (
                <XCircle className="h-4 w-4" />
              )}
              {statusText}
            </div>
            <Button
              onClick={() => handleAction(setting.action!)}
              variant="outline"
              className="w-full sm:w-32 cursor-pointer"
            >
              {setting.status === "connected" ? "Sync Now" : "Connect"}
            </Button>
          </div>
        );

      case "button":
        return (
          <Button
            onClick={() => handleAction(setting.action!)}
            variant={setting.destructive ? "destructive" : "outline"}
            className={`w-full sm:w-auto cursor-pointer ${
              setting.icon ? "gap-2" : ""
            }`}
          >
            {setting.icon && <setting.icon className="h-4 w-4" />}
            {setting.title}
          </Button>
        );

      default:
        return null;
    }
  };

  const renderSettingsContent = () => {
    const settingsMap: Record<string, Setting[]> = {
      academic: academicSettings,
      moodle: moodleSettings,
      notifications: notificationSettings,
      productivity: productivitySettings,
      appearance: appearanceSettings,
      data: dataSettings,
    };

    const currentSettings = settingsMap[activeSection] || [];

    return (
      <div className="space-y-4">
        {currentSettings.map((setting: Setting, index: number) => (
          <div
            key={index}
            className="flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-lg border border-border bg-card gap-4"
          >
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-base">{setting.title}</h3>
                {setting.requiresSetup && (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {setting.description}
                {setting.requiresSetup && (
                  <span className="text-yellow-600 dark:text-yellow-400 ml-1">
                    (Setup required)
                  </span>
                )}
              </p>
            </div>
            <div className="flex-shrink-0 w-full lg:w-auto">
              {renderSetting(setting, activeSection)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getActiveSectionTitle = () => {
    return (
      settingsSections.find((s) => s.id === activeSection)?.title || "Settings"
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 lg:h-16 items-center gap-4 px-4 lg:px-6">
          <div className="lg:hidden">
            <MobileSidebarTrigger />
          </div>
          <div className="hidden lg:block">
            <SidebarTrigger />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSaveChanges}
              disabled={saving}
              className="cursor-pointer"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-6 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-2 text-sm">
                <Settings className="h-4 w-4" />
                Settings
              </BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-sm">
                {getActiveSectionTitle()}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="rounded-xl border border-border p-0 lg:p-3">
          <div className="overflow-x-auto lg:overflow-visible">
            <NavigationMenu className="w-full justify-start">
              <NavigationMenuList className="flex flex-nowrap justify-start space-x-0 gap-2 w-max min-w-full lg:w-full lg:flex-wrap lg:min-w-0 pt-2 px-2 pb-3 lg:p-0">
                {settingsSections.map((section) => (
                  <NavigationMenuItem
                    key={section.id}
                    className="flex-shrink-0"
                  >
                    <NavigationMenuTrigger
                      onClick={() => setActiveSection(section.id)}
                      className={`whitespace-nowrap cursor-pointer ${
                        activeSection === section.id
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      <section.icon className="h-4 w-4 mr-2" />
                      {section.title}
                    </NavigationMenuTrigger>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                {getActiveSectionTitle()}
              </h2>
              <p className="text-sm mt-1 text-muted-foreground">
                {
                  settingsSections.find((s) => s.id === activeSection)
                    ?.description
                }
              </p>
            </div>
          </div>

          {renderSettingsContent()}
        </div>
      </main>
    </div>
  );
}

const TrendingUp = (props: LucideProps) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
