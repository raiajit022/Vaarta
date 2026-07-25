import React, { useState, useRef, useEffect } from "react";
import { Home, Calendar, Video, Users, Settings, Search, Bell, ChevronDown, Shield } from "lucide-react";
import { cn } from "../../utils/cn";
import { Input } from "../ui/Input";
import { useAuthStore } from "../../../../store/useAuthStore";

export function Sidebar({ currentView, setView }: { currentView: string, setView: (v: string) => void }) {
  const { user } = useAuthStore();
  
  const items = [
    { id: "dashboard", icon: Home, label: "Home" },
    { id: "meetings", icon: Calendar, label: "Meetings" },
    { id: "recordings", icon: Video, label: "Recordings" },
    { id: "contacts", icon: Users, label: "Contacts" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  if (user?.role === 'ADMIN') {
    items.push({ id: "admin-users", icon: Shield, label: "Admin Portal" });
  }

  return (
    <div className="w-64 border-r border-stone-200 bg-[#faf9f7] h-screen flex flex-col relative z-10">
      <div className="h-16 flex items-center px-6">
        <div className="flex items-center gap-2 text-emerald-600 font-semibold text-lg tracking-tight">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-[#34d399] to-[#059669] flex items-center justify-center">
            <Video className="w-4 h-4 text-white" />
          </div>
          Vaarta
        </div>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-[6px] text-[14px] font-medium transition-colors",
              currentView === item.id
                ? "bg-emerald-50 text-emerald-700"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            )}
          >
            <item.icon className="w-[18px] h-[18px]" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export function TopNav({ onAvatarClick }: { onAvatarClick?: () => void }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuthStore();
  const initial = user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-16 border-b border-stone-200 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="w-96">
        <Input icon={<Search className="w-4 h-4" />} placeholder="Search meetings, recordings, or contacts..." />
      </div>
      <div className="flex items-center gap-4 relative">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors relative", showNotifications ? "bg-stone-100 text-stone-900" : "text-stone-500 hover:bg-stone-100")}
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-stone-100 overflow-hidden py-2 z-50">
              <div className="px-4 py-2 border-b border-stone-50 flex items-center justify-between">
                <span className="font-semibold text-[14px] text-stone-900">Notifications</span>
                <button className="text-[12px] text-emerald-600 hover:text-emerald-700 font-medium">Mark all as read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-stone-50 transition-colors cursor-pointer flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5"><Video className="w-4 h-4" /></div>
                  <div>
                    <p className="text-[13px] text-stone-900 leading-snug"><strong>David Kim</strong> invited you to <strong>Marketing Sync</strong></p>
                    <p className="text-[12px] text-stone-500 mt-1">10 mins ago</p>
                  </div>
                </div>
                <div className="px-4 py-3 hover:bg-stone-50 transition-colors cursor-pointer flex gap-3 opacity-60">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"><Calendar className="w-4 h-4" /></div>
                  <div>
                    <p className="text-[13px] text-stone-900 leading-snug">Upcoming: <strong>Q3 Product Strategy Sync</strong> starts in 15 minutes.</p>
                    <p className="text-[12px] text-stone-500 mt-1">15 mins ago</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div 
          className="flex items-center gap-2 cursor-pointer hover:bg-stone-50 p-1 pr-2 rounded-full transition-colors"
          onClick={onAvatarClick}
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-medium text-[13px]">
              {initial}
            </div>
          )}
          <ChevronDown className="w-4 h-4 text-stone-500" />
        </div>
      </div>
    </div>
  );
}
