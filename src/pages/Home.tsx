import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/src/components/ui/button";
import { ArrowRight, BookOpen, Presentation, Video, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/src/components/ui/dropdown-menu";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export default function Home() {
  const [heroTitle, setHeroTitle] = useState("Accelerate Your <span class='text-emerald-400'>Potential.</span>");
  const [heroSubtitle, setHeroSubtitle] = useState("Premium online preparation for A-Level, IB, IGCSE, HKDSE, EDEXCEL, AQA, and CAMBRIDGE Science Subjects.");
  const [foundersTitle, setFoundersTitle] = useState("Meet the Visionaries");
  const [foundersDescription, setFoundersDescription] = useState("Dr. HIA Academy was established by passionate educators dedicated to making high-quality science education accessible to students worldwide. With decades of combined experience in teaching A-Level, IB, and IGCSE curriculums, we've identified exactly what students need to excel.\n\nWe believe in simplifying the complex. Through curated resources, premium tutoring, and state-of-the-art AI assistance, we are accelerating the potential of the next generation of scientists and thinkers.");

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const snap = await getDocs(query(collection(db, "siteSettings")));
        if (!snap.empty) {
          const data = snap.docs[0].data();
          if (data.heroTitle) setHeroTitle(data.heroTitle);
          if (data.heroSubtitle) setHeroSubtitle(data.heroSubtitle);
          if (data.foundersTitle) setFoundersTitle(data.foundersTitle);
          if (data.foundersDescription) setFoundersDescription(data.foundersDescription);
        }
      } catch(e) {
        console.error("Failed to load CMS settings", e);
      }
    };
    fetchSiteSettings();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-24 pb-32">
        {/* Premium Background styling */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-slate-900/90 mix-blend-multiply"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 
            className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-6 mt-16 leading-tight"
            dangerouslySetInnerHTML={{ __html: heroTitle.replace('Potential.', '<span class="text-emerald-400">Potential.</span>') }}
          />
          <p className="text-xl md:text-2xl text-emerald-100/80 max-w-2xl mx-auto mb-10 font-light whitespace-pre-wrap">
            {heroSubtitle}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/courses" className="inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold px-8 h-14 text-lg transition-colors">
              Explore Courses
            </Link>
            <Link to="/#founders" className="inline-flex items-center justify-center rounded-full border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 px-8 h-14 text-lg transition-colors">
              Meet the Founders
            </Link>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">Premium Curated Content</h2>
            <p className="border-b-2 border-emerald-500 w-16 mx-auto mt-4"></p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/courses" className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 text-center hover:shadow-xl transition flex flex-col items-center">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full mb-6 relative group-hover:scale-110 transition-transform">
                <Video className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-bold text-xl mb-3 dark:text-white">Video Lectures</h3>
              <p className="text-slate-600 dark:text-slate-400">High-quality YouTube embedded lectures breaking down complex topics.</p>
            </Link>
            
            <Link to="/courses" className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 text-center hover:shadow-xl transition flex flex-col items-center">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full mb-6 relative group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-bold text-xl mb-3 dark:text-white">Detailed Notes & PDFs</h3>
              <p className="text-slate-600 dark:text-slate-400">Comprehensive study materials prepared by specialists.</p>
            </Link>
            
            <Link to="/courses" className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 text-center hover:shadow-xl transition flex flex-col items-center">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full mb-6 relative group-hover:scale-110 transition-transform">
                <Presentation className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-bold text-xl mb-3 dark:text-white">Presentations</h3>
              <p className="text-slate-600 dark:text-slate-400">Visual aids to accelerate your learning in Biology, Chemistry, and Physics.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Curriculum / Subheadings Dropdown Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
           <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white mb-10">Our Curriculum</h2>
           <div className="flex flex-wrap gap-4 justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger className={buttonVariants({ variant: "outline" }) + " h-14 px-6 rounded-full text-lg border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"}>
                  A-Level <ChevronDown className="ml-2 h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 rounded-xl p-2">
                  <DropdownMenuItem className="py-3 rounded-lg"><Link to="/courses?curriculum=A-Level&subject=Biology" className="w-full">Biology</Link></DropdownMenuItem>
                  <DropdownMenuItem className="py-3 rounded-lg"><Link to="/courses?curriculum=A-Level&subject=Chemistry" className="w-full">Chemistry</Link></DropdownMenuItem>
                  <DropdownMenuItem className="py-3 rounded-lg"><Link to="/courses?curriculum=A-Level&subject=Physics" className="w-full">Physics</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className={buttonVariants({ variant: "outline" }) + " h-14 px-6 rounded-full text-lg border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"}>
                  IB Diploma <ChevronDown className="ml-2 h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 rounded-xl p-2">
                  <DropdownMenuItem className="py-3 rounded-lg"><Link to="/courses?curriculum=IB&subject=Biology" className="w-full">Biology (HL/SL)</Link></DropdownMenuItem>
                  <DropdownMenuItem className="py-3 rounded-lg"><Link to="/courses?curriculum=IB&subject=Chemistry" className="w-full">Chemistry (HL/SL)</Link></DropdownMenuItem>
                  <DropdownMenuItem className="py-3 rounded-lg"><Link to="/courses?curriculum=IB&subject=Physics" className="w-full">Physics (HL/SL)</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className={buttonVariants({ variant: "outline" }) + " h-14 px-6 rounded-full text-lg border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"}>
                  IGCSE <ChevronDown className="ml-2 h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 rounded-xl p-2">
                  <DropdownMenuItem className="py-3 rounded-lg"><Link to="/courses?curriculum=IGCSE&subject=Biology" className="w-full">Biology</Link></DropdownMenuItem>
                  <DropdownMenuItem className="py-3 rounded-lg"><Link to="/courses?curriculum=IGCSE&subject=Chemistry" className="w-full">Chemistry</Link></DropdownMenuItem>
                  <DropdownMenuItem className="py-3 rounded-lg"><Link to="/courses?curriculum=IGCSE&subject=Physics" className="w-full">Physics</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
           </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">Student Stories</h2>
            <p className="border-b-2 border-emerald-500 w-16 mx-auto mt-4"></p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl relative">
              <div className="absolute top-4 right-6 text-6xl text-emerald-500/20 font-serif">"</div>
              <p className="text-slate-600 dark:text-slate-400 italic mb-6 relative z-10">
                "The A-Level Chemistry resources here completely changed my understanding of organic synthesis. I scored an A* largely thanks to the meticulous notes and video lectures."
              </p>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center font-bold">SA</div>
                 <div>
                   <h4 className="font-bold text-slate-900 dark:text-white">Sarah A.</h4>
                   <p className="text-sm text-slate-500">A-Level Student, UK</p>
                 </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl relative">
              <div className="absolute top-4 right-6 text-6xl text-emerald-500/20 font-serif">"</div>
              <p className="text-slate-600 dark:text-slate-400 italic mb-6 relative z-10">
                "Dr. HIA Academy's IB Physics HL syllabus breakdown was incredibly helpful. The AI assistant was available at 2 AM the night before my mocks to help clarify concepts."
              </p>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center font-bold">ML</div>
                 <div>
                   <h4 className="font-bold text-slate-900 dark:text-white">Marcus L.</h4>
                   <p className="text-sm text-slate-500">IB Diploma, Hong Kong</p>
                 </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl relative">
              <div className="absolute top-4 right-6 text-6xl text-emerald-500/20 font-serif">"</div>
              <p className="text-slate-600 dark:text-slate-400 italic mb-6 relative z-10">
                "I was struggling with IGCSE Biology until I found these materials. The presentations made everything visually clear, and the practice questions were spot on."
              </p>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center font-bold">EN</div>
                 <div>
                   <h4 className="font-bold text-slate-900 dark:text-white">Elena N.</h4>
                   <p className="text-sm text-slate-500">IGCSE Student, UAE</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section id="founders" className="py-32 bg-white dark:bg-slate-950 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="font-serif text-4xl font-bold text-slate-900 dark:text-white mb-6">{foundersTitle}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed whitespace-pre-wrap max-w-xl">
                {foundersDescription}
              </p>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-[3rem] transform translate-x-4 translate-y-4 opacity-20"></div>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80" 
                alt="Founders" 
                className="w-full h-[400px] object-cover rounded-[3rem] relative z-10 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
