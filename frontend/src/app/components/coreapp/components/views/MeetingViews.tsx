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

/* ========================================================================== */

export function WaitingRoomGuestView({
  meeting,
  onLeave,
}: {
  meeting?: Meeting;
  onLeave: () => void;
}) {
  return (
    <Stage>
      <div className="max-w-md w-full text-center">
        <div className="relative w-20 h-20 mx-auto mb-7">
          <div className="absolute inset-0 rounded-full bg-iris-soft animate-breathe" />
          <div className="absolute inset-3 rounded-full bg-iris-soft border border-iris-line flex items-center justify-center text-iris">
            <Radio className="w-6 h-6" />
          </div>
        </div>

        <h2 className="t-h2 text-ink mb-2">Waiting for the host</h2>
        <p className="t-body text-ink-2 leading-relaxed mb-8">
          You're in the queue for{' '}
          <span className="text-ink font-medium">{meeting?.title || 'the meeting'}</span>. You'll be
          let in shortly.
        </p>

        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onLeave}>
            Leave
          </Button>
          <Button onClick={() => window.dispatchEvent(new CustomEvent('admit-guest'))}>
            Enter meeting
          </Button>
        </div>
      </div>
    </Stage>
  );
}

/* ========================================================================== */

/**
 * Host-side waiting room.
 *
 * There is no waiting-room API yet, so this renders a genuine empty state
 * rather than the hardcoded list of invented participants it used to show.
 */
export function WaitingRoomHostView({ onAdmitAll }: { onAdmitAll: () => void }) {
  const waiting: { id: string; name: string; email?: string }[] = [];

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="t-h1 text-ink mb-1.5">Waiting room</h1>
          <p className="t-body text-ink-3">
            {waiting.length === 0
              ? 'Nobody is waiting right now.'
              : `${waiting.length} waiting to join.`}
          </p>
        </div>
        {waiting.length > 0 && <Button onClick={onAdmitAll}>Admit all</Button>}
      </div>

      <Card className="overflow-hidden">
        <EmptyState
          icon={<Users className="w-5 h-5" />}
          title="No one waiting"
          description="Guests who open your meeting link will appear here for you to admit."
        />
      </Card>
    </div>
  );
}
