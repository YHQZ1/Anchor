"use client";

import React from "react";
import { useTheme } from "next-themes";
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Download,
  Upload,
  Trash2,
  Save,
  ChevronRight,
} from "lucide-react";
import { SidebarTrigger } from "@/components/Sidebar";
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

interface Setting {
  title: string;
  description: string;
  type: "toggle" | "select" | "theme" | "button";
  value?: unknown;
  options?: string[];
  action?: string;
  icon?: unknown;
  destructive?: boolean;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("general");
  const searchParams = useSearchParams(); // Add this hook

  const [settings, setSettings] = React.useState({
    general: {
      autoSync: true,
      defaultView: "grid",
      weekStart: "monday",
    },
    notifications: {
      assignmentReminders: true,
      attendanceAlerts: true,
      emailNotifications: false,
      pushNotifications: true,
    },
    appearance: {
      compactMode: false,
      highContrast: false,
    },
    privacy: {
      dataCollection: false,
      autoLogout: true,
    },
  });

  React.useEffect(() => {
    setMounted(true);
    
    // Handle URL parameter when component mounts
    const section = searchParams.get('section');
    if (section && ['general', 'account', 'notifications', 'appearance', 'privacy', 'data'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]); // Add searchParams as dependency

  // Also add this useEffect to handle URL changes while component is mounted
  React.useEffect(() => {
    const section = searchParams.get('section');
    if (section && ['general', 'account', 'notifications', 'appearance', 'privacy', 'data'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  if (!mounted) return null;

  const settingsSections = [
    {
      id: "general",
      title: "General",
      icon: Settings,
      description: "Basic application settings",
    },
    {
      id: "account",
      title: "Account",
      icon: User,
      description: "Manage your account preferences",
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: Bell,
      description: "Configure alerts and reminders",
    },
    {
      id: "appearance",
      title: "Appearance",
      icon: Palette,
      description: "Customize look and feel",
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      icon: Shield,
      description: "Data and security settings",
    },
    {
      id: "data",
      title: "Data Management",
      icon: Database,
      description: "Import, export, and manage data",
    },
  ];

  const generalSettings: Setting[] = [
    {
      title: "Auto-sync with Moodle",
      description: "Automatically sync assignments and courses",
      type: "toggle",
      value: settings.general.autoSync,
    },
    {
      title: "Default Course View",
      description: "Choose how courses are displayed",
      type: "select",
      value: settings.general.defaultView,
      options: ["grid", "list", "calendar"],
    },
    {
      title: "Week Start Day",
      description: "First day of the week",
      type: "select",
      value: settings.general.weekStart,
      options: ["monday", "sunday"],
    },
  ];

  const notificationSettings: Setting[] = [
    {
      title: "Assignment Reminders",
      description: "Get notified about upcoming deadlines",
      type: "toggle",
      value: settings.notifications.assignmentReminders,
    },
    {
      title: "Attendance Alerts",
      description: "Notifications for attendance thresholds",
      type: "toggle",
      value: settings.notifications.attendanceAlerts,
    },
    {
      title: "Email Notifications",
      description: "Receive notifications via email",
      type: "toggle",
      value: settings.notifications.emailNotifications,
    },
    {
      title: "Push Notifications",
      description: "Browser push notifications",
      type: "toggle",
      value: settings.notifications.pushNotifications,
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
      value: settings.appearance.compactMode,
    },
    {
      title: "High Contrast",
      description: "Increase contrast for better readability",
      type: "toggle",
      value: settings.appearance.highContrast,
    },
  ];

  const privacySettings: Setting[] = [
    {
      title: "Data Collection",
      description: "Allow anonymous usage data collection",
      type: "toggle",
      value: settings.privacy.dataCollection,
    },
    {
      title: "Auto-logout",
      description: "Automatically logout after inactivity",
      type: "toggle",
      value: settings.privacy.autoLogout,
    },
    {
      title: "Clear Browser Data",
      description: "Remove all locally stored data",
      type: "button",
      action: "clearData",
    },
  ];

  const dataSettings: Setting[] = [
    {
      title: "Export Data",
      description: "Download your assignments and attendance data",
      type: "button",
      action: "exportData",
      icon: Download,
    },
    {
      title: "Import Data",
      description: "Import data from previous exports",
      type: "button",
      action: "importData",
      icon: Upload,
    },
    {
      title: "Clear All Data",
      description: "Permanently delete all your data",
      type: "button",
      action: "clearAllData",
      icon: Trash2,
      destructive: true,
    },
  ];

  const handleToggleChange = (section: string, key: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]:
          !prev[section as keyof typeof prev][
            key as keyof (typeof prev)[keyof typeof prev]
          ],
      },
    }));
  };

  const handleSelectChange = (section: string, key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const handleSaveChanges = () => {
    // Here you would typically send the settings to your backend
    console.log("Saving settings:", settings);
    // Add your save logic here (API call, etc.)
  };

  const renderSetting = (setting: Setting, index: number) => {
    switch (setting.type) {
      case "toggle":
        const toggleKey = Object.keys(
          settings[activeSection as keyof typeof settings] || {}
        )[index];
        return (
          <div className="flex items-center">
            <button
              onClick={() => handleToggleChange(activeSection, toggleKey)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                setting.value
                  ? theme === "dark"
                    ? "bg-purple-600"
                    : "bg-purple-600"
                  : theme === "dark"
                  ? "bg-gray-600"
                  : "bg-gray-300"
              } transition-colors`}
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
        const selectKey = Object.keys(
          settings[activeSection as keyof typeof settings] || {}
        )[index];
        return (
          <select
            value={setting.value as string}
            onChange={(e) =>
              handleSelectChange(activeSection, selectKey, e.target.value)
            }
            className={`px-3 py-2 rounded-lg border text-sm ${
              theme === "dark"
                ? "bg-white/5 border-white/10 text-white"
                : "bg-white border-slate-300 text-slate-900"
            }`}
          >
            {setting.options?.map((option: string) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        );

      case "theme":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => setTheme("light")}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                theme === "light"
                  ? theme === "dark"
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "bg-purple-600 border-purple-600 text-white"
                  : theme === "dark"
                  ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                theme === "dark"
                  ? theme === "dark"
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "bg-purple-600 border-purple-600 text-white"
                  : theme === "dark"
                  ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Dark
            </button>
          </div>
        );

      case "button":
        return (
          <button
            onClick={() => {
              // Handle button actions
              console.log(`Action: ${setting.action}`);
            }}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              setting.destructive
                ? theme === "dark"
                  ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                  : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                : theme === "dark"
                ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {setting.icon && <setting.icon className="h-4 w-4 inline mr-2" />}
            {setting.title}
          </button>
        );

      default:
        return null;
    }
  };

  const renderSettingsContent = () => {
    const settingsMap: Record<string, Setting[]> = {
      general: generalSettings,
      notifications: notificationSettings,
      appearance: appearanceSettings,
      privacy: privacySettings,
      data: dataSettings,
    };

    const currentSettings = settingsMap[activeSection] || [];

    return (
      <div className="space-y-6">
        {currentSettings.map((setting: Setting, index: number) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              theme === "dark"
                ? "border-white/10 bg-white/5"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex-1">
              <h3 className="font-medium mb-1">{setting.title}</h3>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }`}
              >
                {setting.description}
              </p>
            </div>
            <div className="ml-4">{renderSetting(setting, index)}</div>
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
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveChanges}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                theme === "dark"
                  ? "bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
                  : "bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              <Save className="h-4 w-4 inline mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{getActiveSectionTitle()}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Navigation Menu */}
        <div
          className={`rounded-xl border p-6 ${
            theme === "dark"
              ? "bg-white/5 border-white/10"
              : "bg-white border-slate-200"
          }`}
        >
          <NavigationMenu>
            <NavigationMenuList className="flex-wrap justify-start">
              {settingsSections.map((section) => (
                <NavigationMenuItem key={section.id}>
                  <NavigationMenuTrigger
                    onClick={() => setActiveSection(section.id)}
                    className={`cursor-pointer ${
                      activeSection === section.id
                        ? theme === "dark"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-purple-100 text-purple-700"
                        : ""
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

        {/* Settings Content */}
        <div
          className={`rounded-xl border p-6 ${
            theme === "dark"
              ? "bg-white/5 border-white/10"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                {getActiveSectionTitle()}
              </h2>
              <p
                className={`text-sm mt-1 ${
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }`}
              >
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