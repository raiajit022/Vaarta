import React, { useState } from "react";
import { Video, Mic, Settings, ChevronDown, Check, Globe } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { useMeetingStore } from "../../../../store/useMeetingStore";
import { DeviceTester } from "./DeviceTester";

export function JoinMeetingView({ onJoin, onBack }: { onJoin: (meeting: any) => void; onBack: () => void }) {
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
      <div className="absolute top-8 left-8">
        <Button variant="ghost" onClick={onBack} className="text-stone-500">
          &larr; Back to Dashboard
        </Button>
      </div>
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

export function PreCallDeviceCheckView({ onJoinNow, onBack }: { onJoinNow: () => void, onBack?: () => void }) {
  return (
    <div className="min-h-screen bg-[#14120F] flex items-center justify-center p-6 relative">
      {onBack && (
        <div className="absolute top-8 left-8">
          <Button variant="ghost" onClick={onBack} className="text-stone-400 hover:text-white hover:bg-stone-800">
            &larr; Back
          </Button>
        </div>
      )}
      <div className="w-full max-w-5xl bg-[#1A1712] border border-stone-800/80 rounded-[16px] p-8 shadow-2xl">
        <h2 className="text-[24px] font-semibold text-white mb-8 tracking-tight text-center">Ready to join?</h2>
        
        <div className="max-w-3xl mx-auto">
          {/* We reuse the actual DeviceTester logic so the user can test their devices fully before joining */}
          <div className="bg-white rounded-xl p-6 mb-8">
             <DeviceTester />
          </div>
          <Button className="w-full h-14 text-[16px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium" onClick={onJoinNow}>
            Join Meeting Now
          </Button>
        </div>
      </div>
    </div>
  );
}

export function WaitingRoomGuestView({ meeting, onLeave }: { meeting?: any, onLeave: () => void }) {
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
          You have joined <strong>{meeting?.title || "the meeting"}</strong>.<br />
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
