import { ReactNode } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Users, Video, LogOut, ArrowLeft } from "lucide-react";
import { VaartaLogo } from "../VaartaLogo";

interface AdminLayoutProps {
  children: ReactNode;
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export function AdminLayout({ children, onNavigate, currentRoute }: AdminLayoutProps) {
  const { user, logout } = useAuthStore();

  // If not admin, just return null or redirect (handled in CoreApp mostly, but good to double check)
  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-[#14120F]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-stone-500 mb-4">You do not have permission to view this page.</p>
          <button onClick={() => window.location.href = "/"} className="text-emerald-600 hover:underline">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "admin-users", label: "User Management", icon: Users },
    { id: "admin-meetings", label: "Active Meetings", icon: Video },
  ];

  return (
    <div className="min-h-screen flex bg-[#faf9f7] dark:bg-[#14120F] text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#1A1712] flex flex-col">
        <div className="p-6">
          <VaartaLogo />
          <div className="mt-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Admin Portal
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-200/80 dark:border-stone-800/80 space-y-2">
          <button
            onClick={() => onNavigate("dashboard")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            Back to App
          </button>
          
          <div className="flex items-center justify-between px-3 py-2 mt-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-medium text-sm shrink-0">
                {user?.fullName?.charAt(0) || user?.email?.charAt(0)}
              </div>
              <div className="truncate text-left">
                <div className="text-sm font-medium truncate">{user?.fullName || "Admin"}</div>
                <div className="text-xs text-stone-500 dark:text-stone-400 truncate">{user?.email}</div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              logout();
              window.location.reload();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
