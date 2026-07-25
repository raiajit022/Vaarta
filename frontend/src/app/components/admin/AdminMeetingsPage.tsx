import { useState, useEffect } from "react";
import { meetingClient } from "../../apiClient";
import { Video, Users, Calendar, AlertCircle } from "lucide-react";

interface AdminMeeting {
  id: string;
  hostId: string;
  title: string;
  joinCode: string;
  status: string;
  scheduledStart: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  participants: any[]; // can simplify for admin view
}

export function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<AdminMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await meetingClient.get("/api/admin/meetings");
      setMeetings(res.data);
    } catch (err: any) {
      setError("Failed to fetch meetings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const forceEndMeeting = async (meetingId: string) => {
    if (!confirm("Are you sure you want to forcefully end this meeting?")) return;
    
    try {
      await meetingClient.post(`/api/admin/meetings/${meetingId}/force-end`);
      setMeetings(meetings.map(m => m.id === meetingId ? { ...m, status: "ENDED", endedAt: new Date().toISOString() } : m));
    } catch (err) {
      console.error("Failed to force end meeting", err);
      alert("Failed to force end meeting.");
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-stone-200 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-stone-200 rounded"></div><div className="h-4 bg-stone-200 rounded w-5/6"></div></div></div></div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-white">
          Active Meetings
        </h1>
        <div className="text-sm text-stone-500">
          Total meetings: {meetings.length}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1712] border border-stone-200/80 dark:border-stone-800/80 rounded-[12px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600 dark:text-stone-300">
            <thead className="bg-stone-50/50 dark:bg-stone-800/30 text-stone-500 dark:text-stone-400 font-medium border-b border-stone-200/80 dark:border-stone-800/80">
              <tr>
                <th className="px-6 py-4 font-medium">Meeting Info</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Timing</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {meetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Video size={14} className="text-stone-400" />
                      {meeting.title}
                    </div>
                    <div className="text-stone-500 dark:text-stone-400 text-xs mt-1">
                      Code: <span className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">{meeting.joinCode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      meeting.status === 'LIVE' 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20' 
                        : meeting.status === 'SCHEDULED'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20'
                        : meeting.status === 'ENDED'
                        ? 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border border-stone-200/60 dark:border-stone-700'
                        : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/60 dark:border-red-500/20'
                    }`}>
                      {meeting.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs text-stone-500">
                      {meeting.scheduledStart && (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(meeting.scheduledStart).toLocaleString()}
                        </div>
                      )}
                      {meeting.startedAt && (
                        <div>Started: {new Date(meeting.startedAt).toLocaleTimeString()}</div>
                      )}
                      {meeting.endedAt && (
                        <div>Ended: {new Date(meeting.endedAt).toLocaleTimeString()}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {meeting.status !== 'ENDED' && meeting.status !== 'CANCELLED' && (
                      <button 
                        onClick={() => forceEndMeeting(meeting.id)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/20 transition-colors"
                      >
                        <AlertCircle size={14} />
                        Force End
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              
              {meetings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-stone-500">
                    No meetings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
