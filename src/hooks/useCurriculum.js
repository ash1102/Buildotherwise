import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";

/** Modules and lessons are content records, so a new module is data, not a redesign. */
/** The curriculum is content, so it is fetched once per session and reused by every page. */
let curriculumCache = null;

export default function useCurriculum() {
  const [modules, setModules] = useState(curriculumCache?.modules || []);
  const [lessons, setLessons] = useState(curriculumCache?.lessons || []);
  const [loading, setLoading] = useState(!curriculumCache);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [moduleRows, lessonRows] = await Promise.all([
          base44.entities.Module.list("order", 50),
          base44.entities.Lesson.list("module_order", 200),
        ]);
        if (!active) return;
        const sortedModules = [...moduleRows].sort((a, b) => a.order - b.order);
        const sortedLessons = [...lessonRows].sort((a, b) =>
          a.module_order === b.module_order ? a.order - b.order : a.module_order - b.module_order
        );
        curriculumCache = { modules: sortedModules, lessons: sortedLessons };
        setModules(sortedModules);
        setLessons(sortedLessons);
      } catch (loadError) {
        if (active) setError(loadError);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const lessonsByOrder = useMemo(() => {
    const grouped = {};
    lessons.forEach((lesson) => {
      grouped[lesson.module_order] = grouped[lesson.module_order] || [];
      grouped[lesson.module_order].push(lesson);
    });
    return grouped;
  }, [lessons]);

  const lessonsByCode = useMemo(() => {
    const map = {};
    lessons.forEach((lesson) => {
      map[lesson.code] = lesson;
    });
    return map;
  }, [lessons]);

  const liveModuleOrders = useMemo(
    () => modules.filter((module) => module.status === "live").map((module) => module.order),
    [modules]
  );

  /** The full Pilot 1 sequence, used for Back/Next across module boundaries. */
  const orderedLessons = useMemo(
    () => lessons.filter((lesson) => liveModuleOrders.includes(lesson.module_order)),
    [lessons, liveModuleOrders]
  );

  return { modules, lessons, lessonsByOrder, lessonsByCode, orderedLessons, loading, error };
}