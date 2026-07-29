import React from "react";
import { X, Copy, CheckCircle2, QrCode } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";

import { useMeetingStore } from "../../../../store/useMeetingStore";

export function CreateMeetingModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (meeting: any) => void }) {
  const { createMeeting, suggestAgenda, isLoading } = useMeetingStore();
  const [title, setTitle] = React.useState("Sarah's Personal Meeting Room");
  const [emailsInput, setEmailsInput] = React.useState("");
  const [agendaDesc, setAgendaDesc] = React.useState("");
  const [agenda, setAgenda] = React.useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = React.useState(false);

  const handleCreate = async () => {
    try {
      const emails = emailsInput.split(',').map(e => e.trim()).filter(e => e.length > 0);
      const meeting = await createMeeting(title, undefined, emails, agenda.length > 0 ? agenda : undefined);
      onSuccess(meeting);
    } catch (e) {
      console.error(e);
    }
  };
  const handleSuggestAgenda = async () => {
    if (!agendaDesc.trim()) return;
    try {
      setIsSuggesting(true);
      const res = await suggestAgenda(agendaDesc);
      if (res.title) setTitle(res.title);
      if (res.agenda) setAgenda(res.agenda);
    } catch (e) {
      console.error("Failed to suggest agenda", e);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <Card className="relative w-full max-w-md shadow-[0_20px_60px_rgb(0,0,0,0.12)] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-[18px] font-semibold text-stone-900 tracking-tight">Create Meeting</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <label className="block text-[13px] font-medium text-emerald-900 mb-1.5">Use AI to plan this meeting</label>
            <div className="flex gap-2">
              <Input 
                placeholder="What is this meeting about?" 
                value={agendaDesc} 
                onChange={(e) => setAgendaDesc(e.target.value)} 
                className="bg-white"
              />
              <Button onClick={handleSuggestAgenda} disabled={isSuggesting || !agendaDesc.trim()}>
                {isSuggesting ? 'Thinking...' : 'Suggest'}
              </Button>
            </div>
          </div>
          
          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Meeting Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {agenda.length > 0 && (
            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Meeting Agenda</label>
              <div className="bg-stone-50 border border-stone-100 p-3 rounded-lg text-[13.5px] text-stone-700 space-y-1.5">
                {agenda.map((point, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-emerald-500">•</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
            <Input placeholder="Enter email addresses, comma separated..." value={emailsInput} onChange={(e) => setEmailsInput(e.target.value)} />
          </div>
        </div>
        <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-3 rounded-b-[16px]">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Meeting'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function ScheduleMeetingModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (meeting: any) => void }) {
  const { createMeeting, suggestAgenda, isLoading } = useMeetingStore();
  const [topic, setTopic] = React.useState("Q3 Planning Session");
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = React.useState("10:00");
  const [emailsInput, setEmailsInput] = React.useState("");
  const [agendaDesc, setAgendaDesc] = React.useState("");
  const [agenda, setAgenda] = React.useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = React.useState(false);

  const handleSchedule = async () => {
    try {
      // Combine date and time to ISO string
      const scheduledStart = new Date(`${date}T${time}:00`).toISOString();
      const emails = emailsInput.split(',').map(e => e.trim()).filter(e => e.length > 0);
      const meeting = await createMeeting(topic, scheduledStart, emails, agenda.length > 0 ? agenda : undefined);
      onSuccess(meeting);
    } catch (e) {
      console.error(e);
    }
  };
  const handleSuggestAgenda = async () => {
    if (!agendaDesc.trim()) return;
    try {
      setIsSuggesting(true);
      const res = await suggestAgenda(agendaDesc);
      if (res.title) setTopic(res.title);
      if (res.agenda) setAgenda(res.agenda);
    } catch (e) {
      console.error("Failed to suggest agenda", e);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <Card className="relative w-full max-w-md shadow-[0_20px_60px_rgb(0,0,0,0.12)] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-[18px] font-semibold text-stone-900 tracking-tight">Schedule Meeting</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <label className="block text-[13px] font-medium text-emerald-900 mb-1.5">Use AI to plan this meeting</label>
            <div className="flex gap-2">
              <Input 
                placeholder="What is this meeting about?" 
                value={agendaDesc} 
                onChange={(e) => setAgendaDesc(e.target.value)} 
                className="bg-white"
              />
              <Button onClick={handleSuggestAgenda} disabled={isSuggesting || !agendaDesc.trim()}>
                {isSuggesting ? 'Thinking...' : 'Suggest'}
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Topic</label>
            <Input placeholder="e.g. Weekly Sync" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>

          {agenda.length > 0 && (
            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Meeting Agenda</label>
              <div className="bg-stone-50 border border-stone-100 p-3 rounded-lg text-[13.5px] text-stone-700 space-y-1.5">
                {agenda.map((point, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-emerald-500">•</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Time</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
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
            <Input placeholder="Enter email addresses, comma separated..." value={emailsInput} onChange={(e) => setEmailsInput(e.target.value)} />
          </div>
        </div>
        <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-3 rounded-b-[16px]">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSchedule} disabled={isLoading}>
            {isLoading ? 'Scheduling...' : 'Schedule'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function MeetingCreatedModal({ meeting, onClose, onStart }: { meeting: any; onClose: () => void; onStart: () => void }) {
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
            {meeting?.joinCode || "ERROR-CODE"}
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

export function MeetingDetailsModal({ meeting, onClose }: { meeting: any; onClose: () => void }) {
  const { generateSummary, generateActionItems, generateSentiment, isLoading } = useMeetingStore();
  const [isGeneratingSummary, setIsGeneratingSummary] = React.useState(false);
  const [isGeneratingActionItems, setIsGeneratingActionItems] = React.useState(false);
  const [isGeneratingSentiment, setIsGeneratingSentiment] = React.useState(false);

  const handleGenerateSummary = async () => {
    try {
      setIsGeneratingSummary(true);
      await generateSummary(meeting.id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateActionItems = async () => {
    try {
      setIsGeneratingActionItems(true);
      await generateActionItems(meeting.id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingActionItems(false);
    }
  };

  const handleGenerateSentiment = async () => {
    try {
      setIsGeneratingSentiment(true);
      await generateSentiment(meeting.id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSentiment(false);
    }
  };

  let parsedActionItems: any[] = [];
  try {
    if (meeting.actionItems) {
      parsedActionItems = JSON.parse(meeting.actionItems);
    }
  } catch (e) {
    console.error("Failed to parse action items", e);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <Card className="relative w-full max-w-lg shadow-[0_20px_60px_rgb(0,0,0,0.12)] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-[18px] font-semibold text-stone-900 tracking-tight">Meeting Details</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-5 flex-grow">
          <div>
            <label className="block text-[13px] font-medium text-stone-500 mb-1">Title</label>
            <p className="text-[15px] text-stone-900 font-medium">{meeting.title}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-stone-500 mb-1">Status</label>
              <p className="text-[14px] text-stone-900">{meeting.status}</p>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-stone-500 mb-1">Date</label>
              <p className="text-[14px] text-stone-900">
                {meeting.startedAt ? new Date(meeting.startedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[13px] font-medium text-stone-900">AI Summary</label>
              {meeting.status === 'ENDED' && !meeting.summary && (
                <Button variant="outline" onClick={handleGenerateSummary} disabled={isGeneratingSummary}>
                  {isGeneratingSummary ? 'Generating...' : 'Generate Summary'}
                </Button>
              )}
            </div>
            {meeting.summary ? (
              <div className="bg-stone-50 p-4 rounded-lg text-[14px] text-stone-700 leading-relaxed whitespace-pre-wrap">
                {meeting.summary}
              </div>
            ) : (
              <div className="text-[13px] text-stone-500 italic">
                {meeting.status === 'ENDED' ? 'No summary generated yet.' : 'Summary will be available after the meeting ends.'}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[13px] font-medium text-stone-900">Action Items</label>
              {meeting.status === 'ENDED' && !meeting.actionItems && (
                <Button variant="outline" onClick={handleGenerateActionItems} disabled={isGeneratingActionItems}>
                  {isGeneratingActionItems ? 'Generating...' : 'Extract Action Items'}
                </Button>
              )}
            </div>
            {meeting.actionItems ? (
              parsedActionItems.length > 0 ? (
                <div className="space-y-2">
                  {parsedActionItems.map((item, idx) => (
                    <div key={idx} className="bg-stone-50 p-3 rounded-lg flex items-start gap-3">
                      <div className="mt-0.5 text-stone-400"><CheckCircle2 className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[14px] text-stone-900 font-medium">{item.task}</p>
                        {(item.owner || item.dueHint) && (
                          <div className="flex items-center gap-2 mt-1 text-[12px] text-stone-500">
                            {item.owner && <span className="bg-stone-200 px-1.5 py-0.5 rounded text-stone-700">{item.owner}</span>}
                            {item.dueHint && <span>Due: {item.dueHint}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[13px] text-stone-500 italic">No action items were found in this meeting.</div>
              )
            ) : (
              <div className="text-[13px] text-stone-500 italic">
                {meeting.status === 'ENDED' ? 'No action items extracted yet.' : 'Action items will be available after the meeting ends.'}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[13px] font-medium text-stone-900">Meeting Sentiment</label>
              {meeting.status === 'ENDED' && !meeting.sentimentLabel && (
                <Button variant="outline" onClick={handleGenerateSentiment} disabled={isGeneratingSentiment}>
                  {isGeneratingSentiment ? 'Analyzing...' : 'Analyze Sentiment'}
                </Button>
              )}
            </div>
            {meeting.sentimentLabel ? (
              <div className="bg-stone-50 p-4 rounded-lg flex flex-col gap-2">
                <div>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[12px] font-bold ${
                    meeting.sentimentLabel === 'POSITIVE' ? 'bg-emerald-100 text-emerald-700' :
                    meeting.sentimentLabel === 'TENSE' ? 'bg-red-100 text-red-700' :
                    'bg-stone-200 text-stone-700'
                  }`}>
                    {meeting.sentimentLabel}
                  </span>
                </div>
                {meeting.sentimentReason && (
                  <p className="text-[13.5px] text-stone-700 leading-relaxed">
                    {meeting.sentimentReason}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-[13px] text-stone-500 italic">
                {meeting.status === 'ENDED' ? 'No sentiment analysis yet.' : 'Sentiment will be available after the meeting ends.'}
              </div>
            )}
          </div>
        </div>
        <div className="p-6 border-t border-stone-100 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </Card>
    </div>
  );
}
