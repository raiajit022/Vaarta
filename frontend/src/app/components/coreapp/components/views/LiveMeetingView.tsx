import React, { useEffect, useState, useRef } from 'react';
import {
  LiveKitRoom, VideoConference, RoomAudioRenderer, useChat, useDataChannel,
} from '@livekit/components-react';
import '@livekit/components-styles';
import {
  Copy, Sparkles, X, UserPlus, PhoneOff, Link2, Send, ListChecks, ChevronDown, Check,
  NotebookPen,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMeetingStore, parseJsonList } from '../../../../store/useMeetingStore';
import { useAuthStore } from '../../../../store/useAuthStore';
import { Button } from '../../../../ui/Button';
import { Input } from '../../../../ui/Input';
import { VaartaMark } from '../../../../ui/Logo';
import { Spinner } from '../../../../ui/Spinner';
import { confirm } from '../../../../ui/confirm';
import { copyToClipboard } from '../../../../ui/clipboard';
import { cn } from '../../../../ui/cn';
import { MeetingReactions } from './MeetingReactions';

const QUICK_COMMANDS = [
  { label: 'Summarise so far', command: '@bot summarize the meeting so far' },
  { label: 'List action items', command: '@bot list action items' },
  { label: 'Read the room', command: '@bot how is the mood' },
];

/** Topic `meeting-service` publishes assistant replies on (LiveKitController). */
const BOT_REPLY_TOPIC = 'lk-chat-topic';

/** Topic peers use to broadcast shared-note edits to each other. */
const NOTES_TOPIC = 'vaarta-notes';

interface BotReply {
  id: string;
  message: string;
  timestamp: number;
}

/**
 * The assistant dock — one component owning the whole `@bot` round trip.
 *
 * It does three things that used to be missing or scattered:
 *
 *  1. **Persists chat.** LiveKit chat is in-room only and dies with the room, but
 *     every AI agent reads chat history from the database. Each client mirrors
 *     only its *own* messages, so a message is written exactly once regardless of
 *     how many people are in the room.
 *  2. **Forwards `@bot`** to the backend, as before.
 *  3. **Receives the reply.** `meeting-service` broadcasts on `lk-chat-topic`,
 *     while LiveKit's `useChat()` listens on its own `lk.chat` topic — so replies
 *     were being published into the void. Replies land here instead of in the
 *     chat scroll, which also keeps them from being lost mid-conversation.
 */
