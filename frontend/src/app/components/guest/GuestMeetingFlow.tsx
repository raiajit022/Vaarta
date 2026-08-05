import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Video } from "lucide-react";
import { meetingClient } from "../../apiClient";
import { LiveMeetingView } from "../coreapp/components/views/LiveMeetingView";
import { PreCallDeviceCheckView } from "../coreapp/components/views/MeetingViews";

export function GuestMeetingFlow({ joinCode, onBack }: { joinCode: string, onBack: () => void }) {
  const [step, setStep] = useState<"name" | "pre-call" | "live">("name");
  const [guestName, setGuestName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [meeting, setMeeting] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!guestName.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await meetingClient.post(`/api/meetings/guest-join/${joinCode}`, {
        guestName: guestName.trim()
      });

      setMeeting(res.data.meeting);
      setToken(res.data.token);
      setLivekitUrl(res.data.livekitUrl);

      setStep("pre-call");
    } catch (e: any) {
      console.error("Failed to join as guest", e);
      setError(e.response?.data?.message || "Failed to join meeting");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "name") {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-6 relative">
        <div className="absolute top-8 left-8">
          <Button variant="ghost" onClick={onBack} className="text-stone-500">
            &larr; Back
          </Button>
        </div>
        <Card className="w-full max-w-[480px] p-8 relative z-10 shadow-[0_20px_60px_rgb(28,25,23,0.08)]">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xl tracking-tight justify-center mb-8">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-[#34d399] to-[#059669] flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            Vaarta
          </div>

          <h2 className="text-[24px] font-semibold text-stone-900 tracking-tight text-center mb-2">Join as Guest</h2>
          <p className="text-[14px] text-stone-500 text-center mb-8">Enter your name to join the meeting</p>

          <div className="space-y-5 mb-8">
            <div>
              <Input
                placeholder="Your name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleJoin();
                }}
                className="h-12"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </div>

          <Button
            className="w-full h-12 text-[15px]"
            onClick={handleJoin}
            disabled={isLoading || !guestName.trim()}
          >
            {isLoading ? "Joining..." : "Continue"}
          </Button>
        </Card>
      </div>
    );
  }

  if (step === "pre-call") {
    return (
      <PreCallDeviceCheckView
        onJoinNow={() => setStep("live")}
        onBack={() => setStep("name")}
      />
    );
  }

  if (step === "live") {
    return (
      <LiveMeetingView
        meeting={meeting}
        onLeave={onBack}
        initialToken={token || undefined}
        initialLivekitUrl={livekitUrl || undefined}
      />
    );
  }

  return null;
}
