import React, { useEffect } from 'react';
import { Plus, Video, Calendar, Clock, ArrowRight, Radio, CalendarDays } from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { Card } from '../../../../ui/Card';
import { Badge } from '../../../../ui/Badge';
import { EmptyState } from '../../../../ui/EmptyState';
import { Spinner } from '../../../../ui/Spinner';
import { copyToClipboard } from '../../../../ui/clipboard';
import { cn } from '../../../../ui/cn';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useMeetingStore, type Meeting } from '../../../../store/useMeetingStore';
import { formatDateTime, formatRelative, isPastMeeting, greeting } from '../../../../utils/datetime';
import { MeetingDetailsModal } from './Modals';

/** One of the three primary entry points at the top of the dashboard. */
function ActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  accent: 'iris' | 'saffron' | 'neutral';
}) {
  const tint = {
    iris: 'bg-iris-soft border-iris-line text-iris',
    saffron: 'bg-saffron-soft border-saffron-line text-saffron-ink',
    neutral: 'bg-surface-inset border-line text-ink-2',
  }[accent];

  return (
    <Card interactive onClick={onClick} className="p-5 group">
      <div
        className={cn(
          'w-10 h-10 rounded-lg border flex items-center justify-center mb-4 transition-transform group-hover:scale-105',
          tint
        )}
      >
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <h3 className="t-h3 text-ink mb-1">{title}</h3>
      <p className="t-small text-ink-3">{description}</p>
    </Card>
  );
}

/** A single upcoming-meeting row. */
function MeetingRow({
  meeting,
  onDetails,
  onJoin,
}: {
  meeting: Meeting;
  onDetails: () => void;
  onJoin: () => void;
}) {
  const isLive = meeting.status === 'LIVE';

  return (
    <Card className="p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div
          className={cn(
            'w-10 h-10 rounded-lg border flex items-center justify-center shrink-0',
            isLive
              ? 'bg-live-soft border-live-line text-live-ink'
              : 'bg-surface-inset border-line text-ink-3'
          )}
        >
          {isLive ? <Radio className="w-[18px] h-[18px]" /> : <Calendar className="w-[18px] h-[18px]" />}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="t-small font-semibold text-ink truncate">{meeting.title}</h4>
            {isLive && <Badge tone="live" pulse>Live</Badge>}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1.5 t-caption text-ink-3">
              <Clock className="w-3.5 h-3.5" />
              {meeting.scheduledStart ? formatDateTime(meeting.scheduledStart) : 'Instant meeting'}
            </span>
            <button
              onClick={() => copyToClipboard(meeting.joinCode, 'Meeting code copied')}
              className="font-mono t-caption text-ink-2 px-1.5 py-0.5 rounded bg-surface-inset border border-line hover:border-line-hover hover:text-ink transition-colors"
              title="Copy meeting code"
            >
              {meeting.joinCode}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="sm" onClick={onDetails}>
          Details
        </Button>
        <Button size="sm" onClick={onJoin}>
          Join
        </Button>
      </div>
    </Card>
  );
}

/**
 * Landing view for a signed-in user: quick actions, what's coming up, and a
 * short activity trail.
 */
export function DashboardView({
  onCreateMeeting,
  onJoinMeeting,
  onScheduleMeeting,
  onJoinDirectly,
}: {
  onCreateMeeting: () => void;
  onJoinMeeting: () => void;
  onScheduleMeeting: () => void;
  onJoinDirectly?: (meeting: Meeting) => void;
}) {
  const { user } = useAuthStore();
  const { meetings, fetchMyMeetings, isLoading } = useMeetingStore();
  const [selectedMeeting, setSelectedMeeting] = React.useState<Meeting | null>(null);

  const displayName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  useEffect(() => {
    fetchMyMeetings();
  }, [fetchMyMeetings]);

  const upcoming = meetings.filter((m) => !isPastMeeting(m));
  const past = meetings.filter((m) => isPastMeeting(m));
  const liveCount = upcoming.filter((m) => m.status === 'LIVE').length;

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="t-h1 text-ink mb-1.5">
            {greeting()}, {displayName}.
          </h1>
          <p className="t-body text-ink-3">
            {isLoading
              ? 'Loading your meetings…'
              : liveCount > 0
                ? `${liveCount} meeting${liveCount > 1 ? 's' : ''} live right now.`
                : upcoming.length > 0
                  ? `${upcoming.length} meeting${upcoming.length > 1 ? 's' : ''} coming up.`
                  : 'Nothing on the calendar. Enjoy it.'}
          </p>
        </div>
        <Button onClick={onCreateMeeting} leading={<Plus className="w-4 h-4" />}>
          New meeting
        </Button>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <ActionCard
          icon={Video}
          title="Start now"
          description="Open an instant room and share the link"
          onClick={onCreateMeeting}
          accent="iris"
        />
        <ActionCard
          icon={Plus}
          title="Join a meeting"
          description="Enter a code you were given"
          onClick={onJoinMeeting}
          accent="saffron"
        />
        <ActionCard
          icon={CalendarDays}
          title="Schedule"
          description="Plan a meeting and invite by email"
          onClick={onScheduleMeeting}
          accent="neutral"
        />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="t-h3 text-ink">Upcoming</h2>
            {upcoming.length > 0 && (
              <span className="t-caption text-ink-3 tabular-nums">{upcoming.length} total</span>
            )}
          </div>

          <div className="space-y-2.5">
            {isLoading && upcoming.length === 0 && (
              <Card className="p-8 flex items-center justify-center text-ink-3">
                <Spinner size={18} />
              </Card>
            )}

            {!isLoading && upcoming.length === 0 && (
              <Card>
                <EmptyState
                  icon={<Calendar className="w-5 h-5" />}
                  title="No meetings scheduled"
                  description="Start an instant room, or schedule something for later."
                  action={
                    <Button size="sm" onClick={onCreateMeeting} leading={<Plus className="w-4 h-4" />}>
                      Start a meeting
                    </Button>
                  }
                />
              </Card>
            )}

            {upcoming.map((m) => (
              <MeetingRow
                key={m.id}
                meeting={m}
                onDetails={() => setSelectedMeeting(m)}
                onJoin={() => onJoinDirectly?.(m)}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="t-h3 text-ink">Recent</h2>
          </div>

          <Card className="overflow-hidden">
            {past.length === 0 ? (
              <EmptyState
                icon={<Video className="w-5 h-5" />}
                title="No history yet"
                description="Meetings you've finished will show up here."
                className="py-10"
              />
            ) : (
              <>
                <div className="divide-y divide-[var(--line)]">
                  {past.slice(0, 5).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMeeting(m)}
                      className="w-full p-3.5 flex gap-3 hover:bg-surface-hover transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-inset border border-line flex items-center justify-center shrink-0 text-ink-3">
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="t-small font-medium text-ink truncate">{m.title}</p>
                        <p className="t-caption text-ink-3 mt-0.5">
                          {formatRelative(m.endedAt || m.scheduledStart || m.createdAt, 'Ended')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                {past.length > 5 && (
                  <div className="p-2 border-t border-line bg-canvas-raised">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      trailing={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      View all activity
                    </Button>
                  </div>
                )}
              </>
            )}
          </Card>
        </section>
      </div>

      {selectedMeeting && (
        <MeetingDetailsModal meeting={selectedMeeting} onClose={() => setSelectedMeeting(null)} />
      )}
    </div>
  );
}
