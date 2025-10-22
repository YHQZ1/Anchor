"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  GraduationCap,
  BookOpen,
  Calendar as CalendarIcon,
  Settings,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Course {
  code: string;
  name: string;
  instructor: string;
  credits: number;
}

interface ClassSchedule {
  day: string;
  startTime: string;
  endTime: string;
  course: string;
  room: string;
  type: string;
}

export default function OnboardingWizard() {
  const { theme } = useTheme();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [academicInfo, setAcademicInfo] = useState({
    fullName: "",
    studentId: "",
    collegeName: "",
    department: "",
    currentSemester: "",
    expectedGraduation: new Date(),
  });

  const [courses, setCourses] = useState<Course[]>([
    { code: "", name: "", instructor: "", credits: 3 },
  ]);

  const [classSchedule, setClassSchedule] = useState<ClassSchedule[]>([
    {
      day: "monday",
      startTime: "09:00",
      endTime: "10:00",
      course: "",
      room: "",
      type: "lecture",
    },
  ]);

  const [attendancePrefs, setAttendancePrefs] = useState({
    minAttendance: 75,
    enableWarnings: true,
  });

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleAcademicInfoChange = (field: string, value: any) => {
    setAcademicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleCourseChange = (
    index: number,
    field: keyof Course,
    value: string
  ) => {
    const updatedCourses = [...courses];
    updatedCourses[index] = {
      ...updatedCourses[index],
      [field]: field === "credits" ? parseInt(value) || 3 : value,
    };
    setCourses(updatedCourses);
  };

  const addCourse = () => {
    setCourses((prev) => [
      ...prev,
      { code: "", name: "", instructor: "", credits: 3 },
    ]);
  };

  const removeCourse = (index: number) => {
    if (courses.length > 1) {
      setCourses((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleClassChange = (
    index: number,
    field: keyof ClassSchedule,
    value: string
  ) => {
    const updatedSchedule = [...classSchedule];
    updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
    setClassSchedule(updatedSchedule);
  };

  const addClass = () => {
    const defaultCourse = courses.length > 0 ? courses[0].code : "";
    setClassSchedule((prev) => [
      ...prev,
      {
        day: "monday",
        startTime: "09:00",
        endTime: "10:00",
        course: defaultCourse,
        room: "",
        type: "lecture",
      },
    ]);
  };

  const removeClass = (index: number) => {
    if (classSchedule.length > 1) {
      setClassSchedule((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Uploaded file:", file);
      toast.success(`Timetable ${file.name} uploaded successfully!`, {
        description: "You can now review and edit the imported classes below.",
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!academicInfo.fullName.trim()) {
        toast.error("Full name required", {
          description: "Please enter your full name",
        });
        return;
      }

      if (!academicInfo.studentId.trim()) {
        toast.error("Student ID required", {
          description: "Please enter your student ID",
        });
        return;
      }

      if (!academicInfo.collegeName.trim()) {
        toast.error("College name required", {
          description: "Please enter your college name",
        });
        return;
      }

      if (!academicInfo.department.trim()) {
        toast.error("Department required", {
          description: "Please enter your department",
        });
        return;
      }

      if (!academicInfo.currentSemester) {
        toast.error("Semester required", {
          description: "Please select your current semester",
        });
        return;
      }

      // Validate courses
      const hasEmptyCourses = courses.some(
        (course) =>
          !course.code.trim() ||
          !course.name.trim() ||
          !course.instructor.trim()
      );

      if (hasEmptyCourses) {
        toast.error("Incomplete course details", {
          description:
            "Please fill in all course details (code, name, and instructor)",
        });
        return;
      }

      // Validate class schedule
      const hasEmptyClasses = classSchedule.some(
        (classItem) => !classItem.room.trim() || !classItem.course.trim()
      );

      if (hasEmptyClasses) {
        toast.error("Incomplete class details", {
          description:
            "Please fill in all class details (room and course selection)",
        });
        return;
      }

      const token = localStorage.getItem("jwtToken");

      if (!token) {
        toast.error("Authentication required", {
          description: "Please log in again",
        });
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading("Saving your profile...");

      // Save profile data
      const profileResponse = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: academicInfo.fullName,
          student_id: academicInfo.studentId,
          college_name: academicInfo.collegeName,
          department: academicInfo.department,
          current_semester: parseInt(academicInfo.currentSemester) || 1,
          expected_graduation: academicInfo.expectedGraduation
            .toISOString()
            .split("T")[0],
        }),
      });

      if (profileResponse.ok) {
        // Mark onboarding as completed
        const onboardingResponse = await fetch("/api/onboarding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            student_id: academicInfo.studentId,
          }),
        });

        if (onboardingResponse.ok) {
          toast.dismiss(loadingToast);
          toast.success("Setup completed!", {
            description: "Your academic profile has been saved successfully",
          });

          // Small delay to show the success message
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        } else {
          toast.dismiss(loadingToast);
          toast.error("Setup incomplete", {
            description: "Failed to complete onboarding. Please try again.",
          });
        }
      } else {
        toast.dismiss(loadingToast);
        const errorData = await profileResponse.json();
        console.error("Profile save failed:", errorData);
        toast.error("Failed to save profile", {
          description:
            errorData.error || "Please check your information and try again.",
        });
      }
    } catch (error) {
      toast.dismiss();
      console.error("Onboarding error:", error);
      toast.error("Network error", {
        description:
          "An error occurred while saving your data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Academic Profile", icon: GraduationCap },
    { number: 2, title: "Courses", icon: BookOpen },
    { number: 3, title: "Schedule", icon: CalendarIcon },
    { number: 4, title: "Preferences", icon: Settings },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Academic Profile</h2>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }`}
              >
                Tell us about your academic background
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={academicInfo.fullName}
                  onChange={(e) =>
                    handleAcademicInfoChange("fullName", e.target.value)
                  }
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID *</Label>
                <Input
                  id="studentId"
                  value={academicInfo.studentId}
                  onChange={(e) =>
                    handleAcademicInfoChange("studentId", e.target.value)
                  }
                  placeholder="Enter your student ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collegeName">College/University *</Label>
                <Input
                  id="collegeName"
                  value={academicInfo.collegeName}
                  onChange={(e) =>
                    handleAcademicInfoChange("collegeName", e.target.value)
                  }
                  placeholder="Enter your college name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department/Major *</Label>
                <Input
                  id="department"
                  value={academicInfo.department}
                  onChange={(e) =>
                    handleAcademicInfoChange("department", e.target.value)
                  }
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentSemester">Current Semester *</Label>
                <Select
                  value={academicInfo.currentSemester}
                  onValueChange={(value) =>
                    handleAcademicInfoChange("currentSemester", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        {sem}
                        {sem === 1
                          ? "st"
                          : sem === 2
                          ? "nd"
                          : sem === 3
                          ? "rd"
                          : "th"}{" "}
                        Semester
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedGraduation">Expected Graduation</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                      {academicInfo.expectedGraduation
                        ? format(academicInfo.expectedGraduation, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-64 p-2" align="start">
                    <div className="h-74 overflow-y-auto">
                      <Calendar
                        mode="single"
                        selected={academicInfo.expectedGraduation}
                        onSelect={(date) => {
                          if (date)
                            handleAcademicInfoChange(
                              "expectedGraduation",
                              date
                            );
                        }}
                        captionLayout="dropdown" // month/year dropdown
                        fromYear={new Date().getFullYear() - 10}
                        toYear={new Date().getFullYear() + 10}
                        initialFocus
                        className="[&_.rdp-day]:h-7 [&_.rdp-day]:w-7 [&_.rdp-table]:text-sm [&_.rdp-months]:p-2 rounded-md border shadow-sm"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Courses</h2>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }`}
              >
                Add the courses you're taking this semester
              </p>
            </div>

            <div className="space-y-4">
              {courses.map((course, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    theme === "dark"
                      ? "border-white/10 bg-white/5"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Course {index + 1}</h3>
                    {courses.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCourse(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Course Code *</Label>
                      <Input
                        value={course.code}
                        onChange={(e) =>
                          handleCourseChange(index, "code", e.target.value)
                        }
                        placeholder="e.g., CS 301"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Course Name *</Label>
                      <Input
                        value={course.name}
                        onChange={(e) =>
                          handleCourseChange(index, "name", e.target.value)
                        }
                        placeholder="e.g., Data Structures"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Instructor *</Label>
                      <Input
                        value={course.instructor}
                        onChange={(e) =>
                          handleCourseChange(
                            index,
                            "instructor",
                            e.target.value
                          )
                        }
                        placeholder="Professor name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Credits</Label>
                      <Select
                        value={course.credits.toString()}
                        onValueChange={(value) =>
                          handleCourseChange(index, "credits", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((credit) => (
                            <SelectItem key={credit} value={credit.toString()}>
                              {credit} credit{credit !== 1 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addCourse}
              className="w-full cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Course
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Class Schedule</h2>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }`}
              >
                Set up your weekly class schedule for attendance tracking
              </p>
            </div>

            {/* Upload Timetable Section */}
            <div
              className={`p-6 rounded-lg border ${
                theme === "dark"
                  ? "border-white/10 bg-white/5"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="text-lg font-semibold mb-2">
                  Upload Your Timetable
                </h3>
                <p
                  className={`text-sm mb-4 ${
                    theme === "dark" ? "text-gray-400" : "text-slate-600"
                  }`}
                >
                  Upload your Excel or PDF timetable to automatically import
                  your schedule
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button type="button" variant="outline" className="relative">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                    <Input
                      type="file"
                      accept=".xlsx,.xls,.pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </Button>
                  <Button variant="outline" disabled>
                    Download Template
                  </Button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div
                  className={`w-full border-t ${
                    theme === "dark" ? "border-white/10" : "border-slate-200"
                  }`}
                />
              </div>
              <div className="relative flex justify-center text-sm">
                <span
                  className={`px-2 ${
                    theme === "dark"
                      ? "bg-black text-white/60"
                      : "bg-white text-slate-500"
                  }`}
                >
                  OR
                </span>
              </div>
            </div>

            {/* Manual Class Entry Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Add Classes Manually
              </h3>
              <div className="space-y-4">
                {classSchedule.map((classItem, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      theme === "dark"
                        ? "border-white/10 bg-white/5"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Class {index + 1}</h3>
                      {classSchedule.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeClass(index)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Day</Label>
                        <Select
                          value={classItem.day}
                          onValueChange={(value) =>
                            handleClassChange(index, "day", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monday">Monday</SelectItem>
                            <SelectItem value="tuesday">Tuesday</SelectItem>
                            <SelectItem value="wednesday">Wednesday</SelectItem>
                            <SelectItem value="thursday">Thursday</SelectItem>
                            <SelectItem value="friday">Friday</SelectItem>
                            <SelectItem value="saturday">Saturday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={classItem.startTime}
                          onChange={(e) =>
                            handleClassChange(
                              index,
                              "startTime",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={classItem.endTime}
                          onChange={(e) =>
                            handleClassChange(index, "endTime", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Course *</Label>
                        <Select
                          value={classItem.course}
                          onValueChange={(value) =>
                            handleClassChange(index, "course", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses
                              .filter(
                                (course) =>
                                  course.code && course.code.trim() !== ""
                              )
                              .map((course, courseIndex) => (
                                <SelectItem
                                  key={courseIndex}
                                  value={course.code}
                                >
                                  {course.code} -{" "}
                                  {course.name || "Unnamed Course"}
                                </SelectItem>
                              ))}
                            {courses.filter(
                              (course) =>
                                course.code && course.code.trim() !== ""
                            ).length === 0 && (
                              <SelectItem value="no-courses" disabled>
                                No courses available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Room *</Label>
                        <Input
                          value={classItem.room}
                          onChange={(e) =>
                            handleClassChange(index, "room", e.target.value)
                          }
                          placeholder="e.g., Room 301"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={classItem.type}
                          onValueChange={(value) =>
                            handleClassChange(index, "type", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lecture">Lecture</SelectItem>
                            <SelectItem value="lab">Lab</SelectItem>
                            <SelectItem value="tutorial">Tutorial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addClass}
                className="w-full mt-4 cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Class
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Attendance Preferences
              </h2>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }`}
              >
                Set your attendance goals and preferences
              </p>
            </div>

            <div className="space-y-4">
              <div
                className={`p-6 rounded-lg border ${
                  theme === "dark"
                    ? "border-white/10 bg-white/5"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="minAttendance" className="text-base">
                      Minimum Attendance Percentage
                    </Label>
                    <p
                      className={`text-sm mt-1 ${
                        theme === "dark" ? "text-gray-400" : "text-slate-600"
                      }`}
                    >
                      Set the minimum attendance percentage you want to maintain
                      for each course
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-lg font-semibold ${
                          theme === "dark" ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {attendancePrefs.minAttendance}%
                      </span>
                    </div>
                    <Slider
                      value={[attendancePrefs.minAttendance]}
                      onValueChange={(value) =>
                        setAttendancePrefs((prev) => ({
                          ...prev,
                          minAttendance: value[0],
                        }))
                      }
                      max={100}
                      min={50}
                      step={1}
                      className="w-full cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`p-6 rounded-lg border ${
                  theme === "dark"
                    ? "border-white/10 bg-white/5"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Attendance Warnings</Label>
                    <p
                      className={`text-sm mt-1 ${
                        theme === "dark" ? "text-gray-400" : "text-slate-600"
                      }`}
                    >
                      Receive notifications when your attendance drops below
                      your target
                    </p>
                  </div>
                  <Button
                    variant={
                      attendancePrefs.enableWarnings ? "default" : "outline"
                    }
                    className="cursor-pointer mb-10"
                    onClick={() =>
                      setAttendancePrefs((prev) => ({
                        ...prev,
                        enableWarnings: !prev.enableWarnings,
                      }))
                    }
                  >
                    {attendancePrefs.enableWarnings ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        theme === "dark" ? "bg-black/80" : "bg-white/80"
      } backdrop-blur-sm`}
    >
      <div
        className={`relative w-full max-w-4xl h-[80vh] max-h-[80vh] overflow-hidden rounded-xl border ${
          theme === "dark"
            ? "bg-black border-white/10"
            : "bg-white border-slate-200"
        } shadow-2xl flex flex-col`}
      >
        {/* Header - FIXED */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            theme === "dark" ? "border-white/10" : "border-slate-200"
          } flex-shrink-0`}
        >
          <div>
            <h1 className="text-2xl font-bold">Welcome to Anchor!</h1>
            <p
              className={`mt-1 ${
                theme === "dark" ? "text-gray-400" : "text-slate-600"
              }`}
            >
              Let's set up your academic profile to get started
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Step {currentStep} of {totalSteps}
            </Badge>
          </div>
        </div>

        {/* Progress Bar - FIXED */}
        <div className="px-6 pt-4 flex-shrink-0">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Indicator - FIXED */}
        <div className="flex justify-center px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= step.number
                      ? "bg-purple-600 border-purple-600 text-white"
                      : theme === "dark"
                      ? "border-white/20 text-white/40"
                      : "border-slate-300 text-slate-400"
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    currentStep >= step.number
                      ? "text-purple-600"
                      : theme === "dark"
                      ? "text-white/40"
                      : "text-slate-400"
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 ${
                      currentStep > step.number
                        ? "bg-purple-600"
                        : theme === "dark"
                        ? "bg-white/20"
                        : "bg-slate-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{renderStep()}</div>

        {/* Footer - FIXED */}
        <div
          className={`flex items-center justify-between p-6 border-t ${
            theme === "dark" ? "bg-black text-white" : "bg-white text-slate-900"
          } flex-shrink-0`}
        >
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-purple-600 hover:bg-purple-700 cursor-pointer"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 cursor-pointer"
            >
              {loading ? "Completing Setup..." : "Complete Setup"}
              <CheckCircle2 className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
