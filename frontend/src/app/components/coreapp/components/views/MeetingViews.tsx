import { useState } from 'react';
import { ArrowLeft, Radio, Users } from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { Input } from '../../../../ui/Input';
import { Card } from '../../../../ui/Card';
import { Logo } from '../../../../ui/Logo';
import { EmptyState } from '../../../../ui/EmptyState';
import { useMeetingStore, type Meeting } from '../../../../store/useMeetingStore';
import { DeviceTester } from './DeviceTester';

/** Shared full-bleed backdrop for the pre-meeting screens. */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-canvas flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="aurora aurora-iris w-[680px] h-[680px] -top-52 left-1/2 -translate-x-1/2 opacity-[0.16] animate-drift" />
        <div
          className="absolute inset-0 grid-field opacity-40"
          style={{ maskImage: 'radial-gradient(ellipse 60% 60% at 50% 40%, #000 20%, transparent 76%)' }}
        />
      </div>
      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </div>
  );
}

/* ========================================================================== */

export function JoinMeetingView({
  onJoin,
  onBack,
}: {
  onJoin: (meeting: Meeting) => void;
  onBack: () => void;
}) {
  const [joinCode, setJoinCode] = useState('');
  const { joinMeeting, isLoading, error } = useMeetingStore();

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    try {
      const meeting = await joinMeeting(joinCode.trim());
      onJoin(meeting);
    } catch (e) {
      console.error('Failed to join meeting', e);
    }
  };

  return (
    <Stage>
      <div className="absolute top-0 left-0">
        <Button variant="ghost" onClick={onBack} leading={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
      </div>

      <Card elevation={3} className="w-full max-w-[440px] p-8">
        <div className="flex justify-center mb-7">
          <Logo size="md" />
        </div>

        <h2 className="t-h2 text-ink text-center mb-1.5">Join a meeting</h2>
        <p className="t-small text-ink-3 text-center mb-7">Enter the code you were given.</p>

        <Input
          placeholder="ABC-123-XYZ"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          className="h-14 text-center font-mono text-[19px] tracking-[0.18em] uppercase"
          autoFocus
          aria-label="Meeting code"
        />

        {error && (
          <p className="mt-3 px-3 py-2.5 rounded-lg bg-danger-soft border border-danger-line text-danger-ink t-small text-center">
            {error}
          </p>
        )}

        <Button
          size="lg"
          className="w-full mt-6"
          onClick={handleJoin}
          loading={isLoading}
          disabled={!joinCode.trim()}
        >
          Continue
        </Button>
      </Card>
    </Stage>
  );
}

/* ========================================================================== */

export function PreCallDeviceCheckView({
  onJoinNow,
  onBack,
}: {
  onJoinNow: () => void;
  onBack?: () => void;
}) {
  return (
    <Stage>
      {onBack && (
        <div className="absolute top-0 left-0">
          <Button variant="ghost" onClick={onBack} leading={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        </div>
      )}

      <Card elevation={3} className="w-full max-w-3xl p-8">
        <div className="text-center mb-7">
          <h2 className="t-h2 text-ink mb-1.5">Ready to join?</h2>
          <p className="t-small text-ink-3">
            Check your camera and microphone before anyone sees you.
          </p>
        </div>

        <DeviceTester />

        <Button size="lg" className="w-full mt-8" onClick={onJoinNow}>
          Join meeting
        </Button>
      </Card>
    </Stage>
  );
}

