import React from 'react';
import { Copy, CheckCircle2, Sparkles, Link2, ListChecks, Gauge, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../../ui/Button';
import { Input, Select, Field } from '../../../../ui/Input';
import { Modal } from '../../../../ui/Modal';
import { Badge } from '../../../../ui/Badge';
import { Switch } from '../../../../ui/Switch';
import { copyToClipboard } from '../../../../ui/clipboard';
import { useMeetingStore, type Meeting } from '../../../../store/useMeetingStore';
import { formatDateTime } from '../../../../utils/datetime';

const joinUrl = (code: string) => `${window.location.origin}/join/${code}`;

/** Shared "let AI draft this" block used by both create and schedule dialogs. */
function AgendaAssist({
  description,
  setDescription,
  agenda,
  onSuggest,
  isSuggesting,
}: {
  description: string;
  setDescription: (v: string) => void;
  agenda: string[];
  onSuggest: () => void;
  isSuggesting: boolean;
}) {
  return (
    <div className="rounded-xl border border-iris-line bg-iris-soft p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <Sparkles className="w-4 h-4 text-iris" />
        <span className="t-small font-semibold text-iris">Draft it for me</span>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="What is this meeting about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-surface"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSuggest();
            }
          }}
        />
        <Button
          onClick={onSuggest}
          loading={isSuggesting}
          disabled={!description.trim()}
          className="shrink-0"
        >
          Suggest
        </Button>
      </div>

      {agenda.length > 0 && (
        <ul className="mt-3.5 space-y-2 rounded-lg bg-surface border border-line p-3">
          {agenda.map((point, i) => (
            <li key={i} className="flex gap-2.5 t-small text-ink-2">
              <span className="text-iris font-mono t-caption mt-0.5">{String(i + 1).padStart(2, '0')}</span>
              <span className="leading-snug">{point}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ========================================================================== */

export function CreateMeetingModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (meeting: Meeting) => void;
}) {
  const { createMeeting, suggestAgenda, isLoading } = useMeetingStore();
  const [title, setTitle] = React.useState('Instant Meeting');
  const [emailsInput, setEmailsInput] = React.useState('');
  const [agendaDesc, setAgendaDesc] = React.useState('');
  const [agenda, setAgenda] = React.useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [waitingRoom, setWaitingRoom] = React.useState(true);

  const handleCreate = async () => {
    try {
      const emails = emailsInput.split(',').map((e) => e.trim()).filter(Boolean);
      const meeting = await createMeeting(title, undefined, emails, agenda.length ? agenda : undefined);
      onSuccess(meeting);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Could not create the meeting.');
    }
  };

  const handleSuggest = async () => {
    if (!agendaDesc.trim()) return;
    try {
      setIsSuggesting(true);
      const res = await suggestAgenda(agendaDesc);
      if (res.title) setTitle(res.title);
      if (res.agenda) setAgenda(res.agenda);
    } catch (e) {
      console.error('Failed to suggest agenda', e);
      toast.error('The assistant could not draft an agenda right now.');
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title="New meeting"
      description="Opens a room you can share straight away."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} loading={isLoading} disabled={!title.trim()}>
            Create meeting
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <AgendaAssist
          description={agendaDesc}
          setDescription={setAgendaDesc}
          agenda={agenda}
          onSuggest={handleSuggest}
          isSuggesting={isSuggesting}
        />

        <Field label="Meeting title" htmlFor="cm-title">
          <Input id="cm-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>

        <div className="flex items-center justify-between gap-6 py-3 border-y border-line">
          <div>
            <p className="t-small font-medium text-ink">Waiting room</p>
            <p className="t-caption text-ink-3 mt-0.5">Admit guests before they join</p>
          </div>
          <Switch checked={waitingRoom} onChange={setWaitingRoom} label="Waiting room" />
        </div>

        <Field
          label="Invite people"
          htmlFor="cm-emails"
          hint="Comma-separated email addresses. They'll get the link by email."
        >
          <Input
            id="cm-emails"
            placeholder="jane@company.com, dev@company.com"
            value={emailsInput}
            onChange={(e) => setEmailsInput(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}

/* ========================================================================== */

export function ScheduleMeetingModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (meeting: Meeting) => void;
}) {
  const { createMeeting, suggestAgenda, isLoading } = useMeetingStore();
  const [topic, setTopic] = React.useState('');
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = React.useState('10:00');
  const [duration, setDuration] = React.useState('60');
  const [emailsInput, setEmailsInput] = React.useState('');
  const [agendaDesc, setAgendaDesc] = React.useState('');
  const [agenda, setAgenda] = React.useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [waitingRoom, setWaitingRoom] = React.useState(true);

  const handleSchedule = async () => {
    try {
      const scheduledStart = new Date(`${date}T${time}:00`).toISOString();
      const emails = emailsInput.split(',').map((e) => e.trim()).filter(Boolean);
      const meeting = await createMeeting(topic, scheduledStart, emails, agenda.length ? agenda : undefined);
      onSuccess(meeting);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Could not schedule the meeting.');
    }
  };

  const handleSuggest = async () => {
    if (!agendaDesc.trim()) return;
    try {
      setIsSuggesting(true);
      const res = await suggestAgenda(agendaDesc);
      if (res.title) setTopic(res.title);
      if (res.agenda) setAgenda(res.agenda);
    } catch (e) {
      console.error('Failed to suggest agenda', e);
      toast.error('The assistant could not draft an agenda right now.');
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title="Schedule a meeting"
      description="Pick a time and we'll email everyone the link."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} loading={isLoading} disabled={!topic.trim()}>
            Schedule
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <AgendaAssist
          description={agendaDesc}
          setDescription={setAgendaDesc}
          agenda={agenda}
          onSuggest={handleSuggest}
          isSuggesting={isSuggesting}
        />

        <Field label="Topic" htmlFor="sm-topic">
          <Input
            id="sm-topic"
            placeholder="e.g. Weekly sync"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Date" htmlFor="sm-date">
            <Input id="sm-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Time" htmlFor="sm-time">
            <Input id="sm-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
          <Field label="Duration" htmlFor="sm-duration">
            <Select id="sm-duration" value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </Select>
          </Field>
        </div>

        <div className="flex items-center justify-between gap-6 py-3 border-y border-line">
          <div>
            <p className="t-small font-medium text-ink">Waiting room</p>
            <p className="t-caption text-ink-3 mt-0.5">Admit guests before they join</p>
          </div>
          <Switch checked={waitingRoom} onChange={setWaitingRoom} label="Waiting room" />
        </div>

        <Field label="Invite people" htmlFor="sm-emails" hint="Comma-separated email addresses.">
          <Input
            id="sm-emails"
            placeholder="jane@company.com, dev@company.com"
            value={emailsInput}
            onChange={(e) => setEmailsInput(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}

/* ========================================================================== */

export function MeetingCreatedModal({
  meeting,
  onClose,
  onStart,
}: {
  meeting: Meeting;
  onClose: () => void;
  onStart: () => void;
}) {
  return (
    <Modal onClose={onClose} size="sm">
      <div className="text-center pt-2">
        <div className="w-12 h-12 rounded-xl bg-live-soft border border-live-line text-live-ink flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-5 h-5" />
        </div>

        <h2 className="t-h2 text-ink mb-2">Your room is ready</h2>
        <p className="t-small text-ink-3 mb-6">
          Share the code or the link — guests don't need an account.
        </p>

        <button
          onClick={() => copyToClipboard(meeting.joinCode, 'Meeting code copied')}
          className="w-full mb-3 p-4 rounded-xl bg-surface-inset border border-line hover:border-iris-line transition-colors group"
        >
          <span className="block t-overline text-ink-3 mb-1.5">Meeting code</span>
          <span className="flex items-center justify-center gap-2.5 font-mono text-[20px] font-semibold text-ink tracking-[0.15em]">
            {meeting.joinCode}
            <Copy className="w-4 h-4 text-ink-3 group-hover:text-iris transition-colors" />
          </span>
        </button>

        <Button
          variant="outline"
          className="w-full mb-6"
          onClick={() => copyToClipboard(joinUrl(meeting.joinCode), 'Invite link copied')}
          leading={<Link2 className="w-4 h-4" />}
        >
          Copy invite link
        </Button>

        <div className="flex flex-col gap-2">
          <Button onClick={onStart} className="w-full">
            Start meeting now
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Later
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ========================================================================== */

/** One AI-generated section of the recap, with its own generate action. */
function RecapSection({
  icon: Icon,
  title,
  available,
  isEnded,
  onGenerate,
  isGenerating,
  emptyLabel,
  children,
}: {
  icon: React.ElementType;
  title: string;
  available: boolean;
  isEnded: boolean;
  onGenerate: () => void;
  isGenerating: boolean;
  emptyLabel: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="pt-4 border-t border-line first:border-0 first:pt-0">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <h3 className="flex items-center gap-2 t-small font-semibold text-ink">
          <Icon className="w-4 h-4 text-ink-3" />
          {title}
        </h3>
        {isEnded && !available && (
          <Button variant="outline" size="sm" onClick={onGenerate} loading={isGenerating}>
            Generate
          </Button>
        )}
      </div>

      {available ? (
        children
      ) : (
        <p className="t-small text-ink-3">
          {isEnded ? emptyLabel : 'Available once the meeting ends.'}
        </p>
      )}
    </section>
  );
}

export function MeetingDetailsModal({
  meeting,
  onClose,
}: {
  meeting: Meeting;
  onClose: () => void;
}) {
  const { generateSummary, generateActionItems, generateSentiment } = useMeetingStore();
  const [busy, setBusy] = React.useState<string | null>(null);

  const isEnded = meeting.status === 'ENDED';

  const run = async (key: string, fn: () => Promise<unknown>) => {
    try {
      setBusy(key);
      await fn();
    } catch (e) {
      console.error(e);
      toast.error('The assistant could not process this meeting right now.');
    } finally {
      setBusy(null);
    }
  };

  let actionItems: any[] = [];
  try {
    if (meeting.actionItems) actionItems = JSON.parse(meeting.actionItems);
  } catch (e) {
    console.error('Failed to parse action items', e);
  }

  const sentimentTone =
    meeting.sentimentLabel === 'POSITIVE'
      ? 'live'
      : meeting.sentimentLabel === 'TENSE'
        ? 'danger'
        : 'neutral';

  return (
    <Modal
      onClose={onClose}
      title={meeting.title}
      size="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Facts */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-surface-inset border border-line p-3">
            <p className="t-overline text-ink-3 mb-1.5">Status</p>
            <Badge tone={meeting.status === 'LIVE' ? 'live' : 'neutral'} pulse={meeting.status === 'LIVE'}>
              {meeting.status}
            </Badge>
          </div>
          <div className="rounded-lg bg-surface-inset border border-line p-3">
            <p className="t-overline text-ink-3 mb-1.5">When</p>
            <p className="t-small text-ink">
              {formatDateTime(meeting.startedAt || meeting.scheduledStart || meeting.createdAt)}
            </p>
          </div>
          <div className="rounded-lg bg-surface-inset border border-line p-3">
            <p className="t-overline text-ink-3 mb-1.5">Code</p>
            <button
              onClick={() => copyToClipboard(meeting.joinCode, 'Meeting code copied')}
              className="font-mono t-small text-ink hover:text-iris transition-colors"
            >
              {meeting.joinCode}
            </button>
          </div>
        </div>

        <RecapSection
          icon={FileText}
          title="Summary"
          available={!!meeting.summary}
          isEnded={isEnded}
          isGenerating={busy === 'summary'}
          onGenerate={() => run('summary', () => generateSummary(meeting.id))}
          emptyLabel="No summary generated yet."
        >
          <p className="rounded-lg bg-surface-inset border border-line p-4 t-small text-ink-2 leading-relaxed whitespace-pre-wrap">
            {meeting.summary}
          </p>
        </RecapSection>

        <RecapSection
          icon={ListChecks}
          title="Action items"
          available={!!meeting.actionItems}
          isEnded={isEnded}
          isGenerating={busy === 'actions'}
          onGenerate={() => run('actions', () => generateActionItems(meeting.id))}
          emptyLabel="No action items extracted yet."
        >
          {actionItems.length > 0 ? (
            <ul className="space-y-2">
              {actionItems.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg bg-surface-inset border border-line p-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-ink-3 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="t-small text-ink font-medium">{item.task}</p>
                    {(item.owner || item.dueHint) && (
                      <div className="flex items-center gap-2 mt-1.5">
                        {item.owner && <Badge tone="saffron">{item.owner}</Badge>}
                        {item.dueHint && (
                          <span className="t-caption text-ink-3">Due {item.dueHint}</span>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="t-small text-ink-3">No commitments were made in this meeting.</p>
          )}
        </RecapSection>

        <RecapSection
          icon={Gauge}
          title="Sentiment"
          available={!!meeting.sentimentLabel}
          isEnded={isEnded}
          isGenerating={busy === 'sentiment'}
          onGenerate={() => run('sentiment', () => generateSentiment(meeting.id))}
          emptyLabel="No sentiment analysis yet."
        >
          <div className="rounded-lg bg-surface-inset border border-line p-4">
            <Badge tone={sentimentTone as any}>{meeting.sentimentLabel}</Badge>
            {meeting.sentimentReason && (
              <p className="t-small text-ink-2 leading-relaxed mt-2.5">{meeting.sentimentReason}</p>
            )}
          </div>
        </RecapSection>
      </div>
    </Modal>
  );
}
