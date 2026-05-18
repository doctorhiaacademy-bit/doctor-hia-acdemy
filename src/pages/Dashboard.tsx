import { useState, useEffect } from "react";
import { useStore } from "@/src/lib/store";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Flame, Trophy, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StudentDashboard() {
  const { user } = useStore();
  const [stats, setStats] = useState({
    points: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: ""
  });
  const [progressData, setProgressData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch User Stats
        const statsRef = doc(db, "userStats", user.uid);
        const statsSnap = await getDocs(query(collection(db, "userStats"), where("userId", "==", user.uid)));
        
        let currentStats = {
          userId: user.uid,
          points: 0,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: new Date().toISOString().split('T')[0]
        };

        if (!statsSnap.empty) {
          const data = statsSnap.docs[0].data();
          const today = new Date().toISOString().split('T')[0];
          const lastActive = data.lastActiveDate;
          
          let newStreak = data.currentStreak;
          if (lastActive !== today) {
             const yesterday = new Date();
             yesterday.setDate(yesterday.getDate() - 1);
             const yesterdayStr = yesterday.toISOString().split('T')[0];
             
             if (lastActive === yesterdayStr) {
               newStreak += 1;
             } else {
               newStreak = 1;
             }
             
             currentStats = {
               ...data,
               currentStreak: newStreak,
               longestStreak: Math.max(data.longestStreak, newStreak),
               lastActiveDate: today,
               points: data.points + 10 // Daily login points
             } as any;
             await setDoc(statsRef, currentStats);
          } else {
            currentStats = data as any;
          }
        } else {
          await setDoc(statsRef, currentStats);
        }
        setStats(currentStats);

        // Fetch Progress for Activity Chart
        const q = query(collection(db, "progress"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => d.data());
        setProgressData(docs);

        // Group by Date for Chart
        const activityByDate: Record<string, number> = {};
        
        // Populate last 7 days with 0
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          activityByDate[d.toISOString().split('T')[0]] = 0;
        }

        docs.forEach(p => {
          if (p.completed && p.completedAt) {
            const dStr = new Date(p.completedAt).toISOString().split('T')[0];
            if (activityByDate[dStr] !== undefined) {
              activityByDate[dStr] += 1;
            }
          }
        });

        const formattedChartData = Object.entries(activityByDate).map(([date, count]) => ({
          date: date.substring(5), // mm-dd
          completed: count
        }));
        setChartData(formattedChartData);

      } catch (e) {
        console.error("Error fetching dashboard data", e);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (!user) return <div className="p-8 text-center">Please sign in to view your dashboard.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-2">My Overview</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">Track your learning progress and streaks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border-amber-200 dark:border-amber-900/50">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="bg-amber-100 dark:bg-amber-900/50 p-4 rounded-2xl">
              <Flame className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-1 uppercase tracking-wider">Current Streak</p>
              <div className="text-4xl font-bold text-slate-900 dark:text-white">{stats.currentStreak} <span className="text-lg text-slate-500">days</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 border-emerald-200 dark:border-emerald-900/50">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-2xl">
              <Star className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-1 uppercase tracking-wider">Total Points</p>
              <div className="text-4xl font-bold text-slate-900 dark:text-white">{stats.points}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 border-blue-200 dark:border-blue-900/50">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-2xl">
              <Trophy className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-1 uppercase tracking-wider">Lessons Finished</p>
              <div className="text-4xl font-bold text-slate-900 dark:text-white">{progressData.filter(p => p.completed).length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Activity Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
