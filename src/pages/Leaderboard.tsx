import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Trophy, Medal, Star } from "lucide-react";

interface StudentScore {
  userId: string;
  userName: string;
  completedCount: number;
}

export default function Leaderboard() {
  const [scores, setScores] = useState<StudentScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const q = query(collection(db, "progress"), where("completed", "==", true));
        const snap = await getDocs(q);
        
        const counts: Record<string, { count: number, name: string }> = {};
        
        snap.docs.forEach(doc => {
          const data = doc.data();
          if (!counts[data.userId]) {
            counts[data.userId] = { count: 0, name: data.userName || "Anonymous Student" };
          }
          counts[data.userId].count += 1;
        });

        const sortedScores = Object.entries(counts)
          .map(([userId, info]) => ({
            userId,
            userName: info.name,
            completedCount: info.count
          }))
          .sort((a, b) => b.completedCount - a.completedCount);

        setScores(sortedScores);
      } catch (e) {
        console.error("Error fetching leaderboard", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (isLoading) {
    return <div className="py-32 text-center text-slate-500">Loading leaderboard...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4">Student Leaderboard</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">Track your progress against your peers. Complete materials to climb the ranks!</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {scores.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No progress has been recorded yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {scores.map((score, index) => (
              <div 
                key={score.userId} 
                className={`flex items-center gap-6 p-6 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${index < 3 ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}`}
              >
                <div className="flex-shrink-0 w-12 text-center flex justify-center">
                  {index === 0 && <Medal className="h-8 w-8 text-yellow-500" />}
                  {index === 1 && <Medal className="h-8 w-8 text-slate-400" />}
                  {index === 2 && <Medal className="h-8 w-8 text-amber-600" />}
                  {index > 2 && <span className="text-xl font-bold text-slate-400">#{index + 1}</span>}
                </div>
                
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${index < 3 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {score.userName}
                  </h3>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full font-bold">
                  <Star className="h-4 w-4" fill="currentColor" />
                  {score.completedCount} {score.completedCount === 1 ? 'Material' : 'Materials'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
