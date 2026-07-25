import React, { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import { useMeetingStore } from "../../../../store/useMeetingStore";

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
    <div className="h-screen w-screen bg-[#14120F]">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        onDisconnected={onLeave}
        data-lk-theme="default"
        style={{ height: '100vh', width: '100vw' }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
