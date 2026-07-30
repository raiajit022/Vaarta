import React, { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference, RoomAudioRenderer, useChat } from '@livekit/components-react';
import '@livekit/components-styles';
import { useMeetingStore } from "../../../../store/useMeetingStore";

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

/**
 * Renders the active video conferencing room using LiveKit.
 * Connects to the LiveKit server using the retrieved access token
 * and displays the default `VideoConference` UI.
 *
 * @param props.meeting The active meeting object data.
 * @param props.onLeave Callback invoked when the user disconnects or leaves the room.
 */
export function LiveMeetingView({ meeting, onLeave }: { meeting: any, onLeave: () => void }) {
  const { fetchLiveKitToken } = useMeetingStore();
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);

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
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
