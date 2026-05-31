import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SupabaseTest() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    async function loadCourses() {
      const { data, error } = await supabase
        .from("courses")
        .select("*");

      console.log("DATA:", data);
      console.log("ERROR:", error);

      setCourses(data || []);
    }

    loadCourses();
  }, []);

  return (
    <div className="p-8">
      <h1>Supabase Test</h1>
      <pre>{JSON.stringify(courses, null, 2)}</pre>
    </div>
  );
}