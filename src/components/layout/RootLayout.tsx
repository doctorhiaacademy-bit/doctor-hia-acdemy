import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AIGearWidget from "../ai/AIGearWidget";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />
      <main className="flex-1 w-full mx-auto relative pt-16">
        <Outlet />
      </main>
      <Footer />
      <AIGearWidget />
    </div>
  );
}
