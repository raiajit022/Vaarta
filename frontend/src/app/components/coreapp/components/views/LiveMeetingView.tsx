import React, { useEffect, useState, useRef } from 'react';
import { LiveKitRoom, VideoConference, RoomAudioRenderer, useChat } from '@livekit/components-react';
import '@livekit/components-styles';
import { Copy, Sparkles, X, UserPlus, PhoneOff, Link2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useMeetingStore } from '../../../../store/useMeetingStore';
import { useAuthStore } from '../../../../store/useAuthStore';
import { Button } from '../../../../ui/Button';
import { Input } from '../../../../ui/Input';
import { VaartaMark } from '../../../../ui/Logo';
import { Spinner } from '../../../../ui/Spinner';
import { confirm } from '../../../../ui/confirm';
import { copyToClipboard } from '../../../../ui/clipboard';
import { cn } from '../../../../ui/cn';
import { MeetingReactions } from './MeetingReactions';

/**
 * Watches the LiveKit chat channel and forwards any local `@bot` message to the
 * backend, which injects the reply back into the data channel.
 */
function BotChatListener({ meetingId }: { meetingId: string }) {
  const { chatMessages } = useChat();
  const { sendBotCommand } = useMeetingStore();
  const [lastProcessedId, setLastProcessedId] = useState<string | null>(null);

  useEffect(() => {
    if (chatMessages.length === 0) return;
    const latest = chatMessages[chatMessages.length - 1];

    if (
      latest.id !== lastProcessedId &&
      latest.from?.isLocal &&
      latest.message.trim().toLowerCase().startsWith('@bot')
    ) {
      setLastProcessedId(latest.id);
      sendBotCommand(meetingId, latest.message).catch(console.error);
    }
  }, [chatMessages, lastProcessedId, meetingId, sendBotCommand]);

  return null;
}

const QUICK_COMMANDS = [
  { label: 'Summarise so far', command: '@bot summarize the meeting so far' },
  { label: 'List action items', command: '@bot list action items' },
  { label: 'Read the room', command: '@bot how is the mood' },
];

