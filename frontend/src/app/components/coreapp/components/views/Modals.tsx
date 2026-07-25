import React from "react";
import { X, Copy, CheckCircle2, QrCode } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";

export function CreateMeetingModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <Card className="relative w-full max-w-md shadow-[0_20px_60px_rgb(0,0,0,0.12)]">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-[18px] font-semibold text-stone-900 tracking-tight">Create Meeting</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Meeting Title</label>
            <Input defaultValue="Sarah's Personal Meeting Room" />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <div>
              <p className="text-[14px] font-medium text-stone-900">Instant Meeting</p>
              <p className="text-[13px] text-stone-500">Start the meeting immediately</p>
            </div>
            <div className="w-10 h-6 bg-emerald-500 rounded-full p-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow-sm transition-transform"></div>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <div>
              <p className="text-[14px] font-medium text-stone-900">Waiting Room</p>
              <p className="text-[13px] text-stone-500">Admit guests before they join</p>
            </div>
            <div className="w-10 h-6 bg-emerald-500 rounded-full p-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow-sm transition-transform"></div>
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Invite Participants</label>
            <Input placeholder="Enter email addresses..." />
          </div>
        </div>
        <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-3 rounded-b-[16px]">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onSuccess}>Create Meeting</Button>
        </div>
      </Card>
    </div>
  );
}

export function ScheduleMeetingModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <Card className="relative w-full max-w-md shadow-[0_20px_60px_rgb(0,0,0,0.12)]">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-[18px] font-semibold text-stone-900 tracking-tight">Schedule Meeting</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Topic</label>
            <Input placeholder="e.g. Weekly Sync" defaultValue="Q3 Planning Session" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Date</label>
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Time</label>
              <Input type="time" defaultValue="10:00" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Duration</label>
            <select className="w-full h-10 rounded-[6px] border border-stone-200 bg-white px-3 text-[14px] text-stone-900 hover:border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors">
              <option>30 minutes</option>
              <option>45 minutes</option>
              <option selected>1 hour</option>
              <option>1.5 hours</option>
              <option>2 hours</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-2 border-y border-stone-100">
            <div>
              <p className="text-[14px] font-medium text-stone-900">Waiting Room</p>
              <p className="text-[13px] text-stone-500">Admit guests before they join</p>
            </div>
            <div className="w-10 h-6 bg-emerald-500 rounded-full p-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow-sm transition-transform"></div>
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Invite Participants</label>
            <Input placeholder="Enter email addresses..." />
          </div>
        </div>
        <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-3 rounded-b-[16px]">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onSuccess}>Schedule</Button>
        </div>
      </Card>
    </div>
  );
}

export function MeetingCreatedModal({ onClose, onStart }: { onClose: () => void; onStart: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <Card className="relative w-full max-w-md shadow-[0_20px_60px_rgb(0,0,0,0.12)] p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-[20px] font-semibold text-stone-900 tracking-tight mb-2">Meeting Created</h2>
        <p className="text-[14px] text-stone-500 mb-6">Your meeting is ready to start. Share this code with participants.</p>
        
        <div className="bg-stone-50 border border-stone-200 rounded-[8px] p-4 mb-6 flex items-center justify-between">
          <div className="font-mono text-[16px] text-stone-900 font-medium tracking-widest">
            842-194-092
          </div>
          <Button variant="ghost" className="h-8 px-2 text-emerald-600 hover:text-emerald-700">
            <Copy className="w-4 h-4 mr-1.5" /> Copy
          </Button>
        </div>

        <div className="flex items-center gap-3 w-full mb-8">
          <Button variant="outline" className="flex-1 text-stone-600 h-10">
            <Copy className="w-4 h-4 mr-2" /> Copy Link
          </Button>
          <Button variant="outline" className="flex-1 text-stone-600 h-10">
            <QrCode className="w-4 h-4 mr-2" /> QR Code
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={onStart} className="w-full">Start Meeting Now</Button>
          <Button variant="ghost" onClick={onClose} className="w-full">Back to Dashboard</Button>
        </div>
      </Card>
    </div>
  );
}
