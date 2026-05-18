import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import { useStore } from "./lib/store";
import { handleFirestoreError, OperationType } from "./lib/errors";
import RootLayout from "./components/layout/RootLayout";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import AdminDashboard from "./pages/AdminDashboard";
import SettingsPage from "./pages/SettingsPage";
import Leaderboard from "./pages/Leaderboard";
import PastPapers from "./pages/PastPapers";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const { setUser } = useStore();

  useEffect(() => {
    let unsubDoc: (() => void) | null = null;
    
    const unsubscribe = onAuthStateChanged(auth, async (userObj) => {
      if (unsubDoc) unsubDoc();
      
      if (userObj) {
        const userRef = doc(db, "users", userObj.uid);
        unsubDoc = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const normalizedEmail = userObj.email?.toLowerCase();
            const actualRole = normalizedEmail === 'doctorhiaacademy@gmail.com' ? 'admin' : data.role;
            setUser(userObj, actualRole, data.isPremium || (normalizedEmail === 'doctorhiaacademy@gmail.com'));
          } else {
            // Document doesn't exist yet, handle bootstrap if needed or wait for Navbar to do it
            const normalizedEmail = userObj.email?.toLowerCase();
            const isAdmin = normalizedEmail === 'doctorhiaacademy@gmail.com';
            
            setUser(userObj, isAdmin ? 'admin' : 'student', isAdmin);
            
            // Proactive bootstrap if doc missing
            if (isAdmin) {
               setDoc(userRef, {
                 email: userObj.email,
                 displayName: userObj.displayName,
                 photoURL: userObj.photoURL,
                 role: 'admin',
                 isPremium: true,
                 createdAt: Date.now()
               }).catch(console.error);
            }
          }
        }, (error) => {
           console.error("User snap error:", error);
           // Fallback if snap fails (e.g. initial login before doc created)
           const normalizedEmail = userObj.email?.toLowerCase();
           setUser(userObj, normalizedEmail === 'doctorhiaacademy@gmail.com' ? 'admin' : 'student', normalizedEmail === 'doctorhiaacademy@gmail.com');
        });
      } else {
        setUser(null, null, false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubDoc) unsubDoc();
    };
  }, [setUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="past-papers" element={<PastPapers />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