/** Assistant launcher in the meeting top bar. */
function AIAssistantPanel() {
  const { send } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const run = (cmd: string) => {
    send?.(cmd).catch(console.error);
    setIsOpen(false);
    toast.success('Asked the assistant — watch the chat panel');
  };

  return (
    <div className="relative pointer-events-auto" ref={ref}>
      <Button
        variant={isOpen ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        leading={<Sparkles className="w-4 h-4" />}
      >
        Assistant
      </Button>

      {isOpen && (
        <div className="absolute top-11 right-0 w-[280px] rounded-xl border border-line bg-surface elev-4 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-1.5 t-small font-semibold text-ink">
              <Sparkles className="w-3.5 h-3.5 text-iris" /> Assistant
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-ink-3 hover:text-ink p-1 -mr-1 rounded"
              aria-label="Close assistant"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="t-caption text-ink-3 leading-relaxed mb-3">
            Type <span className="font-mono text-iris bg-iris-soft px-1 py-0.5 rounded">@bot</span> in
            the chat to ask anything, or pick one:
          </p>

          <div className="space-y-1.5">
            {QUICK_COMMANDS.map((c) => (
              <button
                key={c.command}
                onClick={() => run(c.command)}
                className="w-full flex items-center gap-2 px-3 h-9 rounded-md t-small font-medium text-ink-2 bg-surface-inset border border-line hover:border-iris-line hover:text-ink transition-colors text-left"
              >
                <Send className="w-3.5 h-3.5 text-ink-3 shrink-0" />
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Host-only "your room is ready" card, shown once when a host opens a meeting. */
function InviteCard({
  meeting,
  onDismiss,
  onInvite,
}: {
  meeting: any;
  onDismiss: () => void;
  onInvite: (emails: string[]) => Promise<void>;
}) {
  const [isInviting, setIsInviting] = useState(false);
  const [emailsInput, setEmailsInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const link = `${window.location.origin}/join/${meeting.joinCode}`;

  const handleSend = async () => {
    const emails = emailsInput.split(',').map((e) => e.trim()).filter(Boolean);
    if (!emails.length) return;
    setIsSending(true);
    try {
      await onInvite(emails);
      setEmailsInput('');
      setIsInviting(false);
      onDismiss();
      toast.success(`Invite sent to ${emails.length} ${emails.length === 1 ? 'person' : 'people'}`);
    } catch (e) {
      console.error(e);
      toast.error('Could not send the invites. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="pointer-events-auto w-[320px] rounded-xl border border-line bg-surface elev-4 p-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-start justify-between mb-1">
        <h3 className="t-h3 text-ink">Your room is live</h3>
        <button
          onClick={onDismiss}
          className="text-ink-3 hover:text-ink p-1 -mr-1 -mt-0.5 rounded"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="t-caption text-ink-3 mb-4">Bring people in — guests don't need an account.</p>

      {isInviting ? (
        <div className="mb-4">
          <Input
            placeholder="jane@company.com, dev@company.com"
            value={emailsInput}
            onChange={(e) => setEmailsInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            autoFocus
            className="mb-2"
          />
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => setIsInviting(false)}>
              Cancel
            </Button>
            <Button size="sm" className="flex-1" onClick={handleSend} loading={isSending}>
              Send
            </Button>
          </div>
        </div>
      ) : (
        <Button
          className="w-full mb-4"
          onClick={() => setIsInviting(true)}
          leading={<UserPlus className="w-4 h-4" />}
        >
          Invite by email
        </Button>
      )}

      <div className="flex items-center gap-2 rounded-lg bg-surface-inset border border-line p-2">
        <span className="flex-1 t-caption text-ink-2 truncate font-mono">{link}</span>
        <button
          onClick={() => copyToClipboard(link, 'Invite link copied')}
          className="p-1.5 rounded-md text-ink-3 hover:text-ink hover:bg-surface-hover transition-colors shrink-0"
          title="Copy invite link"
        >
          <Link2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/**
 * The live conference.
 *
 * All Vaarta chrome now sits in two docks — a glass top bar and a bottom-left
 * host cluster — instead of four independently-positioned floating buttons at
 * competing z-indexes. LiveKit itself is retimed to the Ink & Iris tokens in
 * `theme.css`, so the embedded UI no longer reads as a third-party widget.
 */
export function LiveMeetingView({
  meeting,
  onLeave,
  initialToken,
  initialLivekitUrl,
}: {
  meeting: any;
  onLeave: () => void;
  initialToken?: string;
  initialLivekitUrl?: string;
}) {
  const { fetchLiveKitToken, inviteParticipants, endMeeting } = useMeetingStore();
  const [token, setToken] = useState<string | null>(initialToken || null);
  const [serverUrl, setServerUrl] = useState<string | null>(initialLivekitUrl || null);
  const [connectError, setConnectError] = useState<string | null>(null);

  const currentUser = useAuthStore((state) => state.user);
  const isHost = !!currentUser?.id && currentUser.id === meeting?.hostId;

  const [showInviteCard, setShowInviteCard] = useState(() => isHost);
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);

  useEffect(() => {
    if (!meeting?.id || token) return;
    fetchLiveKitToken(meeting.id)
      .then((res) => {
        setToken(res.token);
        setServerUrl(res.livekitUrl);
      })
      .catch((e) => {
        console.error(e);
        setConnectError('Could not connect to the meeting server.');
      });
  }, [meeting, fetchLiveKitToken, token]);

  const handleEndMeeting = async () => {
    const ok = await confirm({
      title: 'End meeting for everyone?',
      description:
        'All participants will be disconnected immediately and the join code will stop working.',
      confirmLabel: 'End meeting',
      destructive: true,
    });
    if (!ok) return;

    setIsEndingMeeting(true);
    try {
      await endMeeting(meeting.id);
      onLeave();
    } catch (e) {
      console.error('Failed to end meeting', e);
      toast.error('Could not end the meeting. Please try again.');
      setIsEndingMeeting(false);
    }
  };

  if (connectError) {
    return (
      <div className="h-screen w-screen bg-canvas flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="t-h3 text-ink">{connectError}</p>
        <p className="t-small text-ink-3 max-w-sm">
          Check your connection and try opening the meeting link again.
        </p>
        <Button variant="secondary" onClick={onLeave}>
          Back
        </Button>
      </div>
    );
  }

  if (!token || !serverUrl) {
    return (
      <div className="h-screen w-screen bg-canvas flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-iris-soft blur-xl animate-breathe" />
          <VaartaMark size={40} className="relative text-iris" />
        </div>
        <div className="flex items-center gap-2 t-small text-ink-3">
          <Spinner size={14} /> Connecting to your meeting…
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-canvas relative overflow-hidden">
      <LiveKitRoom
        video
        audio
        token={token}
        serverUrl={serverUrl}
        onDisconnected={onLeave}
        data-lk-theme="default"
        style={{ height: '100vh', width: '100vw' }}
      >
        <BotChatListener meetingId={meeting.id} />
        <VideoConference />
        <RoomAudioRenderer />

        {/* ---- Top dock: identity + assistant ---- */}
        <div className="absolute top-0 inset-x-0 z-40 pointer-events-none px-4 py-3 flex items-start justify-between gap-3">
          <div className="pointer-events-auto flex items-center gap-2.5 pl-2.5 pr-2 py-2 rounded-xl border border-line bg-[var(--scrim)] backdrop-blur-xl">
            <VaartaMark size={17} className="text-iris shrink-0" />
            <div className="min-w-0 max-w-[220px]">
              <p className="t-caption font-medium text-ink truncate leading-tight">
                {meeting?.title || 'Meeting'}
              </p>
              <p className="t-caption text-ink-3 font-mono leading-tight">{meeting.joinCode}</p>
            </div>
            <button
              onClick={() => copyToClipboard(meeting.joinCode, 'Meeting code copied')}
              className="p-1.5 rounded-md text-ink-3 hover:text-ink hover:bg-surface-hover transition-colors shrink-0"
              title="Copy meeting code"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <AIAssistantPanel />
        </div>

        {/* ---- Bottom-left: host cluster ---- */}
        <div className="absolute bottom-6 left-6 z-40 pointer-events-none flex flex-col items-start gap-3">
          {isHost && showInviteCard && (
            <InviteCard
              meeting={meeting}
              onDismiss={() => setShowInviteCard(false)}
              onInvite={(emails) => inviteParticipants(meeting.id, emails)}
            />
          )}

          {isHost && (
            <Button
              variant="danger"
              onClick={handleEndMeeting}
              loading={isEndingMeeting}
              leading={!isEndingMeeting ? <PhoneOff className="w-4 h-4" /> : undefined}
              className={cn('pointer-events-auto elev-3')}
            >
              {isEndingMeeting ? 'Ending…' : 'End for all'}
            </Button>
          )}
        </div>

        <MeetingReactions isHost={isHost} />
      </LiveKitRoom>
    </div>
  );
}
