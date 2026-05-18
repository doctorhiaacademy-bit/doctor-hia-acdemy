import { useState, useEffect, FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useStore } from "@/src/lib/store";
import { Button } from "@/src/components/ui/button";
import { Lock, FileText, Video, Link as LinkIcon, ArrowLeft, CheckCircle, MessageCircle, Send, Trash2 } from "lucide-react";
import { Input } from "@/src/components/ui/input";

function MaterialItem({ mat, user, isPremium, courseId, courseLevel, courseSubject }: { mat: any, user: any, isPremium: boolean, courseId: string, courseLevel: string, courseSubject: string, key?: any }) {
  const [completed, setCompleted] = useState(false);
  const [progressId, setProgressId] = useState<string | null>(null);
  
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Fetch progress for this material
  useEffect(() => {
    if (!user) return;
    const fetchProgress = async () => {
      const q = query(
        collection(db, "progress"), 
        where("userId", "==", user.uid), 
        where("materialId", "==", mat.id)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        setCompleted(snap.docs[0].data().completed);
        setProgressId(snap.docs[0].id);
      }
    };
    fetchProgress();
  }, [user, mat.id]);

  // Fetch comments
  useEffect(() => {
    if (!showComments) return;
    const fetchComments = async () => {
      const q = query(
        collection(db, "comments"),
        where("materialId", "==", mat.id)
        // Note: Missing index error might occur if we orderBy without composite index, so we sort in client for now.
      );
      const snap = await getDocs(q);
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      fetched.sort((a, b) => b.createdAt - a.createdAt);
      setComments(fetched);
    };
    fetchComments();
  }, [showComments, mat.id]);

  const toggleProgress = async () => {
    if (!user) {
      alert("Please sign in to track progress.");
      return;
    }
    const newCompletedState = !completed;
    setCompleted(newCompletedState);
    try {
      if (!progressId && newCompletedState) {
        const newId = Date.now().toString() + user.uid;
        await setDoc(doc(db, "progress", newId), {
          userId: user.uid,
          userName: user.displayName || user.email?.split('@')[0] || "Student",
          materialId: mat.id,
          courseId: courseId,
          completed: true,
          completedAt: Date.now()
        });
        setProgressId(newId);
      } else if (progressId) {
        await setDoc(doc(db, "progress", progressId), {
          userId: user.uid,
          userName: user.displayName || user.email?.split('@')[0] || "Student",
          materialId: mat.id,
          courseId: courseId,
          completed: newCompletedState,
          completedAt: Date.now()
        }, { merge: true });
      }
    } catch(e) {
      setCompleted(!newCompletedState);
      console.error("Progress error", e);
    }
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newId = Date.now().toString();
      await setDoc(doc(db, "comments", newId), {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || "User",
        materialId: mat.id,
        text: newComment.trim(),
        createdAt: Date.now()
      });
      setNewComment("");
      
      // refetch manually to update ui immediately
      const q = query(collection(db, "comments"), where("materialId", "==", mat.id));
      const snap = await getDocs(q);
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      fetched.sort((a, b) => b.createdAt - a.createdAt);
      setComments(fetched);
    } catch(e) {
      console.error(e);
      alert("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (id: string, authorId: string) => {
    if (user?.uid !== authorId && user?.email !== 'doctorhiaacademy@gmail.com') return;
    if (confirm("Delete this comment?")) {
      await deleteDoc(doc(db, "comments", id));
      setComments(prev => prev.filter(c => c.id !== id));
    }
  }

  const handleGenerateQuiz = async () => {
    if (!user) {
      alert("Sign in to generate a quiz.");
      return;
    }
    setShowQuiz(true);
    if (quizQuestions.length > 0) return; // Already generated
    
    setIsGeneratingQuiz(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subject: courseSubject,
          level: courseLevel,
          topic: mat.title
        })
      });
      const data = await res.json();
      if (data.quiz && Array.isArray(data.quiz)) {
        setQuizQuestions(data.quiz);
      } else {
        alert("Failed to parse quiz data.");
      }
    } catch(e) {
      console.error(e);
      alert("Failed to generate quiz.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const calculateQuizScore = () => {
    let score = 0;
    quizQuestions.forEach((q, i) => {
      if (quizAnswers[i] === q.correctAnswer) score++;
    });
    return score;
  };

  const isLocked = mat.isPremiumOnly && !isPremium;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col gap-4 hover:shadow-md transition">
      <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {mat.type === "video" && <Video className={`h-5 w-5 ${completed ? 'text-slate-400' : 'text-emerald-500'}`} />}
              {mat.type === "pdf" && <FileText className={`h-5 w-5 ${completed ? 'text-slate-400' : 'text-red-500'}`} />}
              {mat.type === "ppt" && <FileText className={`h-5 w-5 ${completed ? 'text-slate-400' : 'text-orange-500'}`} />}
              {mat.type === "link" && <LinkIcon className={`h-5 w-5 ${completed ? 'text-slate-400' : 'text-blue-500'}`} />}
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{mat.type}</span>
              {mat.isPremiumOnly && <span className="text-xs uppercase font-bold text-amber-500 tracking-wider bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900 flex items-center"><Lock className="h-3 w-3 mr-1"/> Premium</span>}
            </div>
            
            {user && (
              <button 
                onClick={toggleProgress} 
                className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${completed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-slate-100 text-slate-500 hover:bg-emerald-50'}`}
              >
                <CheckCircle className={`h-4 w-4 ${completed ? 'text-emerald-500' : 'text-slate-400'}`} />
                {completed ? 'Completed' : 'Mark as Complete'}
              </button>
            )}
          </div>
          
          <h3 className={`text-xl font-bold mb-2 ${completed ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>{mat.title}</h3>
          
          {isLocked ? (
            <div className="mt-4 p-4 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-center">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Premium material</p>
            </div>
          ) : (
            <>
              {mat.type === "video" && mat.url.includes("youtube") ? (
                <div className={`mt-4 aspect-video rounded-xl overflow-hidden shadow-sm ${completed ? 'opacity-70 grayscale' : ''}`}>
                    <iframe 
                      src={mat.url} 
                      title={mat.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setIsViewerOpen(!isViewerOpen)}
                      variant={isViewerOpen ? "default" : "secondary"}
                      className="rounded-xl flex-1 md:flex-none"
                    >
                      {isViewerOpen ? "Close Viewer" : `View ${mat.type.toUpperCase()} Directly`}
                    </Button>
                    <a 
                      href={mat.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 font-medium transition text-sm"
                    >
                      Open Externally
                    </a>
                  </div>

                  {isViewerOpen && (
                    <div className="mt-4 border-2 border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                       <iframe 
                         src={mat.url.includes('firebasestorage') 
                            ? mat.url 
                            : `https://docs.google.com/viewer?url=${encodeURIComponent(mat.url)}&embedded=true`} 
                         className="w-full h-[600px] border-0"
                         title={mat.title}
                       ></iframe>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
      </div>

      {!isLocked && (
        <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => { setShowComments(!showComments); setShowQuiz(false); }}
              className={`flex items-center gap-2 text-sm font-medium transition ${showComments ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
            >
              <MessageCircle className="h-4 w-4" /> 
              Contextual Q&A
            </button>
            <button 
              onClick={() => {
                if (!showQuiz && quizQuestions.length === 0) handleGenerateQuiz();
                else setShowQuiz(!showQuiz);
                setShowComments(false);
              }}
              className={`flex items-center gap-2 text-sm font-medium transition ${showQuiz ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
            >
              <CheckCircle className="h-4 w-4" /> 
              AI Practice Quiz
            </button>
          </div>

          {showQuiz && (
            <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              {isGeneratingQuiz ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-500 font-medium animate-pulse">Generating your personalized AI quiz...</p>
                </div>
              ) : quizQuestions.length > 0 ? (
                <div>
                  <h4 className="font-bold text-lg mb-4">Test Your Knowledge</h4>
                  {quizQuestions.map((q, i) => (
                    <div key={i} className="mb-6 last:mb-2">
                       <p className="font-medium mb-3">{i+1}. {q.question}</p>
                       <div className="space-y-2">
                         {q.options.map((opt: string, j: number) => (
                            <label key={j} className={`flex flex-col p-3 rounded-lg border cursor-pointer transition ${quizSubmitted ? (j === q.correctAnswer ? 'bg-emerald-50 border-emerald-500' : quizAnswers[i] === j ? 'bg-red-50 border-red-500' : 'bg-white border-slate-200') : quizAnswers[i] === j ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="radio" 
                                  name={`quiz-${mat.id}-${i}`} 
                                  disabled={quizSubmitted}
                                  checked={quizAnswers[i] === j}
                                  onChange={() => setQuizAnswers(prev => ({...prev, [i]: j}))}
                                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                                <span>{opt}</span>
                              </div>
                              {quizSubmitted && j === q.correctAnswer && (
                                <p className="text-sm text-emerald-700 mt-2 ml-7 bg-emerald-100 p-2 rounded">{q.explanation}</p>
                              )}
                            </label>
                         ))}
                       </div>
                    </div>
                  ))}
                  
                  {!quizSubmitted ? (
                    <Button 
                       onClick={() => setQuizSubmitted(true)}
                       disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                       className="w-full mt-4"
                    >
                      Submit Answers
                    </Button>
                  ) : (
                    <div className="mt-4 p-4 text-center rounded-xl bg-emerald-50 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-800">
                      <p className="text-xl font-bold text-emerald-800 dark:text-emerald-100 mb-1">
                        You scored {calculateQuizScore()} out of {quizQuestions.length}!
                      </p>
                      {calculateQuizScore() === quizQuestions.length ? (
                        <p className="text-emerald-600 dark:text-emerald-300 font-medium">Perfect! You've mastered this topic.</p>
                      ) : (
                        <p className="text-emerald-600 dark:text-emerald-300 font-medium">Good effort! Review the material and try again.</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-slate-500">Failed to load quiz. Try again.</p>
              )}
            </div>
          )}

          {showComments && (
            <div className="mt-4 space-y-4">
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {comments.length === 0 ? (
                  <p className="text-sm text-slate-500 italic py-2">No questions yet. Be the first to ask!</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-sm border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{c.userName}</span>
                        <div className="flex items-center gap-2">
                           <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                           {(user?.uid === c.userId || user?.email === 'doctorhiaacademy@gmail.com') && (
                             <button onClick={() => handleDeleteComment(c.id, c.userId)} className="text-slate-400 hover:text-red-500" title="Delete comment"><Trash2 className="h-3 w-3" /></button>
                           )}
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{c.text}</p>
                    </div>
                  ))
                )}
              </div>
              
              {user ? (
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <Input 
                    value={newComment} 
                    onChange={e => setNewComment(e.target.value)} 
                    placeholder="Ask a question about this material..." 
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newComment.trim() || isSubmitting} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <p className="text-xs text-slate-500 text-center py-2">Sign in to ask questions.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isPremium, user } = useStore();

  useEffect(() => {
    if (!id) return;
    
    const fetchCourseData = async () => {
      try {
        const courseDoc = await getDoc(doc(db, "courses", id));
        if (courseDoc.exists()) {
          const cData = courseDoc.data();
          setCourse({ id, ...cData });
          
          if (!cData.isPremiumOnly || isPremium) {
            const matQuery = query(collection(db, "materials"), where("courseId", "==", id));
            const matSnap = await getDocs(matQuery);
            setMaterials(matSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseData();
  }, [id, isPremium]);

  if (isLoading) {
    return <div className="py-32 text-center">Loading course...</div>;
  }

  if (!course) {
    return <div className="py-32 text-center">Course not found.</div>;
  }

  const isLocked = course.isPremiumOnly && !isPremium;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/courses" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6">
         <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
      </Link>
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-8 shadow-sm">
         <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs font-bold uppercase rounded-full tracking-wider">
               {course.level}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold uppercase rounded-full tracking-wider">
               {course.subject}
            </span>
            {course.isPremiumOnly && (
               <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 text-xs font-bold uppercase rounded-full tracking-wider flex items-center gap-1">
                 <Lock className="h-3 w-3" /> Premium
               </span>
            )}
         </div>
         <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6">{course.title}</h1>
         <p className="text-lg text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{course.description}</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white px-2">Course Materials</h2>
        
        {isLocked ? (
           <div className="bg-slate-50 dark:bg-slate-900 border border-amber-200 dark:border-amber-900 p-12 rounded-3xl text-center">
              <Lock className="h-12 w-12 text-amber-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">Premium Content</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">This course contains premium materials. You need a premium subscription to access video lectures and notes.</p>
              {!user && <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Please sign in to view access status.</p>}
           </div>
        ) : (
           <div className="grid gap-4">
              {materials.length === 0 ? (
                 <div className="p-8 text-center text-slate-500 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
                    No materials available for this course yet.
                 </div>
              ) : materials.map(mat => (
                 <MaterialItem key={mat.id} mat={mat} user={user} isPremium={isPremium} courseId={course.id} courseSubject={course.subject} courseLevel={course.level} />
              ))}
           </div>
        )}
      </div>
    </div>
  );
}
