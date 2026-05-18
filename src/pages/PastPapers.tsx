import { Link } from "react-router-dom";
import { FileText, Download, ExternalLink, ArrowRight } from "lucide-react";

export default function PastPapers() {
  const curricula = [
    {
      title: "IB (International Baccalaureate)",
      description: "Access past papers, mark schemes, and examiner reports for IB Science subjects.",
      links: [
        { name: "IB Physics HL/SL", url: "https://drive.google.com/" },
        { name: "IB Chemistry HL/SL", url: "https://drive.google.com/" },
        { name: "IB Biology HL/SL", url: "https://drive.google.com/" }
      ]
    },
    {
      title: "CAIE A-Level",
      description: "Cambridge International AS & A Level past papers.",
      links: [
        { name: "CAIE Physics (9702)", url: "https://drive.google.com/" },
        { name: "CAIE Chemistry (9701)", url: "https://drive.google.com/" },
        { name: "CAIE Biology (9700)", url: "https://drive.google.com/" }
      ]
    },
    {
      title: "Pearson Edexcel A-Level",
      description: "Edexcel International A Level past exam papers and resources.",
      links: [
        { name: "Edexcel Physics", url: "https://drive.google.com/" },
        { name: "Edexcel Chemistry", url: "https://drive.google.com/" },
        { name: "Edexcel Biology", url: "https://drive.google.com/" }
      ]
    },
    {
      title: "Pearson Edexcel IGCSE",
      description: "Edexcel International GCSE past papers.",
      links: [
        { name: "IGCSE Physics", url: "https://drive.google.com/" },
        { name: "IGCSE Chemistry", url: "https://drive.google.com/" },
        { name: "IGCSE Biology", url: "https://drive.google.com/" }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 dark:text-white mb-6">Past Papers</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Practice makes perfect. Access our curated repository of past papers and mark schemes across all major science curricula.
        </p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
           <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2">Need access to fully solved papers?</h3>
           <p className="text-amber-800 dark:text-amber-200">Our premium courses include step-by-step video solutions for recent past papers.</p>
        </div>
        <Link to="/courses" className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2">
           Explore Courses <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {curricula.map((curriculum, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-6">
               <FileText className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold font-serif mb-3 text-slate-900 dark:text-white">{curriculum.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">{curriculum.description}</p>
            
            <div className="space-y-3">
              {curriculum.links.map((link, j) => (
                <a 
                  key={j} 
                  href={link.url}
                  target="_blank"
                  rel="noreferrer" 
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/50 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 rounded-xl transition group"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">{link.name}</span>
                  <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-16 text-center text-slate-500 text-sm">
         Note: The past paper links redirect to Google Drive folders. If you need edit access or cannot find a specific paper, please contact us.
      </div>
    </div>
  );
}
