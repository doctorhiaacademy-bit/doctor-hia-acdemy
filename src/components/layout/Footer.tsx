import { Facebook, Instagram, Youtube, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800" id="contact">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">Dr. HIA Academy</h2>
          <p className="text-sm text-slate-400 max-w-sm mb-6">
            Accelerate your potential! We specialize in A-Level, IB, IGCSE, HKDSE, EDEXCEL, AQA, and CAMBRIDGE high school science subjects.
          </p>
          <div className="space-y-2">
            <a href="mailto:doctorhiaacademy@gmail.com" className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition">
              <Mail className="h-4 w-4" /> doctorhiaacademy@gmail.com
            </a>
            <a href="https://wa.me/85257939578" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition">
              <Phone className="h-4 w-4" /> +852 5793 9578 (WhatsApp)
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/courses" className="hover:text-emerald-400 transition">All Courses</Link></li>
            <li><Link to="/past-papers" className="hover:text-emerald-400 transition">Past Papers</Link></li>
            <li><Link to="/leaderboard" className="hover:text-emerald-400 transition">Leaderboard</Link></li>
            <li><a href="/#founders" className="hover:text-emerald-400 transition">Founders</a></li>
            <li><a href="#contact" className="hover:text-emerald-400 transition">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Follow Us</h3>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/share/1BfLgsP65q/" target="_blank" rel="noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-emerald-600 hover:text-white transition"><Facebook className="h-4 w-4" /></a>
            <a href="https://www.instagram.com/doctor_hia_academy?igsh=aWQzbjdpYTQydW1z" target="_blank" rel="noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-emerald-600 hover:text-white transition"><Instagram className="h-4 w-4" /></a>
            <a href="https://youtube.com/@doctor_hia_academy?si=_R7ZNPHO2RZJZdJx" target="_blank" rel="noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-emerald-600 hover:text-white transition"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-sm flex flex-col md:flex-row justify-between items-center text-slate-500">
        <p>&copy; {new Date().getFullYear()} Dr. HIA Academy. All rights reserved.</p>
      </div>
    </footer>
  );
}