function AssistantDock({ meetingId }: { meetingId: string }) {
  const { chatMessages, send } = useChat();
  const { sendBotCommand, persistChatMessage } = useMeetingStore();

  const [isOpen, setIsOpen] = useState(false);
  const [replies, setReplies] = useState<BotReply[]>([]);
  const [unread, setUnread] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Messages already handled, so re-renders never double-write.
  const processedRef = useRef<Set<string>>(new Set());

  useDataChannel(BOT_REPLY_TOPIC, (msg) => {
    try {
      const parsed = JSON.parse(new TextDecoder().decode(msg.payload));
      if (!parsed?.message) return;
      setReplies((prev) => [
        ...prev,
        {
          id: String(parsed.id ?? Date.now()),
          message: String(parsed.message),
          timestamp: Number(parsed.timestamp ?? Date.now()),
        },
      ]);
      setIsThinking(false);
      setIsOpen((open) => {
        if (!open) setUnread((n) => n + 1);
        return open;
      });
    } catch (e) {
      console.error('Could not parse assistant reply', e);
    }
  });

  useEffect(() => {
    for (const m of chatMessages) {
      if (!m.from?.isLocal || processedRef.current.has(m.id)) continue;
      processedRef.current.add(m.id);

      // Best-effort history write; never blocks the live conversation.
      persistChatMessage(meetingId, m.message);

      if (m.message.trim().toLowerCase().startsWith('@bot')) {
        setIsThinking(true);
        sendBotCommand(meetingId, m.message).catch(console.error);
      }
    }
  }, [chatMessages, meetingId, persistChatMessage, sendBotCommand]);

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

  const open = () => {
    setIsOpen(true);
    setUnread(0);
  };

  const run = (cmd: string) => {
    send?.(cmd).catch(console.error);
    setIsThinking(true);
    open();
  };

  return (
    <div className="relative pointer-events-auto" ref={ref}>
      <Button
        variant={isOpen ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        leading={<Sparkles className="w-4 h-4" />}
        className="relative"
      >
        Assistant
        {unread > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-iris text-on-iris t-caption font-semibold flex items-center justify-center tabular-nums">
            {unread}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-11 right-0 w-[320px] rounded-xl border border-line bg-surface elev-4 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
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

          {replies.length > 0 && (
            <div className="max-h-56 overflow-y-auto scrollbar-fine space-y-2 mb-3 -mr-1 pr-1">
              {replies.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg bg-iris-soft border border-iris-line p-3 animate-in fade-in duration-200"
                >
                  <p className="t-caption font-semibold text-iris mb-1 flex items-center gap-1">
                    <VaartaMark size={11} /> Vaarta AI
                  </p>
                  <p className="t-small text-ink leading-relaxed whitespace-pre-wrap">{r.message}</p>
                </div>
              ))}
            </div>
          )}

          {isThinking && (
            <div className="flex items-center gap-2 t-caption text-ink-3 mb-3">
              <Spinner size={12} /> Thinking…
            </div>
          )}

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

/**
 * Live agenda rail.
 *
 * `agenda_generator` writes an agenda at meeting-creation time and, until now,
 * nothing ever displayed it during the call — an LLM call paid for and thrown
 * away. This shows it while the meeting is happening and lets the host tick
 * items off.
 *
 * Tick state is intentionally **local to the session**: persisting it would mean
 * a new column, an endpoint and a sync path for something that only matters for
 * the duration of one call.
 */
function AgendaRail({ agenda, startedAt }: { agenda: string[]; startedAt?: string | null }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const [collapsed, setCollapsed] = useState(false);
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!startedAt) return;
    const started = new Date(startedAt).getTime();
    if (Number.isNaN(started)) return;

    const tick = () => {
      const mins = Math.max(0, Math.floor((Date.now() - started) / 60000));
      setElapsed(mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [startedAt]);

  const toggle = (i: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const remaining = agenda.length - done.size;

  return (
    <div className="pointer-events-auto w-[264px] rounded-xl border border-line bg-[var(--scrim)] backdrop-blur-xl elev-3 overflow-hidden">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-surface-hover transition-colors"
      >
        <span className="flex items-center gap-1.5 t-caption font-semibold text-ink">
          <ListChecks className="w-3.5 h-3.5 text-iris" /> Agenda
        </span>
        <span className="flex items-center gap-2 t-caption text-ink-3 tabular-nums">
          {elapsed && <span>{elapsed}</span>}
          <span>{remaining > 0 ? `${remaining} left` : 'all done'}</span>
          <ChevronDown
            className={cn('w-3.5 h-3.5 transition-transform', collapsed && '-rotate-90')}
          />
        </span>
      </button>

      {!collapsed && (
        <ul className="px-2 pb-2 space-y-0.5 max-h-[40vh] overflow-y-auto scrollbar-fine">
          {agenda.map((item, i) => {
            const checked = done.has(i);
            return (
              <li key={i}>
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-surface-hover transition-colors text-left group"
                >
                  <span
                    className={cn(
                      'mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors',
                      checked
                        ? 'bg-iris border-iris text-on-iris'
                        : 'border-line-strong group-hover:border-iris-line'
                    )}
                  >
                    {checked && <Check className="w-2.5 h-2.5" strokeWidth={3.5} />}
                  </span>
                  <span
                    className={cn(
                      't-caption leading-snug transition-colors',
                      checked ? 'text-ink-3 line-through' : 'text-ink-2'
                    )}
                  >
                    {item}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Shared notes panel — the deliberate alternative to a whiteboard.
 *
 * A whiteboard is a CRDT-backed canvas with conflict resolution, shape primitives
 * and multi-cursor: effectively a second product. A shared notepad covers most of
 * what people actually use one for in a meeting, for a fraction of the surface.
 *
 * Concurrency is last-write-wins. Remote edits are ignored while the local
 * textarea has focus, so a teammate's keystroke never yanks your cursor
 * mid-sentence; your next debounced save then becomes the winning version.
 */
function NotesPanel({ meetingId }: { meetingId: string }) {
  const { fetchNotes, saveNotes } = useMeetingStore();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(true);

  const isFocusedRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { send } = useDataChannel(NOTES_TOPIC, (msg) => {
    if (isFocusedRef.current) return; // don't fight the local typist
    try {
      const parsed = JSON.parse(new TextDecoder().decode(msg.payload));
      if (typeof parsed?.content === 'string') setContent(parsed.content);
    } catch {
      /* malformed packet — ignore */
    }
  });

  useEffect(() => {
    fetchNotes(meetingId).then(setContent);
  }, [meetingId, fetchNotes]);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const onChange = (next: string) => {
    setContent(next);
    setSaved(false);

    // Broadcast immediately so others see typing; persist on a debounce so we
    // are not issuing a PUT per keystroke.
    try {
      send?.(new TextEncoder().encode(JSON.stringify({ content: next })), { reliable: true });
    } catch {
      /* data channel not ready */
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveNotes(meetingId, next).then(() => setSaved(true));
    }, 800);
  };

  return (
    <div className="pointer-events-auto">
      {isOpen ? (
        <div className="w-[300px] rounded-xl border border-line bg-surface elev-4 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-line">
            <span className="flex items-center gap-1.5 t-caption font-semibold text-ink">
              <NotebookPen className="w-3.5 h-3.5 text-saffron" /> Shared notes
            </span>
            <div className="flex items-center gap-2">
              <span className="t-caption text-ink-3">{saved ? 'Saved' : 'Saving…'}</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-ink-3 hover:text-ink p-1 -mr-1 rounded"
                aria-label="Close notes"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => (isFocusedRef.current = true)}
            onBlur={() => (isFocusedRef.current = false)}
            placeholder="Notes everyone in this meeting can see…"
            className="w-full h-48 px-3 py-2.5 bg-transparent text-ink t-small leading-relaxed resize-none focus:outline-none placeholder:text-ink-3 scrollbar-fine"
          />
        </div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen(true)}
          leading={<NotebookPen className="w-4 h-4" />}
        >
          Notes
        </Button>
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

  const agenda = parseJsonList<string>(meeting?.agenda);

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

          <div className="flex flex-col items-end gap-2">
            <AssistantDock meetingId={meeting.id} />
            <NotesPanel meetingId={meeting.id} />
            {agenda.length > 0 && (
              <AgendaRail agenda={agenda} startedAt={meeting?.startedAt} />
            )}
          </div>
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
