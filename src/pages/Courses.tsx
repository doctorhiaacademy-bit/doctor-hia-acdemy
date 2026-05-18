import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useStore } from "@/src/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { BookOpen, Video, Lock, Unlock } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  subject: string;
  isPremiumOnly: boolean;
  price?: number;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const { isPremium } = useStore();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, "courses"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
        setCourses(data);
      } catch (err) {
        console.error("Error fetching courses", err);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12">
        <div>
          <h1 className="font-serif text-4xl font-bold text-slate-900 dark:text-white mb-4">Science Courses</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
            Browse our comprehensive collection of A-Level, IB, and IGCSE curriculums tailored for excellence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <h3 className="text-xl font-medium text-slate-500">No courses available yet. Check back soon!</h3>
          </div>
        ) : courses.map(course => (
          <Card key={course.id} className="relative overflow-hidden group flex flex-col rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300">
            {course.isPremiumOnly && (
              <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 p-2 rounded-full z-10 shadow-sm backdrop-blur-md">
                <Lock className="h-4 w-4" />
              </div>
            )}
            
            <div className="h-48 bg-slate-100 dark:bg-slate-800 relative p-6 flex flex-col justify-end overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-0"></div>
               <div className="relative z-10 text-white">
                 <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-1 block">{course.level} • {course.subject}</span>
                 <h2 className="text-2xl font-bold">{course.title}</h2>
               </div>
            </div>

            <CardContent className="p-6 flex-1 flex flex-col">
              <p className="text-slate-600 dark:text-slate-400 mb-6 flex-1 line-clamp-3">
                {course.description}
              </p>
              
              <div className="mt-auto">
                {course.isPremiumOnly && !isPremium ? (
                  <Button 
                    className="w-full rounded-xl py-6 bg-slate-800 hover:bg-slate-900 text-slate-300"
                    disabled
                  >
                     Premium Only
                  </Button>
                ) : (
                  <Link 
                    to={`/courses/${course.id}`}
                    className="inline-flex w-full items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 py-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                     Go to Course
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
