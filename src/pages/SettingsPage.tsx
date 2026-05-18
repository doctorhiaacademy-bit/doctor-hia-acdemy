import { useStore } from "@/src/lib/store";
import { Button } from "@/src/components/ui/button";

export default function SettingsPage() {
  const { user, isDarkMode, toggleDarkMode } = useStore();

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-slate-500">You must be signed in to view your settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl font-bold mb-8 text-slate-900 dark:text-white">Account Settings</h1>
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-8">
        
        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            Profile Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 items-center">
               <span className="text-slate-500 font-medium">Name</span>
               <span className="col-span-2">{user.displayName}</span>
            </div>
            <div className="grid grid-cols-3 items-center">
               <span className="text-slate-500 font-medium">Email</span>
               <span className="col-span-2">{user.email}</span>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-100 dark:border-slate-800 pt-8">
          <h2 className="text-xl font-semibold mb-6">Appearance</h2>
          <div className="flex items-center justify-between">
             <div>
               <h3 className="font-medium text-slate-900 dark:text-white">Dark Mode</h3>
               <p className="text-slate-500 text-sm">Adjust the theme of the website.</p>
             </div>
             <Button onClick={toggleDarkMode} variant="outline" className="rounded-full">
               {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
             </Button>
          </div>
        </section>
        
        <section className="border-t border-slate-100 dark:border-slate-800 pt-8">
          <h2 className="text-xl font-semibold mb-6">Learning Preferences</h2>
          <p className="text-slate-500 text-sm italic">Additional customization options coming soon.</p>
        </section>

      </div>
    </div>
  );
}
