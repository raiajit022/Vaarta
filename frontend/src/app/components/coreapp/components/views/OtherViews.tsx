import React, { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Calendar, Video, Clock, Users, Search, Play, Phone, Mail, Settings, User, Bell, Shield, Copy, Plus, X } from "lucide-react";
import { useAuthStore } from "../../../../store/useAuthStore";

export function MeetingsView({ onScheduleMeeting }: { onScheduleMeeting: () => void }) {
  const [activeTab, setActiveTab] = useState("upcoming");

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-1">Meetings</h1>
          <p className="text-[15px] text-stone-500">Manage your schedule and upcoming calls.</p>
        </div>
        <Button onClick={onScheduleMeeting}>Schedule Meeting</Button>
      </div>

      <div className="mb-6 flex gap-4 border-b border-stone-200">
        <button 
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2 text-[14px] font-medium transition-colors ${activeTab === "upcoming" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-stone-500 hover:text-stone-900"}`}
        >
          Upcoming
        </button>
        <button 
          onClick={() => setActiveTab("past")}
          className={`px-4 py-2 text-[14px] font-medium transition-colors ${activeTab === "past" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-stone-500 hover:text-stone-900"}`}
        >
          Past
        </button>
        <button 
          onClick={() => setActiveTab("personal")}
          className={`px-4 py-2 text-[14px] font-medium transition-colors ${activeTab === "personal" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-stone-500 hover:text-stone-900"}`}
        >
          Personal Room
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === "upcoming" && (
          [
            { title: "Q3 Product Strategy Sync", time: "10:00 AM - 11:30 AM", date: "Today", pax: 8 },
            { title: "Design Review: Mobile App", time: "2:00 PM - 3:00 PM", date: "Today", pax: 4 },
            { title: "Weekly Engineering Standup", time: "10:00 AM - 10:30 AM", date: "Tomorrow", pax: 12 },
          ].map((meeting, i) => (
            <Card key={i} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 flex flex-col items-center justify-center text-emerald-700 shrink-0">
                  <span className="text-[11px] font-semibold uppercase">{meeting.date === "Today" ? "TODAY" : "TMRW"}</span>
                </div>
                <div>
                  <h3 className="font-medium text-stone-900 text-[16px] mb-1">{meeting.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-[13px] text-stone-500">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {meeting.time}</span>
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {meeting.pax} Participants</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="secondary" className="h-9">Copy Link</Button>
                <Button className="h-9">Start</Button>
              </div>
            </Card>
          ))
        )}

        {activeTab === "past" && (
          [
            { title: "Marketing All Hands", time: "11:00 AM - 12:00 PM", date: "Yesterday" },
            { title: "Client Discovery Call", time: "3:00 PM - 4:00 PM", date: "Oct 24" },
          ].map((meeting, i) => (
            <Card key={i} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-stone-100 flex flex-col items-center justify-center text-stone-600 shrink-0">
                  <span className="text-[11px] font-semibold uppercase">PAST</span>
                </div>
                <div>
                  <h3 className="font-medium text-stone-900 text-[16px] mb-1">{meeting.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-[13px] text-stone-500">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {meeting.date}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {meeting.time}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="secondary" className="h-9 text-stone-600">View Recording</Button>
              </div>
            </Card>
          ))
        )}

        {activeTab === "personal" && (
          <Card className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <Video className="w-8 h-8" />
            </div>
            <h2 className="text-[20px] font-semibold text-stone-900 tracking-tight mb-2">Sarah's Personal Meeting Room</h2>
            <p className="text-[15px] text-stone-500 mb-8 max-w-md">Your personal meeting room is a permanently reserved virtual room that you can access with your Personal Meeting ID.</p>
            
            <div className="bg-stone-50 border border-stone-200 rounded-[8px] p-4 mb-8 flex items-center justify-between w-full max-w-sm">
              <div className="font-mono text-[16px] text-stone-900 font-medium tracking-widest">
                842-194-092
              </div>
              <Button variant="ghost" className="h-8 px-2 text-emerald-600 hover:text-emerald-700">
                <Copy className="w-4 h-4 mr-1.5" /> Copy
              </Button>
            </div>

            <div className="flex gap-3">
              <Button className="px-8">Start Meeting</Button>
              <Button variant="outline" className="px-8">Copy Invitation</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export function RecordingsView() {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-1">Recordings</h1>
          <p className="text-[15px] text-stone-500">Review past meetings and transcripts.</p>
        </div>
        <div className="w-72">
          <Input icon={<Search className="w-4 h-4" />} placeholder="Search recordings..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Design Review: Mobile App", date: "Oct 24, 2023", duration: "45m", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400" },
          { title: "Q3 Planning Session", date: "Oct 22, 2023", duration: "1h 15m", img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=400" },
          { title: "All Hands Meeting", date: "Oct 20, 2023", duration: "50m", img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=400" },
        ].map((rec, i) => (
          <Card key={i} className="overflow-hidden group cursor-pointer hover:shadow-[0_8px_30px_rgb(28,25,23,0.08)] transition-all">
            <div className="relative aspect-video bg-stone-100 overflow-hidden">
              <img src={rec.img} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-stone-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-stone-900">
                  <Play className="w-5 h-5 ml-1" />
                </div>
              </div>
              <div className="absolute bottom-3 right-3 bg-stone-900/80 backdrop-blur-md text-white text-[12px] font-medium px-2 py-1 rounded">
                {rec.duration}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-stone-900 text-[15px] mb-1 line-clamp-1">{rec.title}</h3>
              <p className="text-[13px] text-stone-500">{rec.date}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ContactsView() {
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-1">Contacts</h1>
          <p className="text-[15px] text-stone-500">Your directory and frequent collaborators.</p>
        </div>
        <Button onClick={() => setIsAddContactModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Contact
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-stone-100 bg-stone-50/50">
          <Input icon={<Search className="w-4 h-4" />} placeholder="Search by name, email, or role..." className="max-w-md" />
        </div>
        <div className="divide-y divide-stone-100">
          {[
            { name: "Michael Chen", role: "Engineering Lead", email: "m.chen@vaarta.com", img: "https://i.pravatar.cc/150?u=1" },
            { name: "Emma Watson", role: "Product Designer", email: "emma.w@vaarta.com", img: "https://i.pravatar.cc/150?u=2" },
            { name: "David Kim", role: "Marketing Director", email: "david.k@vaarta.com", img: "https://i.pravatar.cc/150?u=3" },
            { name: "Sarah Jenkins", role: "Product Manager", email: "sarah.j@vaarta.com", img: "https://i.pravatar.cc/150?u=4" },
            { name: "Alex Rivera", role: "Sales Executive", email: "arivera@vaarta.com", img: "https://i.pravatar.cc/150?u=5" },
          ].map((contact, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-4">
                <img src={contact.img} alt={contact.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-[15px] font-medium text-stone-900">{contact.name}</p>
                  <p className="text-[13px] text-stone-500">{contact.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <span className="text-[14px] text-stone-500 hidden md:block w-48 truncate">{contact.email}</span>
                <div className="flex items-center gap-2">
                  <button className="w-9 h-9 rounded-full bg-white border border-stone-200 text-stone-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 shadow-sm flex items-center justify-center transition-colors">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 rounded-full bg-white border border-stone-200 text-stone-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 shadow-sm flex items-center justify-center transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 rounded-full bg-white border border-stone-200 text-stone-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 shadow-sm flex items-center justify-center transition-colors">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add Contact Modal */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setIsAddContactModalOpen(false)}></div>
          <Card className="relative w-full max-w-md shadow-[0_20px_60px_rgb(0,0,0,0.12)]">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-[18px] font-semibold text-stone-900 tracking-tight">Add Contact</h2>
              <button onClick={() => setIsAddContactModalOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Email Address</label>
                <Input placeholder="e.g. jane@vaarta.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-1.5">First Name</label>
                  <Input placeholder="Jane" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Last Name</label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Company or Role (Optional)</label>
                <Input placeholder="e.g. Design Director" />
              </div>
            </div>
            <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-3 rounded-b-[16px]">
              <Button variant="ghost" onClick={() => setIsAddContactModalOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsAddContactModalOpen(false)}>Add Contact</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export function SettingsView() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState("profile");
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(user?.avatarUrl || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChangePhoto = () => {
    // Open the hidden file picker
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setAvatarUrl(url);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <Card className="p-6">
            <h2 className="text-[16px] font-semibold text-stone-900 mb-6">Public Profile</h2>
            <div className="flex items-start gap-6 mb-8">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border border-stone-200" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-semibold">
                  {user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  <Button variant="secondary" className="h-9" onClick={handleChangePhoto}>Change Photo</Button>
                  <Button variant="ghost" className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setAvatarUrl(null)}>Remove</Button>
                </div>
                <p className="text-[13px] text-stone-500">JPG, GIF or PNG. Max size of 5MB.</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-1.5">First Name</label>
                  <Input defaultValue={user?.fullName?.split(' ')[0] || ''} />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Last Name</label>
                  <Input defaultValue={user?.fullName?.split(' ').slice(1).join(' ') || ''} />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Email Address</label>
                <Input defaultValue={user?.email || ''} readOnly className="bg-stone-50 text-stone-500" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Personal Meeting ID</label>
                <div className="flex gap-3">
                  <Input defaultValue="842-194-092" className="font-mono text-[15px]" />
                  <Button variant="outline">Edit</Button>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-stone-100 flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </Card>
        );
      case "audio-video":
        return (
          <Card className="p-6">
            <h2 className="text-[16px] font-semibold text-stone-900 mb-6">Audio & Video Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Camera</label>
                <select className="w-full h-10 rounded-[6px] border border-stone-200 bg-white px-3 text-[14px] text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors">
                  <option>FaceTime HD Camera (Built-in)</option>
                  <option>External 1080p Webcam</option>
                </select>
                <div className="mt-3 aspect-video bg-stone-100 rounded-[8px] border border-stone-200 flex items-center justify-center relative overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="pt-6 border-t border-stone-100">
                <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Microphone</label>
                <div className="flex gap-3 mb-3">
                  <select className="flex-1 h-10 rounded-[6px] border border-stone-200 bg-white px-3 text-[14px] text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors">
                    <option>MacBook Pro Microphone</option>
                    <option>External USB Mic</option>
                  </select>
                  <Button variant="secondary">Test Mic</Button>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[12px] text-stone-500 w-12">Input</span>
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className={`h-1.5 w-1.5 rounded-full ${i < 6 ? 'bg-emerald-500' : 'bg-stone-200'}`}></div>
                  ))}
                </div>
              </div>
              <div className="pt-6 border-t border-stone-100">
                <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Speaker</label>
                <div className="flex gap-3">
                  <select className="flex-1 h-10 rounded-[6px] border border-stone-200 bg-white px-3 text-[14px] text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors">
                    <option>MacBook Pro Speakers</option>
                    <option>External Headphones</option>
                  </select>
                  <Button variant="secondary">Test Speaker</Button>
                </div>
              </div>
            </div>
          </Card>
        );
      case "notifications":
        return (
          <Card className="p-6">
            <h2 className="text-[16px] font-semibold text-stone-900 mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { title: "Meeting Reminders", desc: "Get notified 10 minutes before a meeting starts" },
                { title: "Chat Messages", desc: "Receive notifications for direct messages" },
                { title: "New Recordings", desc: "Alert me when a meeting recording is ready to view" },
                { title: "Email Updates", desc: "Receive daily digests and product updates via email" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
                  <div>
                    <p className="text-[14px] font-medium text-stone-900">{item.title}</p>
                    <p className="text-[13px] text-stone-500">{item.desc}</p>
                  </div>
                  <div className="w-10 h-6 bg-emerald-500 rounded-full p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow-sm transition-transform"></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      case "security":
        return (
          <Card className="p-6">
            <h2 className="text-[16px] font-semibold text-stone-900 mb-6">Security & Login</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-[14px] font-medium text-stone-900 mb-4">Change Password</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Current Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-stone-700 mb-1.5">New Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <Button>Update Password</Button>
                </div>
              </div>
              <div className="pt-6 border-t border-stone-100">
                <h3 className="text-[14px] font-medium text-stone-900 mb-1">Two-Factor Authentication</h3>
                <p className="text-[13px] text-stone-500 mb-4">Add an extra layer of security to your account.</p>
                <div className="flex items-center justify-between p-4 border border-stone-200 rounded-[8px] bg-stone-50">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-[14px] font-medium text-stone-900">Authenticator App</p>
                      <p className="text-[13px] text-stone-500">Not configured</p>
                    </div>
                  </div>
                  <Button variant="outline">Set Up</Button>
                </div>
              </div>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full flex gap-8">
      <div className="w-64 shrink-0">
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-6">Settings</h1>
        <nav className="space-y-1">
          {[
            { id: "profile", icon: User, label: "Profile" },
            { id: "audio-video", icon: Video, label: "Audio & Video" },
            { id: "notifications", icon: Bell, label: "Notifications" },
            { id: "security", icon: Shield, label: "Security" },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-[6px] text-[14px] font-medium transition-colors ${activeTab === item.id ? "bg-emerald-50 text-emerald-700" : "text-stone-600 hover:bg-stone-100"}`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="flex-1 max-w-2xl space-y-6">
        {renderTabContent()}
      </div>
    </div>
  );
}
