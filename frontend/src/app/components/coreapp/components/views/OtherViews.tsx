import React, { useState, useEffect } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Calendar, Video, Clock, Users, Search, Play, Phone, Mail, Settings, User, Bell, Shield, Copy, Plus, X } from "lucide-react";
import { useAuthStore } from "../../../../store/useAuthStore";
import { useMeetingStore } from "../../../../store/useMeetingStore";
import { DeviceTester } from "./DeviceTester";
import { userClient } from "../../../../apiClient";

/**
 * Displays a list of upcoming and past meetings.
 * Allows the user to view meeting details, copy join links, and join active meetings.
 *
 * @param props.onScheduleMeeting Callback to open the 'Schedule Meeting' modal.
 */
export function MeetingsView({ onScheduleMeeting }: { onScheduleMeeting: () => void }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const { meetings, fetchMyMeetings, deleteMeeting, isLoading } = useMeetingStore();

  useEffect(() => {
    fetchMyMeetings();
  }, [fetchMyMeetings]);

  const parseDate = (d: any) => {
    if (!d) return 0;
    if (Array.isArray(d)) {
      return new Date(d[0], (d[1] || 1) - 1, d[2] || 1, d[3] || 0, d[4] || 0, d[5] || 0).getTime();
    }
    return new Date(d).getTime();
  };

  const isPast = (m: any) => {
    if (m.status === 'ENDED' || m.status === 'CANCELLED') return true;
    
    if (!m.scheduledStart) {
      // Instant meeting: past if older than 1 hour
      if (m.createdAt) {
        const createdDate = parseDate(m.createdAt);
        const now = Date.now();
        if (!isNaN(createdDate) && (now - createdDate) / (1000 * 60 * 60) > 1) return true;
      }
    } else {
      // Scheduled meeting: past if it started more than 1 hour ago
      const scheduledDate = parseDate(m.scheduledStart);
      const now = Date.now();
      if (!isNaN(scheduledDate) && (now - scheduledDate) / (1000 * 60 * 60) > 1) return true;
    }
    return false;
  };

  const formatMeetingDate = (d: any) => {
    const timestamp = parseDate(d);
    if (!timestamp || isNaN(timestamp)) return 'Invalid Date';
    return new Date(timestamp).toLocaleString();
  };

  const upcomingMeetings = meetings.filter(m => !isPast(m));
  const pastMeetings = meetings.filter(m => isPast(m));

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      await deleteMeeting(id);
    }
  };

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
      </div>

      <div className="space-y-4">
        {isLoading && <p className="text-stone-500">Loading...</p>}
        {activeTab === "upcoming" && (
          <>
            {!isLoading && upcomingMeetings.length === 0 && <p className="text-stone-500">No upcoming meetings.</p>}
            {upcomingMeetings.map((meeting) => (
              <Card key={meeting.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full ${meeting.status === 'LIVE' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center shrink-0`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-stone-900 mb-1">{meeting.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-stone-500">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {meeting.scheduledStart ? formatMeetingDate(meeting.scheduledStart) : 'Instant Meeting'}</span>
                      <span className="flex items-center gap-1.5 font-mono text-stone-700">{meeting.joinCode}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(meeting.id)}>
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                  <Button variant="outline" className="flex-1 md:flex-none">Copy Link</Button>
                  <Button className="flex-1 md:flex-none">Join Now</Button>
                </div>
              </Card>
            ))}
          </>
        )}

        {activeTab === "past" && (
          <>
            {!isLoading && pastMeetings.length === 0 && <p className="text-stone-500">No past meetings.</p>}
            {pastMeetings.map((meeting) => (
              <Card key={meeting.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-stone-900 mb-1">{meeting.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-stone-500">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {meeting.endedAt ? new Date(parseDate(meeting.endedAt)).toLocaleDateString() : 'Ended'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(meeting.id)}>
                    <X className="w-4 h-4 mr-1" /> Clear
                  </Button>
                  <Button variant="secondary" className="flex-1 md:flex-none">View Details</Button>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Displays a directory of user contacts.
 */
export function ContactsView() {
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const res = await userClient.get('/api/users/contacts');
      setContacts(res.data);
    } catch (e) {
      console.error("Failed to fetch contacts", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddContact = async () => {
    if (!email.trim()) return;
    try {
      const name = `${firstName} ${lastName}`.trim();
      await userClient.post('/api/users/contacts', { email, name });
      setIsAddContactModalOpen(false);
      setEmail("");
      setFirstName("");
      setLastName("");
      fetchContacts();
    } catch (e) {
      console.error("Failed to add contact", e);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      await userClient.delete(`/api/users/contacts/${id}`);
      fetchContacts();
    } catch (e) {
      console.error("Failed to delete contact", e);
    }
  };

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
          {isLoading && <div className="p-4 text-stone-500">Loading contacts...</div>}
          {!isLoading && contacts.length === 0 && <div className="p-4 text-stone-500">No contacts added yet.</div>}
          {contacts.map((contact, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium">
                  {contact.contactName ? contact.contactName.charAt(0).toUpperCase() : contact.contactEmail.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[15px] font-medium text-stone-900">{contact.contactName}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <span className="text-[14px] text-stone-500 hidden md:block w-48 truncate">{contact.contactEmail}</span>
                <div className="flex items-center gap-2">
                  <button className="w-9 h-9 rounded-full bg-white border border-stone-200 text-stone-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 shadow-sm flex items-center justify-center transition-colors">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="w-9 h-9 rounded-full bg-white border border-stone-200 text-stone-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 shadow-sm flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
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
                <Input placeholder="e.g. jane@vaarta.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-1.5">First Name</label>
                  <Input placeholder="Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Last Name</label>
                  <Input placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-3 rounded-b-[16px]">
              <Button variant="ghost" onClick={() => setIsAddContactModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddContact}>Add Contact</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/**
 * Renders the user settings page, allowing profile updates, 
 * audio/video configuration, notification preferences, and security settings.
 */
export function SettingsView() {
  const { user, fetchProfile } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState("profile");
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(user?.avatarUrl || null);
  const [firstName, setFirstName] = React.useState(user?.fullName?.split(' ')[0] || '');
  const [lastName, setLastName] = React.useState(user?.fullName?.split(' ').slice(1).join(' ') || '');
  const [organization, setOrganization] = React.useState(user?.organization || '');
  const [timezone, setTimezone] = React.useState(user?.timezone || 'Asia/Kolkata');
  const [isSaving, setIsSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChangePhoto = () => {
    // We will just prompt for a URL for now to simplify
    const url = window.prompt("Enter image URL for your avatar:", avatarUrl || "");
    if (url) {
      setAvatarUrl(url);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { userClient } = await import('../../../../apiClient');
      await userClient.put('/api/users/me', {
        displayName: `${firstName} ${lastName}`.trim(),
        avatarUrl,
        organization,
        timezone,
      });
      await fetchProfile();
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
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
                  <Button variant="secondary" className="h-9" onClick={handleChangePhoto}>Change Photo URL</Button>
                  <Button variant="ghost" className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleRemovePhoto}>Remove</Button>
                </div>
                <p className="text-[13px] text-stone-500">Provide a direct URL to your avatar.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-1.5">First Name</label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Last Name</label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Organization</label>
                  <Input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="e.g. Acme Corp" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Timezone</label>
                  <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Email Address</label>
                <Input value={user?.email || ''} readOnly className="bg-stone-50 text-stone-500" />
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-stone-100 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </Card>
        );
      case "audio-video":
        return (
          <Card className="p-6">
            <h2 className="text-[16px] font-semibold text-stone-900 mb-6">Audio & Video Settings</h2>
            <DeviceTester />
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
