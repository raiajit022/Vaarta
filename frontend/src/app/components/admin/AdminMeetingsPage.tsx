import { useState, useEffect } from 'react';
import { Video, Calendar, AlertCircle, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { meetingClient } from '../../apiClient';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { Spinner } from '../../ui/Spinner';
import { EmptyState } from '../../ui/EmptyState';
import { confirm } from '../../ui/confirm';
import { copyToClipboard } from '../../ui/clipboard';
import { formatDateTime } from '../../utils/datetime';

interface AdminMeeting {
  id: string;
  hostId: string;
  title: string;
  joinCode: string;
  status: string;
  scheduledStart: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  participants: any[];
}

const statusTone = (status: string) =>
  status === 'LIVE'
    ? 'live'
    : status === 'SCHEDULED'
      ? 'iris'
      : status === 'ENDED'
        ? 'neutral'
        : 'danger';

/** Admin view for monitoring meetings and force-ending them. */
export function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<AdminMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await meetingClient.get('/api/admin/meetings');
      setMeetings(res.data);
      setError(null);
    } catch (err: any) {
      setError('Could not load meetings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const forceEndMeeting = async (meeting: AdminMeeting) => {
    const ok = await confirm({
      title: 'Force-end this meeting?',
      description: `"${meeting.title}" will be terminated and everyone disconnected immediately.`,
      confirmLabel: 'Force end',
      destructive: true,
    });
    if (!ok) return;

    try {
      setBusyId(meeting.id);
      await meetingClient.post(`/api/admin/meetings/${meeting.id}/force-end`);
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === meeting.id ? { ...m, status: 'ENDED', endedAt: new Date().toISOString() } : m
        )
      );
      toast.success('Meeting ended');
    } catch (err) {
      console.error('Failed to force end meeting', err);
      toast.error('Could not end that meeting.');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = meetings.filter((m) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return m.title.toLowerCase().includes(q) || m.joinCode.toLowerCase().includes(q);
  });

  const liveCount = meetings.filter((m) => m.status === 'LIVE').length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="t-h1 text-ink mb-1.5">Meetings</h1>
          <p className="t-body text-ink-3">
            {meetings.length} total · {liveCount} live now
          </p>
        </div>
        <Input
          icon={<Search className="w-4 h-4" />}
          placeholder="Search by title or code…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center text-ink-3">
            <Spinner size={20} />
          </div>
        ) : error ? (
          <EmptyState
            icon={<XCircle className="w-5 h-5" />}
            title={error}
            description="Check your connection and try again."
            action={
              <Button size="sm" variant="secondary" onClick={fetchMeetings}>
                Retry
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Video className="w-5 h-5" />}
            title={query ? 'No matches' : 'No meetings yet'}
            description={query ? 'Try a different title or join code.' : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-canvas-raised border-b border-line">
                <tr>
                  {['Meeting', 'Status', 'Timing', ''].map((h, i) => (
                    <th
                      key={h || i}
                      className={`px-5 py-3 t-overline text-ink-3 font-semibold ${i === 3 ? 'text-right' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filtered.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 t-small font-medium text-ink">
                        <Video size={14} className="text-ink-3 shrink-0" />
                        <span className="truncate max-w-[260px]">{meeting.title}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(meeting.joinCode, 'Join code copied')}
                        className="mt-1.5 font-mono t-caption text-ink-2 px-1.5 py-0.5 rounded bg-surface-inset border border-line hover:border-line-hover hover:text-ink transition-colors"
                        title="Copy join code"
                      >
                        {meeting.joinCode}
                      </button>
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge tone={statusTone(meeting.status) as any} pulse={meeting.status === 'LIVE'}>
                        {meeting.status}
                      </Badge>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1 t-caption text-ink-3">
                        {meeting.scheduledStart && (
                          <span className="flex items-center gap-1.5">
                            <Calendar size={11} />
                            {formatDateTime(meeting.scheduledStart)}
                          </span>
                        )}
                        {meeting.startedAt && <span>Started {formatDateTime(meeting.startedAt)}</span>}
                        {meeting.endedAt && <span>Ended {formatDateTime(meeting.endedAt)}</span>}
                        {!meeting.scheduledStart && !meeting.startedAt && !meeting.endedAt && (
                          <span>Created {formatDateTime(meeting.createdAt)}</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {meeting.status !== 'ENDED' && meeting.status !== 'CANCELLED' && (
                        <Button
                          variant="dangerGhost"
                          size="sm"
                          disabled={busyId === meeting.id}
                          onClick={() => forceEndMeeting(meeting)}
                          leading={<AlertCircle size={14} />}
                        >
                          Force end
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
