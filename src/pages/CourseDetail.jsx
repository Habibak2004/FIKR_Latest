import { base44 } from "@/api/base44Client";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import StudyPlanTab from "@/components/course-detail/StudyPlanTab";
import AssignmentsTab from "@/components/course-detail/AssignmentsTab";
import PracticeTab from "@/components/course-detail/PracticeTab";
import MaterialsTab from "@/components/course-detail/MaterialsTab";
import CourseSidebar from "@/components/course-detail/CourseSidebar";

export default function CourseDetail() {
  const courseId = window.location.pathname.split("/courses/")[1];

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["assignments", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("course_id", courseId)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!courseId,
  });

  const completedCount = assignments.filter(
    (a) => a.completed || a.status === "graded" || a.status === "submitted"
  ).length;

  const totalCount = assignments.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (isLoading || !course) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-none lg:rounded-b-3xl bg-white border-b px-6 lg:px-10 pt-6 pb-8 mb-6"
      >
        <Link to="/courses" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Classes
        </Link>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            {course.semester && (
              <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-3">
                {course.semester}
              </span>
            )}
            <h1 className="text-3xl font-extrabold leading-tight mb-2">
              {course.code} – {course.name}
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg">
              {course.professor ? `Taught by Prof. ${course.professor}.` : "No professor listed."}
            </p>
          </div>

          <Link to="/focus" className="flex-shrink-0">
            <Button className="rounded-2xl h-14 px-7 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 flex-col gap-0 leading-tight">
              <Play className="h-4 w-4 mb-0.5" />
              <span className="text-xs font-semibold">Resume Study</span>
            </Button>
          </Link>
        </div>

        <div className="mt-8 bg-white border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm">Course Progress</span>
            <span className="text-primary font-bold text-sm">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2.5 rounded-full" />
          <div className="flex items-center gap-4 mt-2.5 text-xs text-muted-foreground">
            <span>{completedCount}/{totalCount} Assignments Completed</span>
            <span>{totalCount - completedCount} Remaining</span>
          </div>
        </div>
      </motion.div>

      <div className="px-6 lg:px-10 flex flex-col lg:flex-row gap-6 pb-12">
        <div className="flex-1 min-w-0">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-muted rounded-xl p-1 mb-6 w-full justify-start overflow-x-auto">
              <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
              <TabsTrigger value="plan" className="rounded-lg">Study Plan</TabsTrigger>
              <TabsTrigger value="practice" className="rounded-lg">Practice</TabsTrigger>
              <TabsTrigger value="materials" className="rounded-lg">Materials</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <AssignmentsTab
                courseId={courseId}
                assignments={assignments}
                courseName={course.name}
                courseColor={course.color}
              />
            </TabsContent>

            <TabsContent value="plan">
              <StudyPlanTab course={course} />
            </TabsContent>

            <TabsContent value="practice">
              <PracticeTab course={course} />
            </TabsContent>

            <TabsContent value="materials">
              <MaterialsTab courseId={courseId} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-full lg:w-72 flex-shrink-0">
          <CourseSidebar course={course} assignments={assignments} />
        </div>
      </div>
    </div>
  );
}