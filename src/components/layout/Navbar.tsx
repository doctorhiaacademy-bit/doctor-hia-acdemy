import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/button";
import { useStore } from "@/src/lib/store";
import { auth, db } from "@/src/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, getDocs } from "firebase/firestore";
import { GraduationCap, Sun, Moon, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

export default function Navbar() {
  const { user, role, isDarkMode, toggleDarkMode } = useStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const snap = await getDocs(query(collection(db, "notifications")));
        const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        notifs.sort((a, b) => b.createdAt - a.createdAt);
        setNotifications(notifs);
        
        // Simulating unread count based on recent notifications (last 7 days)
        const recentNotifs = notifs.filter(n => (Date.now() - n.createdAt) < 7 * 24 * 60 * 60 * 1000);
        setUnreadCount(recentNotifs.length);
      } catch (e) {
        console.error(e);
      }
    };
    fetchNotifications();
    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      // Bootstrap user if not exist
      const userRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        const isRootAdmin = result.user.email?.toLowerCase() === 'doctorhiaacademy@gmail.com';
        await setDoc(userRef, {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          role: isRootAdmin ? 'admin' : 'student',
          isPremium: isRootAdmin,
          createdAt: Date.now()
        });
      }
    } catch (e: any) {
      if (e.code === 'auth/popup-closed-by-user') {
        // User closed the popup, don't show error
        console.log("Sign-in popup closed by user.");
      } else {
        console.error("Login failed:", e);
        alert("Login failed: " + e.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
             <img src="/logo.jpg" alt="Dr. HIA Academy" className="h-10 w-auto object-contain rounded-md shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
             <GraduationCap className="h-8 w-8 text-emerald-600 dark:text-emerald-500 hidden" />
             <span className="text-emerald-900 dark:text-emerald-400">Dr.HIA<span className="font-light"> Academy</span></span>
          </Link>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/courses" className="hover:text-emerald-600 transition-colors">Courses</Link>
            <Link to="/past-papers" className="hover:text-emerald-600 transition-colors">Past Papers</Link>
            <Link to="/leaderboard" className="hover:text-emerald-600 transition-colors">Leaderboard</Link>
            <a href="https://calendly.com" target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition">Book 1-on-1</a>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none relative rounded-full h-10 w-10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2">
              <div className="font-bold text-sm px-2 py-1 mb-2 border-b">Notifications</div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-sm text-slate-500 px-2 py-4 text-center">No notifications yet.</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg mb-1 last:mb-0">
                      <div className="font-bold text-sm flex items-center justify-between">
                        {n.title}
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full ${n.type === 'info' ? 'bg-blue-100 text-blue-700' : n.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {n.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {!user ? (
            <Button onClick={handleLogin} disabled={isLoggingIn} variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full min-w-[100px]">
              {isLoggingIn ? "Signing In..." : "Sign In"}
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none flex items-center gap-2 cursor-pointer">
                  <Avatar className="h-8 w-8 border border-emerald-200 dark:border-emerald-800">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                    <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium">{user.displayName}</div>
                <div className="px-2 pb-1.5 text-xs text-muted-foreground">{user.email}</div>
                <div className="border-t my-1"></div>
                <Link to="/dashboard" className="w-full">
                  <DropdownMenuItem className="cursor-pointer">
                    My Dashboard
                  </DropdownMenuItem>
                </Link>
                <Link to="/settings" className="w-full">
                  <DropdownMenuItem className="cursor-pointer">
                    Settings
                  </DropdownMenuItem>
                </Link>
                {role && (['admin', 'moderator', 'editor'].includes(role)) && (
                   <Link to="/admin" className="w-full">
                    <DropdownMenuItem className="cursor-pointer font-bold text-emerald-600 dark:text-emerald-400">
                      Admin Dashboard
                    </DropdownMenuItem>
                   </Link>
                )}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}
