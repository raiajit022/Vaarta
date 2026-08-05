import React, { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference, RoomAudioRenderer, useChat } from '@livekit/components-react';
import '@livekit/components-styles';
import { useMeetingStore } from "../../../../store/useMeetingStore";
import { useAuthStore } from "../../../../store/useAuthStore";

/**
 * A hidden component that listens to the LiveKit data channel for chat messages.
 * If the local user sends a message starting with "@bot", it triggers the AI command workflow.
 */
function BotChatListener({ meetingId }: { meetingId: string }) {
  const { chatMessages } = useChat();
  const { sendBotCommand } = useMeetingStore();
  const [lastProcessedId, setLastProcessedId] = useState<string | null>(null);

  useEffect(() => {
    if (chatMessages.length === 0) return;
    const latest = chatMessages[chatMessages.length - 1];

    // Process only if it's new, originated from the local user, and starts with @bot
    if (latest.id !== lastProcessedId && latest.from?.isLocal && latest.message.trim().toLowerCase().startsWith("@bot")) {
      setLastProcessedId(latest.id);
      // Fire and forget; the backend will inject the response into the LiveKit data channel
      sendBotCommand(meetingId, latest.message).catch(console.error);
    }
  }, [chatMessages, lastProcessedId, meetingId, sendBotCommand]);

  return null;
}

function AIAssistantPanel() {
  const { send } = useChat();
  const [isOpen, setIsOpen] = useState(false);

  const handleCommand = (cmd: string) => {
    if (send) {
      send(cmd).catch(console.error);
    }
    setIsOpen(false);
  };

  return (
    <div className="absolute top-4 right-4 z-[100]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-stone-800 hover:bg-stone-700 text-white p-2.5 rounded-full shadow-lg border border-stone-700 transition-colors"
        title="AI Assistant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 bg-stone-900/95 backdrop-blur text-white rounded-xl shadow-2xl border border-stone-700 w-64 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
              AI Assistant
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </div>

          <p className="text-[13px] text-stone-400 mb-3 leading-relaxed">
            Type <span className="font-mono text-emerald-400 bg-emerald-400/10 px-1 py-0.5 rounded">@bot</span> in the chat to ask questions, or use a quick action:
          </p>

          <div className="space-y-2">
            <button onClick={() => handleCommand("@bot summarize the meeting so far")} className="w-full text-left px-3 py-2 text-[13px] font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-md transition-colors border border-stone-700 hover:border-stone-500 flex items-center gap-2">
              <span className="text-base">📝</span> Summarize
            </button>
            <button onClick={() => handleCommand("@bot list action items")} className="w-full text-left px-3 py-2 text-[13px] font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-md transition-colors border border-stone-700 hover:border-stone-500 flex items-center gap-2">
              <span className="text-base">📋</span> Action Items
            </button>
            <button onClick={() => handleCommand("@bot how is the mood")} className="w-full text-left px-3 py-2 text-[13px] font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-md transition-colors border border-stone-700 hover:border-stone-500 flex items-center gap-2">
              <span className="text-base">🎭</span> Sentiment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Renders the active video conferencing room using LiveKit.
 * Connects to the LiveKit server using the retrieved access token
 * and displays the default `VideoConference` UI.
 *
 * @param props.meeting The active meeting object data.
 * @param props.onLeave Callback invoked when the user disconnects or leaves the room.
 */
export function LiveMeetingView({ meeting, onLeave }: { meeting: any, onLeave: () => void }) {
  const { fetchLiveKitToken, inviteParticipants, endMeeting } = useMeetingStore();
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const currentUser = useAuthStore(state => state.user);
  const [showInvitePopup, setShowInvitePopup] = useState(() => currentUser?.id === meeting?.hostId);
  const [isInviting, setIsInviting] = useState(false);
  const [emailsInput, setEmailsInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!meeting?.id) return;
    fetchLiveKitToken(meeting.id).then((res) => {
      setToken(res.token);
      setServerUrl(res.livekitUrl);
    }).catch(console.error);
  }, [meeting, fetchLiveKitToken]);

  if (!token || !serverUrl) {
    return <div className="flex items-center justify-center h-screen bg-[#14120F] text-white">Connecting...</div>;
  }

  return (
    <div className="h-screen w-screen bg-[#14120F] relative">
      <div className="absolute top-4 left-4 z-50 bg-stone-900/80 backdrop-blur text-white px-4 py-2 rounded-lg text-sm border border-stone-800 flex items-center gap-3">
        <div>
          <span className="text-stone-400">Meeting Code:</span> <span className="font-mono font-medium">{meeting.joinCode}</span>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(meeting.joinCode);
            alert("Meeting code copied to clipboard!");
          }}
          className="bg-stone-800 hover:bg-stone-700 px-2 py-1 rounded text-xs transition-colors"
        >
          Copy
        </button>
      </div>
      {/* Google Meet style "Your meeting's ready" popup */}
      {showInvitePopup && (
        <div className="absolute bottom-24 left-6 z-[100] bg-white rounded-xl shadow-2xl p-5 w-80 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-[16px] font-medium text-gray-900">Your meeting's ready</h3>
            <button
              onClick={() => setShowInvitePopup(false)}
              className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </div>

          {isInviting ? (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Comma separated emails..."
                value={emailsInput}
                onChange={(e) => setEmailsInput(e.target.value)}
                className="w-full text-sm px-3 py-2 border rounded mb-2 outline-none focus:border-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setIsInviting(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-full text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const emails = emailsInput.split(',').map(e => e.trim()).filter(Boolean);
                    if (emails.length === 0) return;
                    setIsSending(true);
                    try {
                      await inviteParticipants(meeting.id, emails);
                      setIsInviting(false);
                      setEmailsInput("");
                      setShowInvitePopup(false);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsSending(false);
                    }
                  }}
                  disabled={isSending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isSending ? 'Sending...' : 'Send Invites'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsInviting(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-colors mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
              Add others
            </button>
          )}

          <p className="text-xs text-gray-500 mb-2">
            Or share this meeting link with others you want in the meeting
          </p>

          <div className="flex items-center gap-2 bg-gray-100 rounded-md p-2 mb-3">
            <span className="flex-1 text-sm text-gray-700 truncate font-mono">
              {window.location.origin}/join/{meeting.joinCode}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/join/${meeting.joinCode}`);
                alert("Meeting link copied to clipboard!");
              }}
              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200"
              title="Copy joining link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
            </button>
          </div>

          <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            <p>People who use this meeting link must get your permission before they can join.</p>
          </div>
        </div>
      )}

      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        onDisconnected={onLeave}
        data-lk-theme="default"
        style={{ height: '100vh', width: '100vw' }}
      >
        <BotChatListener meetingId={meeting.id} />
        <AIAssistantPanel />
        <VideoConference />
        <RoomAudioRenderer />

        {currentUser?.id === meeting?.hostId && (
          <div className="absolute bottom-6 left-6 z-[100]">
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to end this meeting for everyone?")) {
                  try {
                    await endMeeting(meeting.id);
                    onLeave();
                  } catch (e) {
                    console.error("Failed to end meeting", e);
                    alert("Failed to end meeting.");
                  }
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg border border-red-500 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1-1.56 1.293 8.744 8.744 0 0 0-8.919-4.816c-2.43.34-4.715 1.572-6.42 3.277l-.66-.66a10.744 10.744 0 0 1 6.354-5.669z" /><path d="M14 14l-4 4-4-4" /><path d="M10 18V9" /><path d="M3 3l18 18" /></svg>
              End Meeting for All
            </button>
          </div>
        )}
      </LiveKitRoom>
    </div>
  );
}
