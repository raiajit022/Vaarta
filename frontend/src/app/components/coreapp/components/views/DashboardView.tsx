import React from "react";
import { Plus, Video, Calendar, Clock, Users, ArrowRight, MoreHorizontal } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useAuthStore } from "../../../../store/useAuthStore";

export function DashboardView({
  onCreateMeeting,
  onJoinMeeting,
  onScheduleMeeting,
}: {
  onCreateMeeting: () => void;
  onJoinMeeting: () => void;
  onScheduleMeeting: () => void;
}) {
  const { user } = useAuthStore();
  const displayName = user?.fullName || user?.email.split('@')[0] || 'User';

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-1">Good morning, {displayName}.</h1>
        <p className="text-[15px] text-stone-500 leading-relaxed">You have 3 meetings scheduled for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="p-6 hover:shadow-[0_8px_30px_rgb(28,25,23,0.08)] transition-all cursor-pointer flex flex-col justify-between" onClick={onCreateMeeting}>
          <div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-stone-900 mb-1">New Meeting</h3>
            <p className="text-[14px] text-stone-500">Start an instant video call</p>
          </div>
        </Card>
        
        <Card className="p-6 hover:shadow-[0_8px_30px_rgb(28,25,23,0.08)] transition-all cursor-pointer flex flex-col justify-between" onClick={onJoinMeeting}>
          <div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-stone-900 mb-1">Join Meeting</h3>
            <p className="text-[14px] text-stone-500">Enter a meeting code to join</p>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-[0_8px_30px_rgb(28,25,23,0.08)] transition-all cursor-pointer flex flex-col justify-between" onClick={onScheduleMeeting}>
          <div>
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-stone-900 mb-1">Schedule</h3>
            <p className="text-[14px] text-stone-500">Plan a meeting for later</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-stone-900 tracking-tight">Upcoming Meetings</h2>
            <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 h-8 px-2">View all</Button>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-12 rounded-full bg-emerald-500"></div>
                  <div>
                    <h4 className="font-medium text-stone-900 text-[14px]">Q3 Product Strategy Sync</h4>
                    <div className="flex items-center gap-3 text-[13px] text-stone-500 mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 10:00 AM - 11:30 AM</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 8 Participants</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" className="h-8">Details</Button>
                  <Button className="h-8">Join Now</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-stone-900 tracking-tight">Recent Activity</h2>
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-stone-100">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 flex gap-3 hover:bg-stone-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 text-stone-500" />
                  </div>
                  <div>
                    <p className="text-[14px] text-stone-900 font-medium">Design Review Recording</p>
                    <p className="text-[13px] text-stone-500 mt-0.5">Ready to view • 2 hrs ago</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-stone-50 border-t border-stone-100 text-center">
              <Button variant="ghost" className="w-full text-stone-500 h-8 text-[13px]">View all activity <ArrowRight className="w-3 h-3 ml-1" /></Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
