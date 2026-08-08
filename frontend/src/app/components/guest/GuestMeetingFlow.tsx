import { useState, lazy, Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input, Field } from '../../ui/Input';
import { Card } from '../../ui/Card';
import { Logo } from '../../ui/Logo';
import { RouteFallback } from '../../ui/RouteFallback';
import { meetingClient } from '../../apiClient';
import { PreCallDeviceCheckView } from '../coreapp/components/views/MeetingViews';

// Shares the LiveKit chunk with the signed-in app.
const LiveMeetingView = lazy(() =>
  import('../coreapp/components/views/LiveMeetingView').then((m) => ({ default: m.LiveMeetingView }))
);

/**
 * Join flow for someone arriving on a /join/CODE link without an account.
 *
 * This is the first thing an invited guest ever sees of Vaarta, so it carries
 * the full brand rather than a stripped-down form.
 */
export function GuestMeetingFlow({ joinCode, onBack }: { joinCode: string; onBack: () => void }) {
  const [step, setStep] = useState<'name' | 'pre-call' | 'live'>('name');
  const [guestName, setGuestName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [meeting, setMeeting] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!guestName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await meetingClient.post(`/api/meetings/guest-join/${joinCode}`, {
        guestName: guestName.trim(),
      });

      setMeeting(res.data.meeting);
      setToken(res.data.token);
      setLivekitUrl(res.data.livekitUrl);
      setStep('pre-call');
    } catch (e: any) {
      console.error('Failed to join as guest', e);
      setError(
        e.response?.data?.message || 'Could not join this meeting. Check the link and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'name') {
    return (
      <div className="min-h-screen w-full bg-canvas flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="aurora aurora-iris w-[680px] h-[680px] -top-52 left-1/2 -translate-x-1/2 opacity-[0.18] animate-drift" />
          <div
            className="absolute inset-0 grid-field opacity-40"
            style={{ maskImage: 'radial-gradient(ellipse 60% 60% at 50% 40%, #000 20%, transparent 76%)' }}
          />
        </div>

        <div className="absolute top-6 left-6 z-10">
          <Button variant="ghost" onClick={onBack} leading={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        </div>

        <Card elevation={3} className="relative z-10 w-full max-w-[440px] p-8">
          <div className="flex justify-center mb-7">
            <Logo size="md" />
          </div>

          <h2 className="t-h2 text-ink text-center mb-1.5">You've been invited</h2>
          <p className="t-small text-ink-3 text-center mb-2">
            Joining meeting{' '}
            <span className="font-mono text-ink-2 px-1.5 py-0.5 rounded bg-surface-inset border border-line">
              {joinCode}
            </span>
          </p>
          <p className="t-caption text-ink-3 text-center mb-7">
            No account needed — just tell us what to call you.
          </p>

          <Field error={error ?? undefined} htmlFor="guest-name" label="Your name">
            <Input
              id="guest-name"
              placeholder="e.g. Ananya Rao"
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              error={!!error}
              className="h-12"
              autoFocus
            />
          </Field>

          <Button
            size="lg"
            className="w-full mt-6"
            onClick={handleJoin}
            loading={isLoading}
            disabled={!guestName.trim()}
          >
            Continue
          </Button>
        </Card>
      </div>
    );
  }

  if (step === 'pre-call') {
    return <PreCallDeviceCheckView onJoinNow={() => setStep('live')} onBack={() => setStep('name')} />;
  }

  if (step === 'live') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <LiveMeetingView
          meeting={meeting}
          onLeave={onBack}
          initialToken={token || undefined}
          initialLivekitUrl={livekitUrl || undefined}
        />
      </Suspense>
    );
  }

  return null;
}
