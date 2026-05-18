import React, { useState, useEffect } from "react";
import { collection, query, getDocs, doc, updateDoc, deleteDoc, setDoc, where } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/src/lib/firebase";
import { useStore } from "@/src/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";

export default function AdminDashboard() {
  const { role, user } = useStore();
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "courses" | "progress" | "settings" | "notifications">("users");
  const [isLoading, setIsLoading] = useState(true);

  // Notifications State
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState("info");
  const [notifications, setNotifications] = useState<any[]>([]);

  // Site Settings State
  const [heroTitle, setHeroTitle] = useState("Master the Sciences");
  const [heroSubtitle, setHeroSubtitle] = useState("Expert-led A-Level, IB, and IGCSE tutoring designed to help you achieve top grades.");
  const [foundersTitle, setFoundersTitle] = useState("Meet the Founders");
  const [foundersDescription, setFoundersDescription] = useState("We are dedicated to providing the highest quality science education to students worldwide.");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  // New Course State
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [level, setLevel] = useState("A-Level");
  const [subject, setSubject] = useState("Chemistry");
  const [isPremiumOnly, setIsPremiumOnly] = useState(false);

  // Materials State
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [matTitle, setMatTitle] = useState("");
  const [matType, setMatType] = useState("video");
  const [matUrl, setMatUrl] = useState("");
  const [matIsPremium, setMatIsPremium] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Progress State
  const [allProgress, setAllProgress] = useState<any[]>([]);
  const [allMaterials, setAllMaterials] = useState<any[]>([]);

  useEffect(() => {
    const checkRoleAndFetch = async () => {
      // Small timeout to allow auth to settle if just logged in
      const timer = setTimeout(async () => {
        if (role === "admin") {
          await fetchUsers();
        }
        if (['admin', 'moderator', 'editor'].includes(role || '')) {
          await Promise.all([
            fetchCourses(),
            fetchAllMaterials(),
            fetchAllProgress(),
            fetchNotifications(),
            fetchSiteSettings()
          ]);
        }
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    };
    
    checkRoleAndFetch();
  }, [role, user]);

  const fetchNotifications = async () => {
    try {
      const snap = await getDocs(query(collection(db, "notifications")));
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => b.createdAt - a.createdAt));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSiteSettings = async () => {
    try {
      const snap = await getDocs(query(collection(db, "siteSettings")));
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setHeroTitle(data.heroTitle || "");
        setHeroSubtitle(data.heroSubtitle || "");
        setFoundersTitle(data.foundersTitle || "");
        setFoundersDescription(data.foundersDescription || "");
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "siteSettings", "main"), {
        heroTitle,
        heroSubtitle,
        foundersTitle,
        foundersDescription,
        updatedAt: Date.now()
      });
      alert("Settings saved successfully!");
    } catch(e) {
      console.error(e);
      alert("Failed to save settings: " + (e as Error).message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = Date.now().toString();
      await setDoc(doc(db, "notifications", id), {
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        createdAt: Date.now()
      });
      setNotifTitle(""); setNotifMessage(""); setNotifType("info");
      fetchNotifications();
      alert("Notification sent!");
    } catch(e) {
      console.error(e);
      alert("Failed to send notification: " + (e as Error).message);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (confirm("Delete this notification?")) {
      try {
        await deleteDoc(doc(db, "notifications", id));
        fetchNotifications();
      } catch (e) {
        alert("Failed to delete notification.");
      }
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      fetchMaterials(selectedCourseId);
    } else {
      setMaterials([]);
    }
  }, [selectedCourseId]);

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(query(collection(db, "users")));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCourses = async () => {
    try {
      const snap = await getDocs(query(collection(db, "courses")));
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
       console.error(e);
    }
  };

  const fetchAllMaterials = async () => {
    try {
      const snap = await getDocs(query(collection(db, "materials")));
      setAllMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMaterials = async (courseId: string) => {
    try {
      const snap = await getDocs(query(collection(db, "materials"), where("courseId", "==", courseId)));
      setMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAllProgress = async () => {
    try {
      const snap = await getDocs(query(collection(db, "progress"), where("completed", "==", true)));
      setAllProgress(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch(e) {
      console.error(e);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      fetchUsers();
      alert("Role updated!");
    } catch(e) {
      alert("Error updating role: " + (e as Error).message);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = Date.now().toString();
      await setDoc(doc(db, "courses", id), {
        title,
        description: desc,
        level,
        subject,
        isPremiumOnly,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      setTitle(""); setDesc(""); setIsPremiumOnly(false);
      fetchCourses();
      alert("Course created successfully!");
    } catch(e) {
      console.error(e);
      alert("Error creating course: " + (e as Error).message);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (confirm("Delete this course and its materials? (Note: Materials need manual cleanup currently)")) {
      try {
        await deleteDoc(doc(db, "courses", id));
        if (selectedCourseId === id) setSelectedCourseId(null);
        fetchCourses();
        alert("Course deleted");
      } catch (e) {
        alert("Error deleting course: " + (e as Error).message);
      }
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    
    try {
      let finalUrl = matUrl;

      // Handle File Upload if present
      if (uploadFile) {
        setIsUploading(true);
        const fileRef = ref(storage, `materials/${selectedCourseId}/${Date.now()}_${uploadFile.name}`);
        const uploadTask = uploadBytesResumable(fileRef, uploadFile);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => reject(error),
            async () => {
              finalUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(finalUrl);
            }
          );
        });
        setIsUploading(false);
      }

      if (!finalUrl) {
        alert("Please provide a URL or upload a file.");
        return;
      }

      const id = Date.now().toString();

      if (matType === "video" && finalUrl.includes("youtube.com/watch")) {
         const urlObj = new URL(finalUrl);
         const v = urlObj.searchParams.get("v");
         if (v) finalUrl = `https://www.youtube.com/embed/${v}?rel=0`;
      }

      await setDoc(doc(db, "materials", id), {
        courseId: selectedCourseId,
        title: matTitle,
        type: matType,
        url: finalUrl,
        isPremiumOnly: matIsPremium,
        createdAt: Date.now()
      });
      
      setMatTitle(""); 
      setMatUrl(""); 
      setMatIsPremium(false);
      setUploadFile(null);
      setUploadProgress(0);
      fetchMaterials(selectedCourseId);
      fetchAllMaterials();
      alert("Material added!");
    } catch(e) {
      console.error(e);
      alert("Error adding material: " + (e as Error).message);
      setIsUploading(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (confirm("Delete this material?")) {
      try {
        await deleteDoc(doc(db, "materials", id));
        if (selectedCourseId) fetchMaterials(selectedCourseId);
        fetchAllMaterials();
        alert("Material removed");
      } catch (e) {
        alert("Error deleting material: " + (e as Error).message);
      }
    }
  };

  if (!role || !['admin', 'moderator', 'editor'].includes(role)) {
    if (isLoading) return <div className="p-8 mt-24 text-center">Verifying permissions...</div>;
    return <div className="p-8 mt-24 text-center">Access Denied</div>;
  }

  // Generate overview stats
  const progressByUser = users.map(user => {
    const userProgress = allProgress.filter(p => p.userId === user.id);
    return {
      ...user,
      completedCount: userProgress.length,
      recentCompletion: userProgress.sort((a, b) => b.completedAt - a.completedAt)[0]
    };
  }).sort((a, b) => b.completedCount - a.completedCount);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="flex flex-wrap gap-4 mb-8">
        {role === "admin" && (
          <>
            <Button variant={activeTab === "users" ? "default" : "outline"} onClick={() => setActiveTab("users")}>Users</Button>
            <Button variant={activeTab === "settings" ? "default" : "outline"} onClick={() => setActiveTab("settings")}>Site Settings</Button>
          </>
        )}
        <Button variant={activeTab === "courses" ? "default" : "outline"} onClick={() => setActiveTab("courses")}>Courses & Materials</Button>
        <Button variant={activeTab === "progress" ? "default" : "outline"} onClick={() => setActiveTab("progress")}>Student Progress</Button>
        <Button variant={activeTab === "notifications" ? "default" : "outline"} onClick={() => setActiveTab("notifications")}>Notifications</Button>
      </div>

      {activeTab === "users" && role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>View users and update roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="capitalize">{u.role}</TableCell>
                    <TableCell>{u.isPremium ? "Yes" : "No"}</TableCell>
                    <TableCell className="flex gap-2">
                       <Button size="sm" variant="outline" onClick={() => handleUpdateRole(u.id, "editor")}>Make Editor</Button>
                       <Button size="sm" variant="outline" onClick={() => handleUpdateRole(u.id, "admin")}>Make Admin</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "courses" && (
        <div className="space-y-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Add New Course</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCourse} className="space-y-4">
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Course Title" required />
                  <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Course Description" required />
                  <div className="flex gap-4">
                    <select value={level} onChange={e => setLevel(e.target.value)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="A-Level">A-Level</option>
                      <option value="IB">IB</option>
                      <option value="IGCSE">IGCSE</option>
                    </select>
                    <select value={subject} onChange={e => setSubject(e.target.value)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Physics">Physics</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="premium" checked={isPremiumOnly} onChange={e => setIsPremiumOnly(e.target.checked)} />
                    <label htmlFor="premium">Premium Only</label>
                  </div>
                  <Button type="submit">Create Course</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map(c => (
                    <div key={c.id} className={`p-4 border rounded-xl flex items-center justify-between ${selectedCourseId === c.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-800'}`}>
                      <div>
                         <h4 className="font-bold">{c.title}</h4>
                         <p className="text-sm text-slate-500">{c.level} - {c.subject}</p>
                      </div>
                      <div className="flex items-center gap-2">
                         <Button size="sm" variant={selectedCourseId === c.id ? "default" : "secondary"} onClick={() => setSelectedCourseId(c.id)}>Materials</Button>
                         <Button size="sm" variant="destructive" onClick={() => handleDeleteCourse(c.id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {selectedCourseId && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Add Material</CardTitle>
                  <CardDescription>Provide a link (like YouTube, Google Drive, or Dropbox).</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddMaterial} className="space-y-4">
                    <Input value={matTitle} onChange={e => setMatTitle(e.target.value)} placeholder="Material Title (e.g. Chapter 1 PDF)" required />
                    
                    <div className="flex gap-4">
                      <select value={matType} onChange={e => setMatType(e.target.value)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="video">Video</option>
                        <option value="pdf">PDF Document</option>
                        <option value="ppt">PowerPoint (PPT)</option>
                        <option value="link">Other Link</option>
                      </select>
                    </div>

                    <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Upload File (PDF/PPT)</label>
                        <Input 
                          type="file" 
                          onChange={e => setUploadFile(e.target.files ? e.target.files[0] : null)}
                          className="bg-white dark:bg-slate-800"
                        />
                        {isUploading && (
                          <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 dark:bg-slate-700">
                            <div 
                              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                            <p className="text-[10px] text-emerald-600 mt-1 font-bold">Uploading: {Math.round(uploadProgress)}%</p>
                          </div>
                        )}
                      </div>

                      <div className="relative flex py-3 items-center">
                        <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                        <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase">OR Paste URL</span>
                        <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                      </div>

                      <label className="block text-sm font-medium mb-2">Material URL</label>
                      <Input value={matUrl} onChange={e => setMatUrl(e.target.value)} placeholder="YouTube Link, Google Drive link, etc." type="url" />
                      <p className="text-xs text-slate-500 mt-1">YouTube links will be automatically embedded.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="matPremium" checked={matIsPremium} onChange={e => setMatIsPremium(e.target.checked)} />
                      <label htmlFor="matPremium">Premium Only Material</label>
                    </div>

                    <Button type="submit" className="w-full">
                       Add Material
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                     {materials.length === 0 && <p className="text-slate-500 text-sm">No materials added yet.</p>}
                     {materials.map(m => (
                       <div key={m.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between gap-4">
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2 mb-1">
                               <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full font-medium uppercase">{m.type}</span>
                               <span className="font-medium text-sm truncate">{m.title}</span>
                            </div>
                            <a href={m.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline block truncate w-full">{m.url}</a>
                          </div>
                          <Button size="sm" variant="ghost" className="text-red-500 flex-shrink-0" onClick={() => handleDeleteMaterial(m.id)}>Remove</Button>
                       </div>
                     ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
      {activeTab === "progress" && (
        <Card>
          <CardHeader>
            <CardTitle>Collective Progress</CardTitle>
            <CardDescription>See how many materials each student has completed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Details</TableHead>
                  <TableHead>Materials Completed</TableHead>
                  <TableHead>Most Recent Completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progressByUser.map(user => {
                   const mat = user.recentCompletion ? allMaterials.find(m => m.id === user.recentCompletion.materialId) : null;
                   return (
                      <TableRow key={user.id}>
                        <TableCell>
                           <p className="font-medium">{user.displayName || 'Unknown'}</p>
                           <p className="text-xs text-slate-500">{user.email}</p>
                        </TableCell>
                        <TableCell>
                           <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full">
                              {user.completedCount}
                           </span>
                        </TableCell>
                        <TableCell>
                           {user.recentCompletion ? (
                              <div>
                                 <p className="text-sm font-medium">{mat?.title || 'Unknown Material'}</p>
                                 <p className="text-xs text-slate-500">{new Date(user.recentCompletion.completedAt).toLocaleString()}</p>
                              </div>
                           ) : (
                              <span className="text-slate-400 italic">No progress yet</span>
                           )}
                        </TableCell>
                      </TableRow>
                    )
                 })}
               </TableBody>
             </Table>
           </CardContent>
         </Card>
       )}
 
       {activeTab === "settings" && role === "admin" && (
         <Card>
           <CardHeader>
             <CardTitle>Site Settings (CMS)</CardTitle>
             <CardDescription>Update the content shown on the home page.</CardDescription>
           </CardHeader>
           <CardContent>
             <form onSubmit={handleSaveSettings} className="space-y-6">
               <div className="space-y-4">
                 <h3 className="text-lg font-bold">Hero Section</h3>
                 <div>
                   <label className="block text-sm font-medium mb-1">Title</label>
                   <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} required />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Subtitle</label>
                   <Textarea value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} required />
                 </div>
               </div>
               <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                 <h3 className="text-lg font-bold">Founders Section</h3>
                 <div>
                   <label className="block text-sm font-medium mb-1">Title</label>
                   <Input value={foundersTitle} onChange={(e) => setFoundersTitle(e.target.value)} required />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Description</label>
                   <Textarea value={foundersDescription} onChange={(e) => setFoundersDescription(e.target.value)} required className="h-32" />
                 </div>
               </div>
               <Button type="submit" disabled={isSavingSettings}>
                 {isSavingSettings ? "Saving..." : "Save Settings"}
               </Button>
             </form>
           </CardContent>
         </Card>
       )}
 
       {activeTab === "notifications" && (
         <div className="space-y-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
           <Card>
             <CardHeader>
               <CardTitle>Send Notification</CardTitle>
               <CardDescription>Broadcast a message to all users on the platform.</CardDescription>
             </CardHeader>
             <CardContent>
               <form onSubmit={handleAddNotification} className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium mb-1">Title</label>
                   <Input value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} required placeholder="e.g. New Live Session Tomorrow" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Message</label>
                   <Textarea value={notifMessage} onChange={(e) => setNotifMessage(e.target.value)} required placeholder="Details about the notification..." />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Type</label>
                   <select value={notifType} onChange={(e) => setNotifType(e.target.value)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                     <option value="info">Info (Blue)</option>
                     <option value="success">Success (Green)</option>
                     <option value="warning">Warning (Amber)</option>
                   </select>
                 </div>
                 <Button type="submit">Broadcast Message</Button>
               </form>
             </CardContent>
           </Card>
 
           <Card>
             <CardHeader>
               <CardTitle>Recent Notifications</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {notifications.length === 0 && <p className="text-sm text-slate-500">No notifications sent.</p>}
                 {notifications.map(n => (
                   <div key={n.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl relative">
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold">{n.title}</h4>
                        <Button size="sm" variant="ghost" className="text-red-500 h-6 px-2" onClick={() => handleDeleteNotification(n.id)}>Delete</Button>
                     </div>
                     <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{n.message}</p>
                     <div className="flex items-center justify-between mt-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${n.type === 'info' ? 'bg-blue-100 text-blue-700' : n.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {n.type}
                        </span>
                        <span className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </div>
       )}
     </div>
   );
 }
