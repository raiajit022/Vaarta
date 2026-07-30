import React, { useState } from "react";
import { Video, Mic, Settings, ChevronDown, Check, Globe } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { useMeetingStore } from "../../../../store/useMeetingStore";

export function JoinMeetingView({ onJoin }: { onJoin: (meeting: any) => void }) {
  const [joinCode, setJoinCode] = useState("");
  const { joinMeeting, isLoading, error } = useMeetingStore();

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    try {
      const meeting = await joinMeeting(joinCode.trim());
      onJoin(meeting);
    } catch (e) {
      console.error("Failed to join meeting", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <Card className="w-full max-w-[480px] p-8 relative z-10 shadow-[0_20px_60px_rgb(28,25,23,0.08)]">
        <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xl tracking-tight justify-center mb-8">
          <div className="w-7 h-7 rounded bg-gradient-to-br from-[#34d399] to-[#059669] flex items-center justify-center">
            <Video className="w-4 h-4 text-white" />
          </div>
          Vaarta
        </div>
        
        <h2 className="text-[24px] font-semibold text-stone-900 tracking-tight text-center mb-2">Join a meeting</h2>
        <p className="text-[14px] text-stone-500 text-center mb-8">Enter the meeting code or link to join</p>

        <div className="space-y-5 mb-8">
          <div>
            <Input 
              placeholder="e.g. 123-456-789" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="h-14 text-center font-mono text-[18px] tracking-[0.2em]" 
            />
          </div>
          <div>
            <Input placeholder="Your display name" defaultValue="Sarah Jenkins" className="h-12" />
          </div>
          <div className="flex items-center justify-between px-3 py-3 border border-stone-200 rounded-[6px] hover:border-stone-300 transition-colors cursor-pointer bg-white">
            <div className="flex items-center gap-2 text-stone-600 text-[14px]">
              <Globe className="w-4 h-4" /> English (US)
            </div>
            <ChevronDown className="w-4 h-4 text-stone-400" />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>

        <Button 
          className="w-full h-12 text-[15px]" 
          onClick={handleJoin}
          disabled={isLoading || !joinCode.trim()}
        >
          {isLoading ? "Joining..." : "Join Meeting"}
        </Button>
      </Card>
    </div>
  );
}

export function PreCallDeviceCheckView({ onJoinNow }: { onJoinNow: () => void }) {
  return (
    <div className="min-h-screen bg-[#14120F] flex items-center justify-center p-6 relative">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative aspect-video bg-black rounded-[16px] overflow-hidden border border-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
          {/* Camera preview mock */}
          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" alt="Camera preview" className="w-full h-full object-cover" />
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
            <button className="w-12 h-12 rounded-full bg-stone-900/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-stone-800 transition-colors border border-stone-700/50">
              <Mic className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-full bg-stone-900/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-stone-800 transition-colors border border-stone-700/50">
              <Video className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-[#1A1712] border border-stone-800/80 rounded-[16px] p-6 text-stone-100 flex flex-col">
          <h2 className="text-[20px] font-semibold mb-6 tracking-tight">Ready to join?</h2>
          
          <div className="space-y-6 flex-1">
            <div>
              <label className="block text-[13px] font-medium text-stone-400 mb-2">Microphone</label>
              <div className="flex items-center justify-between px-3 py-2.5 border border-stone-800 rounded-[6px] bg-[#14120F]">
                <span className="text-[14px]">MacBook Pro Microphone</span>
                <ChevronDown className="w-4 h-4 text-stone-500" />
              </div>
              <div className="flex items-center gap-1 mt-3">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className={`h-1.5 w-1.5 rounded-full ${i < 5 ? 'bg-emerald-500' : 'bg-stone-800'}`}></div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-stone-400 mb-2">Camera</label>
              <div className="flex items-center justify-between px-3 py-2.5 border border-stone-800 rounded-[6px] bg-[#14120F]">
                <span className="text-[14px]">FaceTime HD Camera</span>
                <ChevronDown className="w-4 h-4 text-stone-500" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-stone-400 mb-2">Speaker</label>
              <div className="flex items-center justify-between px-3 py-2.5 border border-stone-800 rounded-[6px] bg-[#14120F]">
                <span className="text-[14px]">MacBook Pro Speakers</span>
                <ChevronDown className="w-4 h-4 text-stone-500" />
              </div>
            </div>
          </div>

          <Button className="w-full mt-6 h-12 text-[15px]" onClick={onJoinNow}>Join Now</Button>
        </div>
      </div>
    </div>
  );
}

export function WaitingRoomGuestView({ onLeave }: { onLeave: () => void }) {
  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
          <div className="absolute inset-2 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <Video className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-[24px] font-semibold text-stone-900 tracking-tight mb-2">Waiting for the host</h2>
        <p className="text-[15px] text-stone-500 leading-relaxed mb-8">
          You have joined <strong>Q3 Product Strategy Sync</strong>.<br />
          The host will let you in shortly.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onLeave}>Leave Meeting</Button>
          {/* For prototype purposes, let the guest join directly */}
          <Button onClick={() => window.dispatchEvent(new CustomEvent('admit-guest'))}>Enter (Demo)</Button>
        </div>
      </div>
    </div>
  );
}

export function WaitingRoomHostView({ onAdmitAll }: { onAdmitAll: () => void }) {
  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-1">Waiting Room</h1>
          <p className="text-[15px] text-stone-500">3 people are waiting to join</p>
        </div>
        <Button onClick={onAdmitAll}>Admit All</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-stone-100">
          {[
            { name: "Michael Chen", role: "Engineering", img: "https://i.pravatar.cc/150?u=1" },
            { name: "Emma Watson", role: "Design", img: "https://i.pravatar.cc/150?u=2" },
            { name: "David Kim", role: "Marketing", img: "https://i.pravatar.cc/150?u=3" }
          ].map((person, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-4">
                <img src={person.img} alt={person.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-[15px] font-medium text-stone-900">{person.name}</p>
                  <p className="text-[13px] text-stone-500">{person.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">Decline</Button>
                <Button variant="secondary">Admit</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
