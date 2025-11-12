/* eslint-disable @typescript-eslint/no-unused-vars */
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
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";

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

interface OnboardingData {
  academicInfo: {
    fullName: string;
    studentId: string;
    collegeName: string;
    department: string;
    currentSemester: string;
    expectedGraduation: string | Date;
  };
  courses: Course[];
  classSchedule: ClassSchedule[];
  attendancePrefs: any;
  hasUploadedTimetable: boolean;
  timetableUploadId?: string;
  currentStep: number;
}

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasUploadedTimetable, setHasUploadedTimetable] = useState(false);
  const [uploadingTimetable, setUploadingTimetable] = useState(false);
  const [timetableUploadId, setTimetableUploadId] = useState<
    string | undefined
  >();

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

  useEffect(() => {
    setMounted(true);
    loadFromLocalStorage();
  }, []);

  const saveToLocalStorage = () => {
    const onboardingData: OnboardingData = {
      academicInfo,
      courses,
      classSchedule,
      attendancePrefs,
      hasUploadedTimetable,
      timetableUploadId,
      currentStep,
    };
    localStorage.setItem("onboarding_data", JSON.stringify(onboardingData));
  };

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem("onboarding_data");
    if (saved) {
      const data: OnboardingData = JSON.parse(saved);
      const onboardingData = {
        ...data,
        academicInfo: {
          ...data.academicInfo,
          expectedGraduation: new Date(data.academicInfo.expectedGraduation),
        },
      };

      setAcademicInfo(onboardingData.academicInfo);
      setCourses(onboardingData.courses);
      setClassSchedule(onboardingData.classSchedule);
      setAttendancePrefs(onboardingData.attendancePrefs);
      setHasUploadedTimetable(onboardingData.hasUploadedTimetable);
      setTimetableUploadId(onboardingData.timetableUploadId);
      setCurrentStep(onboardingData.currentStep);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("onboarding_data");
  };

  if (!mounted) return null;

  const getTotalSteps = () => (hasUploadedTimetable ? 3 : 5);
  const getCurrentStepNumber = () => {
    if (hasUploadedTimetable) {
      return currentStep === 5 ? 3 : currentStep;
    }
    return currentStep;
  };

  const totalSteps = getTotalSteps();
  const currentStepNumber = getCurrentStepNumber();
  const progress = (currentStepNumber / totalSteps) * 100;

  const steps = [
    { number: 1, title: "Academic Profile", icon: GraduationCap },
    { number: 2, title: "Timetable", icon: FileText },
    { number: 3, title: "Courses", icon: BookOpen },
    { number: 4, title: "Schedule", icon: CalendarIcon },
    { number: 5, title: "Preferences", icon: Settings },
  ];

  const handleNextStep = () => {
    saveToLocalStorage();
    if (currentStep === 2 && hasUploadedTimetable) {
      setCurrentStep(5);
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBackStep = () => {
    saveToLocalStorage();
    if (currentStep === 5 && hasUploadedTimetable) {
      setCurrentStep(2);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!validateForm()) return;

      const token = localStorage.getItem("jwtToken");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const loadingToast = toast.loading("Saving your profile...");
      await saveProfile(token);

      let successfulCourses = [];
      if (!hasUploadedTimetable) {
        successfulCourses = await saveCourses(token);
      }

      const timetableUploadIdToUse = hasUploadedTimetable
        ? timetableUploadId
        : undefined;
      await saveClasses(token, successfulCourses, timetableUploadIdToUse);

      toast.dismiss(loadingToast);
      showSuccessMessage(
        successfulCourses.length,
        courses.length,
        classSchedule.length
      );
      clearLocalStorage();

      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (error) {
      toast.dismiss();
      console.error("Onboarding error:", error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!academicInfo.fullName.trim()) {
      toast.error("Full name required");
      return false;
    }
    if (!academicInfo.studentId.trim()) {
      toast.error("Student ID required");
      return false;
    }
    if (!academicInfo.collegeName.trim()) {
      toast.error("College name required");
      return false;
    }
    if (!academicInfo.department.trim()) {
      toast.error("Department required");
      return false;
    }
    if (!academicInfo.currentSemester) {
      toast.error("Semester required");
      return false;
    }

    if (!hasUploadedTimetable) {
      const hasEmptyCourses = courses.some(
        (course) =>
          !course.code.trim() ||
          !course.name.trim() ||
          !course.instructor.trim()
      );
      if (hasEmptyCourses) {
        toast.error("Incomplete course details");
        return false;
      }

      const hasEmptyClasses = classSchedule.some(
        (classItem) => !classItem.room.trim() || !classItem.course.trim()
      );
      if (hasEmptyClasses) {
        toast.error("Incomplete class details");
        return false;
      }
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

  const saveClasses = async (
    token: string,
    successfulCourses: any[],
    timetableUploadId?: string
  ) => {
    const courseCodeToIdMap: { [key: string]: string } = {};
    successfulCourses.forEach((course) => {
      courseCodeToIdMap[course.course_code] = course.id;
    });

    const classPromises = classSchedule.map(async (classItem) => {
      const courseId = courseCodeToIdMap[classItem.course];
      if (!courseId)
        throw new Error(`Course not found for code: ${classItem.course}`);

      const classData: any = {
        course_id: courseId,
        day_of_week: classItem.day,
        start_time: classItem.startTime,
        end_time: classItem.endTime,
        room: classItem.room.trim(),
        class_type: classItem.type,
      };

      if (timetableUploadId) {
        classData.source = "upload";
        classData.timetable_upload_id = timetableUploadId;
      } else {
        classData.source = "manual";
      }

      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(classData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to save class: ${errorData.error}`);
      }

      return response.json();
    });

    await Promise.allSettled(classPromises);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadingTimetable(true);

      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) throw new Error("No authentication token found");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name);

        const response = await fetch("/api/profile/timetable", {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload timetable");
        }

        const data = await response.json();

        setHasUploadedTimetable(true);
        setTimetableUploadId(data.timetable_upload?.id);
        saveToLocalStorage();

        toast.success(`Timetable ${file.name} uploaded successfully!`);
      } catch (error: any) {
        toast.error("Failed to upload timetable");
      } finally {
        setUploadingTimetable(false);
      }
    }
  };

  const showSuccessMessage = (
    savedCourses: number,
    totalCourses: number,
    totalClasses: number
  ) => {
    let successMessage = "Setup completed! ";

    if (hasUploadedTimetable) {
      successMessage += "Profile and timetable saved successfully.";
    } else {
      if (savedCourses === totalCourses) {
        successMessage += `All ${savedCourses} courses and ${totalClasses} classes saved successfully.`;
      } else {
        successMessage += `Profile saved. ${savedCourses}/${totalCourses} courses and ${totalClasses} classes saved.`;
      }
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

  const visibleSteps = steps
    .filter((step) => {
      if (hasUploadedTimetable) {
        return step.number === 1 || step.number === 2 || step.number === 5;
      }
      return true;
    })
    .map((step) => ({
      ...step,
      displayNumber:
        hasUploadedTimetable && step.number === 5 ? 3 : step.number,
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative w-full max-w-4xl h-full max-h-[95vh] sm:max-h-[90vh] md:max-h-[80vh] overflow-hidden rounded-xl border border-border bg-background shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-border flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
              Welcome to Anchor!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground truncate">
              Let&apos;s set up your academic profile to get started
            </p>
          </div>
          <Badge
            variant="secondary"
            className="text-xs sm:text-sm flex-shrink-0 ml-2"
          >
            Step {currentStepNumber} of {totalSteps}
          </Badge>
        </div>

        <div className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 flex-shrink-0">
          <Progress value={progress} className="h-1.5 sm:h-2" />
        </div>

        <div className="flex justify-center px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex-shrink-0">
          <div className="flex items-center justify-between w-full overflow-x-auto">
            {visibleSteps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center justify-center flex-shrink-0">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div
                      className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 text-xs ${
                        currentStep >= step.number
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <step.icon className="h-3 w-3" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium whitespace-nowrap hidden xs:block ${
                        currentStep >= step.number
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                </div>
                {index < visibleSteps.length - 1 && (
                  <div
                    className={`w-8 sm:w-14 md:w-28 h-0.5 mx-1 sm:mx-2 ${
                      currentStep > step.number ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          {currentStep === 1 && (
            <AcademicProfileStep
              academicInfo={academicInfo}
              onChange={setAcademicInfo}
            />
          )}
          {currentStep === 2 && (
            <TimetableStep
              hasUploadedTimetable={hasUploadedTimetable}
              onFileUpload={handleFileUpload}
              uploadingTimetable={uploadingTimetable}
            />
          )}
          {currentStep === 3 && (
            <CoursesStep courses={courses} onChange={setCourses} />
          )}
          {currentStep === 4 && (
            <ScheduleStep
              classSchedule={classSchedule}
              courses={courses}
              onChange={setClassSchedule}
            />
          )}
          {currentStep === 5 && (
            <PreferencesStep
              attendancePrefs={attendancePrefs}
              onChange={setAttendancePrefs}
            />
          )}
        </div>

        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-t border-border bg-background flex-shrink-0">
          <Button
            variant="outline"
            className="cursor-pointer text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
            onClick={handleBackStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Back
          </Button>

          {currentStepNumber < totalSteps ? (
            <Button
              onClick={handleNextStep}
              className="cursor-pointer text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
            >
              Continue
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="cursor-pointer text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
            >
              {loading ? "Completing Setup..." : "Complete Setup"}
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
          Academic Profile
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Tell us about your academic background
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
    </div>
  );
}

function TimetableStep({
  hasUploadedTimetable,
  onFileUpload,
  uploadingTimetable,
}: {
  hasUploadedTimetable: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingTimetable: boolean;
}) {
  if (hasUploadedTimetable) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center py-6 sm:py-8">
          <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-green-500" />
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
            Timetable Uploaded
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Your timetable has been successfully uploaded. You can proceed to
            preferences.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
          Upload Timetable
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Upload your timetable to automatically import your schedule and skip
          manual entry.
        </p>
      </div>
      <FileUploadSection
        onFileUpload={onFileUpload}
        uploadingTimetable={uploadingTimetable}
      />
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
    if (courses.length > 1) onChange(courses.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
          Your Courses
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Add the courses you&apos;re taking this semester
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
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
        className="w-full cursor-pointer text-xs sm:text-sm h-9 sm:h-10"
      >
        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
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
    if (classSchedule.length > 1)
      onChange(classSchedule.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
          Class Schedule
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Set up your weekly class schedule for attendance tracking
        </p>
      </div>

      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
          Add Classes Manually
        </h3>
        <div className="space-y-3 sm:space-y-4">
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
          className="w-full mt-3 sm:mt-4 cursor-pointer text-xs sm:text-sm h-9 sm:h-10"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
          Attendance Preferences
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
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

function FileUploadSection({
  onFileUpload,
  uploadingTimetable,
}: {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingTimetable: boolean;
}) {
  return (
    <div className="p-4 sm:p-6 rounded-lg border border-border bg-card">
      <div className="text-center">
        {uploadingTimetable ? (
          <>
            <div className="animate-spin h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 border-4 border-primary border-t-transparent rounded-full" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">
              Uploading Timetable...
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Please wait while we process your timetable
            </p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-primary" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">
              Upload Your Timetable
            </h3>
            <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-muted-foreground">
              Upload your Excel or PDF timetable to automatically import your
              schedule
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                type="button"
                variant="outline"
                className="relative text-xs sm:text-sm h-9 sm:h-10"
              >
                <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Choose File
                <Input
                  type="file"
                  accept=".xlsx,.xls,.pdf"
                  onChange={onFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </Button>
              <Button
                variant="outline"
                disabled
                className="text-xs sm:text-sm h-9 sm:h-10"
              >
                Download Template
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

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
      <Label htmlFor={id} className="text-xs sm:text-sm">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="text-xs sm:text-sm h-9 sm:h-10"
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
      <Label htmlFor="currentSemester" className="text-xs sm:text-sm">
        Current Semester *
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="text-xs sm:text-sm h-9 sm:h-10">
          <SelectValue placeholder="Select semester" />
        </SelectTrigger>
        <SelectContent>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <SelectItem
              key={sem}
              value={sem.toString()}
              className="text-xs sm:text-sm"
            >
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

function GraduationCalendar({
  selected,
  onSelect,
}: {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}) {
  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={onSelect}
      className="rounded-md border shadow-sm"
      captionLayout="dropdown"
      fromYear={new Date().getFullYear() - 5}
      toYear={new Date().getFullYear() + 5}
    />
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
      <Label htmlFor="expectedGraduation" className="text-xs sm:text-sm">
        Expected Graduation
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal text-xs sm:text-sm h-9 sm:h-10",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4 opacity-70" />
            {value ? format(value, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 md:top-auto md:bottom-0"
          side="top"
          align="start"
          sideOffset={4}
        >
          <GraduationCalendar
            selected={value}
            onSelect={(date) => {
              if (date) {
                onChange(date);
              }
            }}
          />
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
    <div className="p-3 sm:p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-medium text-sm sm:text-base">Course {index + 1}</h3>
        {showRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive/90"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <FormField
          label="Course Code *"
          value={course.code}
          onChange={(value) => onCourseChange(index, "code", value)}
          placeholder="e.g., CS 301"
          required
          id={""}
        />
        <FormField
          label="Course Name *"
          value={course.name}
          onChange={(value) => onCourseChange(index, "name", value)}
          placeholder="e.g., Data Structures"
          required
          id={""}
        />
        <FormField
          label="Instructor *"
          value={course.instructor}
          onChange={(value) => onCourseChange(index, "instructor", value)}
          placeholder="Professor name"
          required
          id={""}
        />
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Credits</Label>
          <Select
            value={course.credits.toString()}
            onValueChange={(value) => onCourseChange(index, "credits", value)}
          >
            <SelectTrigger className="text-xs sm:text-sm h-9 sm:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((credit) => (
                <SelectItem
                  key={credit}
                  value={credit.toString()}
                  className="text-xs sm:text-sm"
                >
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
    <div className="p-3 sm:p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-medium text-sm sm:text-base">Class {index + 1}</h3>
        {showRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive/90"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Day</Label>
          <Select
            value={classItem.day.toString()}
            onValueChange={(value) => onClassChange(index, "day", value)}
          >
            <SelectTrigger className="text-xs sm:text-sm h-9 sm:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1" className="text-xs sm:text-sm">
                Monday
              </SelectItem>
              <SelectItem value="2" className="text-xs sm:text-sm">
                Tuesday
              </SelectItem>
              <SelectItem value="3" className="text-xs sm:text-sm">
                Wednesday
              </SelectItem>
              <SelectItem value="4" className="text-xs sm:text-sm">
                Thursday
              </SelectItem>
              <SelectItem value="5" className="text-xs sm:text-sm">
                Friday
              </SelectItem>
              <SelectItem value="6" className="text-xs sm:text-sm">
                Saturday
              </SelectItem>
              <SelectItem value="0" className="text-xs sm:text-sm">
                Sunday
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Start Time</Label>
          <Input
            type="time"
            value={classItem.startTime}
            onChange={(e) => onClassChange(index, "startTime", e.target.value)}
            className="text-xs sm:text-sm h-9 sm:h-10"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">End Time</Label>
          <Input
            type="time"
            value={classItem.endTime}
            onChange={(e) => onClassChange(index, "endTime", e.target.value)}
            className="text-xs sm:text-sm h-9 sm:h-10"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Course *</Label>
          <Select
            value={classItem.course}
            onValueChange={(value) => onClassChange(index, "course", value)}
          >
            <SelectTrigger className="text-xs sm:text-sm h-9 sm:h-10">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {availableCourses.map((course, courseIndex) => (
                <SelectItem
                  key={courseIndex}
                  value={course.code}
                  className="text-xs sm:text-sm"
                >
                  {course.code} - {course.name || "Unnamed Course"}
                </SelectItem>
              ))}
              {availableCourses.length === 0 && (
                <SelectItem
                  value="no-courses"
                  disabled
                  className="text-xs sm:text-sm"
                >
                  No courses available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Room *</Label>
          <Input
            value={classItem.room}
            onChange={(e) => onClassChange(index, "room", e.target.value)}
            placeholder="e.g., Room 301"
            required
            className="text-xs sm:text-sm h-9 sm:h-10"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Type</Label>
          <Select
            value={classItem.type}
            onValueChange={(value) => onClassChange(index, "type", value)}
          >
            <SelectTrigger className="text-xs sm:text-sm h-9 sm:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lecture" className="text-xs sm:text-sm">
                Lecture
              </SelectItem>
              <SelectItem value="lab" className="text-xs sm:text-sm">
                Lab
              </SelectItem>
              <SelectItem value="tutorial" className="text-xs sm:text-sm">
                Tutorial
              </SelectItem>
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
    <div className="p-4 sm:p-6 rounded-lg border border-border bg-card">
      <div className="space-y-4">
        <div>
          <Label htmlFor="minAttendance" className="text-sm sm:text-base">
            Minimum Attendance Percentage
          </Label>
          <p className="text-xs sm:text-sm mt-1 text-muted-foreground">
            Set the minimum attendance percentage you want to maintain for each
            course
          </p>
        </div>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-semibold text-foreground">
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
          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
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
    <div className="p-4 sm:p-6 rounded-lg border border-border bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <Label className="text-sm sm:text-base">Attendance Warnings</Label>
          <p className="text-xs sm:text-sm mt-1 text-muted-foreground">
            Receive notifications when your attendance drops below your target
          </p>
        </div>
        <Button
          variant={enableWarnings ? "default" : "outline"}
          className="cursor-pointer text-xs sm:text-sm h-9 sm:h-10 w-full sm:w-auto"
          onClick={() => onChange(!enableWarnings)}
        >
          {enableWarnings ? "Enabled" : "Disabled"}
        </Button>
      </div>
    </div>
  );
}
