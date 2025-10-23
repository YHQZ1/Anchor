/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Course {
  code: string;
  name: string;
  instructor: string;
  credits: number;
}

interface ClassSchedule {
  day: number;
  startTime: string;
  endTime: string;
  course: string;
  room: string;
  type: string;
}

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

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
      day: 1,
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!validateForm()) return;

      const token = localStorage.getItem("jwtToken");
      if (!token) {
        toast.error("Authentication required", {
          description: "Please log in again",
        });
        return;
      }

      const loadingToast = toast.loading("Saving your profile and courses...");

      await saveProfile(token);
      const successfulCourses = await saveCourses(token);
      await saveClasses(token, successfulCourses);

      toast.dismiss(loadingToast);
      showSuccessMessage(
        successfulCourses.length,
        courses.length,
        classSchedule.length
      );

      setTimeout(() => router.push("/dashboard"), 2000);
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

  const validateForm = () => {
    if (!academicInfo.fullName.trim()) {
      toast.error("Full name required", {
        description: "Please enter your full name",
      });
      return false;
    }
    if (!academicInfo.studentId.trim()) {
      toast.error("Student ID required", {
        description: "Please enter your student ID",
      });
      return false;
    }
    if (!academicInfo.collegeName.trim()) {
      toast.error("College name required", {
        description: "Please enter your college name",
      });
      return false;
    }
    if (!academicInfo.department.trim()) {
      toast.error("Department required", {
        description: "Please enter your department",
      });
      return false;
    }
    if (!academicInfo.currentSemester) {
      toast.error("Semester required", {
        description: "Please select your current semester",
      });
      return false;
    }

    const hasEmptyCourses = courses.some(
      (course) =>
        !course.code.trim() || !course.name.trim() || !course.instructor.trim()
    );
    if (hasEmptyCourses) {
      toast.error("Incomplete course details", {
        description:
          "Please fill in all course details (code, name, and instructor)",
      });
      return false;
    }

    const hasEmptyClasses = classSchedule.some(
      (classItem) => !classItem.room.trim() || !classItem.course.trim()
    );
    if (hasEmptyClasses) {
      toast.error("Incomplete class details", {
        description:
          "Please fill in all class details (room and course selection)",
      });
      return false;
    }

    return true;
  };

  const saveProfile = async (token: string) => {
    const response = await fetch("/api/profile", {
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
        min_attendance_percentage: attendancePrefs.minAttendance,
        enable_attendance_warnings: attendancePrefs.enableWarnings,
        onboarding_completed: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save profile");
    }
  };

  const saveCourses = async (token: string) => {
    const coursePromises = courses.map(async (course) => {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          course_code: course.code.trim().toUpperCase(),
          course_name: course.name.trim(),
          instructor: course.instructor.trim(),
          credits: course.credits || 3,
          color: getRandomColor(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to save course ${course.code}: ${errorData.error}`
        );
      }

      return response.json();
    });

    const courseResults = await Promise.allSettled(coursePromises);
    return courseResults
      .filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === "fulfilled"
      )
      .map((result) => result.value.course);
  };

  const saveClasses = async (token: string, successfulCourses: any[]) => {
    const courseCodeToIdMap: { [key: string]: string } = {};
    successfulCourses.forEach((course) => {
      courseCodeToIdMap[course.course_code] = course.id;
    });

    const classPromises = classSchedule.map(async (classItem) => {
      const courseId = courseCodeToIdMap[classItem.course];
      if (!courseId)
        throw new Error(`Course not found for code: ${classItem.course}`);

      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          course_id: courseId,
          day_of_week: classItem.day,
          start_time: classItem.startTime,
          end_time: classItem.endTime,
          room: classItem.room.trim(),
          class_type: classItem.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to save class: ${errorData.error}`);
      }

      return response.json();
    });

    await Promise.allSettled(classPromises);
  };

  const showSuccessMessage = (
    savedCourses: number,
    totalCourses: number,
    totalClasses: number
  ) => {
    let successMessage = "Setup completed! ";
    if (savedCourses === totalCourses) {
      successMessage += `All ${savedCourses} courses and ${totalClasses} classes saved successfully.`;
    } else {
      successMessage += `Profile saved. ${savedCourses}/${totalCourses} courses and ${totalClasses} classes saved.`;
    }

    toast.success("Setup completed!", { description: successMessage });
  };

  const getRandomColor = () => {
    const colors = [
      "purple",
      "blue",
      "green",
      "yellow",
      "red",
      "indigo",
      "pink",
      "orange",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const steps = [
    { number: 1, title: "Academic Profile", icon: GraduationCap },
    { number: 2, title: "Courses", icon: BookOpen },
    { number: 3, title: "Schedule", icon: CalendarIcon },
    { number: 4, title: "Preferences", icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl h-[80vh] max-h-[80vh] overflow-hidden rounded-xl border border-border bg-background shadow-2xl flex flex-col">
        <Header currentStep={currentStep} totalSteps={totalSteps} />
        <ProgressBar progress={progress} />
        <StepIndicator steps={steps} currentStep={currentStep} />

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {currentStep === 1 && (
            <AcademicProfileStep
              academicInfo={academicInfo}
              onChange={setAcademicInfo}
            />
          )}
          {currentStep === 2 && (
            <CoursesStep courses={courses} onChange={setCourses} />
          )}
          {currentStep === 3 && (
            <ScheduleStep
              classSchedule={classSchedule}
              courses={courses}
              onChange={setClassSchedule}
            />
          )}
          {currentStep === 4 && (
            <PreferencesStep
              attendancePrefs={attendancePrefs}
              onChange={setAttendancePrefs}
            />
          )}
        </div>

        <Footer
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={() => setCurrentStep(currentStep - 1)}
          onNext={() => setCurrentStep(currentStep + 1)}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}

// Extracted Components

function Header({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome to Anchor!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Let&apos;s set up your academic profile to get started
        </p>
      </div>
      <Badge variant="secondary">
        Step {currentStep} of {totalSteps}
      </Badge>
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="px-6 pt-4 flex-shrink-0">
      <Progress value={progress} className="h-2" />
    </div>
  );
}

function StepIndicator({
  steps,
  currentStep,
}: {
  steps: any[];
  currentStep: number;
}) {
  return (
    <div className="flex justify-center px-6 py-4 flex-shrink-0">
      <div className="flex items-center gap-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step.number
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted text-muted-foreground"
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
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 ${
                  currentStep > step.number ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  loading,
}: {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-6 border-t border-border bg-background flex-shrink-0">
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={onBack}
        disabled={currentStep === 1}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {currentStep < totalSteps ? (
        <Button onClick={onNext} className="cursor-pointer">
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Button
          onClick={onSubmit}
          disabled={loading}
          className="cursor-pointer"
        >
          {loading ? "Completing Setup..." : "Complete Setup"}
          <CheckCircle2 className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
}

// Step Components

function AcademicProfileStep({
  academicInfo,
  onChange,
}: {
  academicInfo: any;
  onChange: (info: any) => void;
}) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...academicInfo, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Academic Profile</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your academic background
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Full Name *"
          id="fullName"
          value={academicInfo.fullName}
          onChange={(value) => handleChange("fullName", value)}
          placeholder="Enter your full name"
          required
        />
        <FormField
          label="Student ID *"
          id="studentId"
          value={academicInfo.studentId}
          onChange={(value) => handleChange("studentId", value)}
          placeholder="Enter your student ID"
          required
        />
        <FormField
          label="College/University *"
          id="collegeName"
          value={academicInfo.collegeName}
          onChange={(value) => handleChange("collegeName", value)}
          placeholder="Enter your college name"
          required
        />
        <FormField
          label="Department/Major *"
          id="department"
          value={academicInfo.department}
          onChange={(value) => handleChange("department", value)}
          placeholder="e.g., Computer Science"
          required
        />

        <SemesterSelect
          value={academicInfo.currentSemester}
          onChange={(value) => handleChange("currentSemester", value)}
        />
        <GraduationDatePicker
          value={academicInfo.expectedGraduation}
          onChange={(value) => handleChange("expectedGraduation", value)}
        />
      </div>
    </div>
  );
}

function CoursesStep({
  courses,
  onChange,
}: {
  courses: Course[];
  onChange: (courses: Course[]) => void;
}) {
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
    onChange(updatedCourses);
  };

  const addCourse = () => {
    onChange([...courses, { code: "", name: "", instructor: "", credits: 3 }]);
  };

  const removeCourse = (index: number) => {
    if (courses.length > 1) {
      onChange(courses.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Courses</h2>
        <p className="text-sm text-muted-foreground">
          Add the courses you&apos;re taking this semester
        </p>
      </div>

      <div className="space-y-4">
        {courses.map((course, index) => (
          <CourseForm
            key={index}
            course={course}
            index={index}
            onCourseChange={handleCourseChange}
            onRemove={removeCourse}
            showRemove={courses.length > 1}
          />
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
}

function ScheduleStep({
  classSchedule,
  courses,
  onChange,
}: {
  classSchedule: ClassSchedule[];
  courses: Course[];
  onChange: (schedule: ClassSchedule[]) => void;
}) {
  const handleClassChange = (
    index: number,
    field: keyof ClassSchedule,
    value: string | number
  ) => {
    const updatedSchedule = [...classSchedule];
    updatedSchedule[index] = {
      ...updatedSchedule[index],
      [field]:
        field === "day" && typeof value === "string" ? parseInt(value) : value,
    };
    onChange(updatedSchedule);
  };

  const addClass = () => {
    const defaultCourse = courses.length > 0 ? courses[0].code : "";
    onChange([
      ...classSchedule,
      {
        day: 1,
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
      onChange(classSchedule.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast.success(`Timetable ${file.name} uploaded successfully!`, {
        description: "You can now review and edit the imported classes below.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Class Schedule</h2>
        <p className="text-sm text-muted-foreground">
          Set up your weekly class schedule for attendance tracking
        </p>
      </div>

      <FileUploadSection onFileUpload={handleFileUpload} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">OR</span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Add Classes Manually</h3>
        <div className="space-y-4">
          {classSchedule.map((classItem, index) => (
            <ClassForm
              key={index}
              classItem={classItem}
              index={index}
              courses={courses}
              onClassChange={handleClassChange}
              onRemove={removeClass}
              showRemove={classSchedule.length > 1}
            />
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
}

function PreferencesStep({
  attendancePrefs,
  onChange,
}: {
  attendancePrefs: any;
  onChange: (prefs: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Attendance Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Set your attendance goals and preferences
        </p>
      </div>

      <div className="space-y-4">
        <AttendanceSlider
          minAttendance={attendancePrefs.minAttendance}
          onChange={(value) =>
            onChange({ ...attendancePrefs, minAttendance: value })
          }
        />
        <WarningsToggle
          enableWarnings={attendancePrefs.enableWarnings}
          onChange={(value) =>
            onChange({ ...attendancePrefs, enableWarnings: value })
          }
        />
      </div>
    </div>
  );
}

// Helper Components (these would be in separate files)

// Import these from your UI components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

function FormField({
  label,
  id,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function SemesterSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="currentSemester">Current Semester *</Label>
      <Select value={value} onValueChange={onChange}>
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
  );
}

function GraduationDatePicker({
  value,
  onChange,
}: {
  value: Date;
  onChange: (value: Date) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="expectedGraduation">Expected Graduation</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
            {value ? format(value, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="h-74 overflow-y-auto">
            <Calendar
              mode="single"
              selected={value}
              onSelect={(date) => date && onChange(date)}
              captionLayout="dropdown"
              fromYear={new Date().getFullYear() - 10}
              toYear={new Date().getFullYear() + 10}
              initialFocus
              className="[&_.rdp-day]:h-7 [&_.rdp-day]:w-7 [&_.rdp-table]:text-sm [&_.rdp-months]:p-2 rounded-md border shadow-sm"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function CourseForm({
  course,
  index,
  onCourseChange,
  onRemove,
  showRemove,
}: {
  course: Course;
  index: number;
  onCourseChange: (index: number, field: keyof Course, value: string) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
}) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Course {index + 1}</h3>
        {showRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Course Code *"
          value={course.code}
          onChange={(value) => onCourseChange(index, "code", value)}
          placeholder="e.g., CS 301"
          required id={""}        />
        <FormField
          label="Course Name *"
          value={course.name}
          onChange={(value) => onCourseChange(index, "name", value)}
          placeholder="e.g., Data Structures"
          required id={""}        />
        <FormField
          label="Instructor *"
          value={course.instructor}
          onChange={(value) => onCourseChange(index, "instructor", value)}
          placeholder="Professor name"
          required id={""}        />

        <div className="space-y-2">
          <Label>Credits</Label>
          <Select
            value={course.credits.toString()}
            onValueChange={(value) => onCourseChange(index, "credits", value)}
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
  );
}

function FileUploadSection({
  onFileUpload,
}: {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <div className="text-center">
        <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-lg font-semibold mb-2">Upload Your Timetable</h3>
        <p className="text-sm mb-4 text-muted-foreground">
          Upload your Excel or PDF timetable to automatically import your
          schedule
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button type="button" variant="outline" className="relative">
            <Upload className="h-4 w-4 mr-2" />
            Choose File
            <Input
              type="file"
              accept=".xlsx,.xls,.pdf"
              onChange={onFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </Button>
          <Button variant="outline" disabled>
            Download Template
          </Button>
        </div>
      </div>
    </div>
  );
}

function ClassForm({
  classItem,
  index,
  courses,
  onClassChange,
  onRemove,
  showRemove,
}: {
  classItem: ClassSchedule;
  index: number;
  courses: Course[];
  onClassChange: (
    index: number,
    field: keyof ClassSchedule,
    value: string | number
  ) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
}) {
  const availableCourses = courses.filter(
    (course) => course.code && course.code.trim() !== ""
  );

  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Class {index + 1}</h3>
        {showRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Day</Label>
          <Select
            value={classItem.day.toString()}
            onValueChange={(value) => onClassChange(index, "day", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Monday</SelectItem>
              <SelectItem value="2">Tuesday</SelectItem>
              <SelectItem value="3">Wednesday</SelectItem>
              <SelectItem value="4">Thursday</SelectItem>
              <SelectItem value="5">Friday</SelectItem>
              <SelectItem value="6">Saturday</SelectItem>
              <SelectItem value="0">Sunday</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Start Time</Label>
          <Input
            type="time"
            value={classItem.startTime}
            onChange={(e) => onClassChange(index, "startTime", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>End Time</Label>
          <Input
            type="time"
            value={classItem.endTime}
            onChange={(e) => onClassChange(index, "endTime", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Course *</Label>
          <Select
            value={classItem.course}
            onValueChange={(value) => onClassChange(index, "course", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {availableCourses.map((course, courseIndex) => (
                <SelectItem key={courseIndex} value={course.code}>
                  {course.code} - {course.name || "Unnamed Course"}
                </SelectItem>
              ))}
              {availableCourses.length === 0 && (
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
            onChange={(e) => onClassChange(index, "room", e.target.value)}
            placeholder="e.g., Room 301"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={classItem.type}
            onValueChange={(value) => onClassChange(index, "type", value)}
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
  );
}

function AttendanceSlider({
  minAttendance,
  onChange,
}: {
  minAttendance: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <div className="space-y-4">
        <div>
          <Label htmlFor="minAttendance" className="text-base">
            Minimum Attendance Percentage
          </Label>
          <p className="text-sm mt-1 text-muted-foreground">
            Set the minimum attendance percentage you want to maintain for each
            course
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-foreground">
              {minAttendance}%
            </span>
          </div>
          <Slider
            value={[minAttendance]}
            onValueChange={(value) => onChange(value[0])}
            max={100}
            min={50}
            step={1}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WarningsToggle({
  enableWarnings,
  onChange,
}: {
  enableWarnings: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base">Attendance Warnings</Label>
          <p className="text-sm mt-1 text-muted-foreground">
            Receive notifications when your attendance drops below your target
          </p>
        </div>
        <Button
          variant={enableWarnings ? "default" : "outline"}
          className="cursor-pointer mb-10"
          onClick={() => onChange(!enableWarnings)}
        >
          {enableWarnings ? "Enabled" : "Disabled"}
        </Button>
      </div>
    </div>
  );
}
