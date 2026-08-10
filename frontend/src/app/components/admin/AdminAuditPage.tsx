import { useEffect, useState } from 'react';
import { ScrollText, UserCog, UserX, PhoneOff } from 'lucide-react';
import { authClient } from '../../apiClient';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Spinner } from '../../ui/Spinner';
import { EmptyState } from '../../ui/EmptyState';
import { formatDateTime } from '../../utils/datetime';

interface AuditEntry {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  detail?: string;
  createdAt: string;
}

/** Icon and tone per action, so the log is scannable rather than a wall of text. */
const ACTION_META: Record<string, { icon: typeof UserCog; label: string; tone: 'iris' | 'danger' | 'saffron' }> = {
  USER_ROLE_CHANGED: { icon: UserCog, label: 'Role changed', tone: 'iris' },
  USER_DISABLED: { icon: UserX, label: 'Account disabled', tone: 'danger' },
  MEETING_FORCE_ENDED: { icon: PhoneOff, label: 'Meeting force-ended', tone: 'saffron' },
};

/**
 * The admin audit trail.
 *
 * Four endpoints across two services can lock a person out or kill a live call.
 * Until this existed there was no record of who did any of it.
 */
export function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authClient
      .get('/api/admin/audit')
      .then((res) => setEntries(res.data ?? []))
      .catch((e) => console.error('Failed to load audit trail', e))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="t-h1 text-ink mb-1.5">Audit log</h1>
        <p className="t-body text-ink-3">
          Every privileged action, and who performed it. Append-only.
        </p>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center text-ink-3">
            <Spinner size={18} />
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<ScrollText className="w-5 h-5" />}
            title="Nothing recorded yet"
            description="Role changes, account suspensions and force-ended meetings will appear here."
          />
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {entries.map((entry) => {
              const meta = ACTION_META[entry.action] ?? {
                icon: ScrollText,
                label: entry.action,
                tone: 'iris' as const,
              };
              const Icon = meta.icon;
              return (
                <div key={entry.id} className="p-4 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-surface-inset border border-line flex items-center justify-center shrink-0 text-ink-3">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <span className="t-small text-ink font-medium truncate">
                        {entry.actorEmail}
                      </span>
                    </div>
                    {entry.detail && (
                      <p className="t-small text-ink-2 mt-1 break-words">{entry.detail}</p>
                    )}
                    <p className="t-caption text-ink-3 mt-1 font-mono truncate">
                      {entry.targetType} · {entry.targetId}
                    </p>
                  </div>

                  <span className="t-caption text-ink-3 shrink-0 whitespace-nowrap">
                    {formatDateTime(entry.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
