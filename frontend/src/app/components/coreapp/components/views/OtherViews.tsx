import React, { useState, useEffect } from 'react';
import {
  Calendar, Video, Clock, Search, Mail, User, Bell, Shield, Plus, X, Trash2,
  Radio, KeyRound, Link2, Users, MonitorSmartphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../../../ui/Card';
import { Button } from '../../../../ui/Button';
import { Input, Field } from '../../../../ui/Input';
import { Badge } from '../../../../ui/Badge';
import { Avatar } from '../../../../ui/Avatar';
import { Tabs } from '../../../../ui/Tabs';
import { Modal } from '../../../../ui/Modal';
import { Switch } from '../../../../ui/Switch';
import { Spinner } from '../../../../ui/Spinner';
import { EmptyState } from '../../../../ui/EmptyState';
import { confirm } from '../../../../ui/confirm';
import { copyToClipboard } from '../../../../ui/clipboard';
import { cn } from '../../../../ui/cn';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useMeetingStore, type Meeting } from '../../../../store/useMeetingStore';
import { formatDateTime, formatDate, isPastMeeting } from '../../../../utils/datetime';
import { DeviceTester } from './DeviceTester';
import { MeetingDetailsModal } from './Modals';
import { userClient, authClient } from '../../../../apiClient';

const joinUrl = (code: string) => `${window.location.origin}/join/${code}`;

/* ========================================================================== */
/*  Meetings                                                                  */
/* ========================================================================== */

export function MeetingsView({
  onScheduleMeeting,
  onJoinDirectly,
}: {
  onScheduleMeeting: () => void;
  onJoinDirectly?: (meeting: Meeting) => void;
}) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selected, setSelected] = useState<Meeting | null>(null);
  const { meetings, fetchMyMeetings, deleteMeeting, isLoading } = useMeetingStore();

  useEffect(() => {
    fetchMyMeetings();
  }, [fetchMyMeetings]);

  const upcoming = meetings.filter((m) => !isPastMeeting(m));
  const past = meetings.filter((m) => isPastMeeting(m));
  const rows = activeTab === 'upcoming' ? upcoming : past;

  const handleDelete = async (m: Meeting) => {
    const ok = await confirm({
      title: activeTab === 'upcoming' ? 'Cancel this meeting?' : 'Remove from history?',
      description:
        activeTab === 'upcoming'
          ? `"${m.title}" will be cancelled and its join code will stop working.`
          : `"${m.title}" will be removed from your list. This cannot be undone.`,
      confirmLabel: activeTab === 'upcoming' ? 'Cancel meeting' : 'Remove',
      destructive: true,
    });
    if (!ok) return;

    try {
      await deleteMeeting(m.id);
      toast.success(activeTab === 'upcoming' ? 'Meeting cancelled' : 'Meeting removed');
    } catch {
      toast.error('Could not remove the meeting. Please try again.');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="t-h1 text-ink mb-1.5">Meetings</h1>
          <p className="t-body text-ink-3">Everything scheduled, and everything that already happened.</p>
        </div>
        <Button onClick={onScheduleMeeting} leading={<Plus className="w-4 h-4" />}>
          Schedule
        </Button>
      </div>

      <Tabs
        className="mb-5"
        value={activeTab}
        onChange={setActiveTab}
        items={[
          { id: 'upcoming', label: 'Upcoming', count: upcoming.length },
          { id: 'past', label: 'Past', count: past.length },
        ]}
      />

      <div className="space-y-2.5">
        {isLoading && rows.length === 0 && (
          <Card className="p-10 flex justify-center text-ink-3">
            <Spinner size={18} />
          </Card>
        )}

        {!isLoading && rows.length === 0 && (
          <Card>
            <EmptyState
              icon={activeTab === 'upcoming' ? <Calendar className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              title={activeTab === 'upcoming' ? 'Nothing scheduled' : 'No past meetings'}
              description={
                activeTab === 'upcoming'
                  ? 'Schedule a meeting and invite people by email.'
                  : 'Once you finish a call it will appear here with its recap.'
              }
              action={
                activeTab === 'upcoming' ? (
                  <Button size="sm" onClick={onScheduleMeeting}>
                    Schedule a meeting
                  </Button>
                ) : undefined
              }
            />
          </Card>
        )}

        {rows.map((m) => {
          const isLive = m.status === 'LIVE';
          const isUpcoming = activeTab === 'upcoming';
          return (
            <Card key={m.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg border flex items-center justify-center shrink-0',
                    isLive
                      ? 'bg-live-soft border-live-line text-live-ink'
                      : 'bg-surface-inset border-line text-ink-3'
                  )}
                >
                  {isLive ? (
                    <Radio className="w-[18px] h-[18px]" />
                  ) : isUpcoming ? (
                    <Calendar className="w-[18px] h-[18px]" />
                  ) : (
                    <Video className="w-[18px] h-[18px]" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="t-h3 text-ink truncate">{m.title}</h3>
                    {isLive && <Badge tone="live" pulse>Live</Badge>}
                    {m.status === 'CANCELLED' && <Badge tone="danger">Cancelled</Badge>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5">
                    <span className="flex items-center gap-1.5 t-caption text-ink-3">
                      <Clock className="w-3.5 h-3.5" />
                      {isUpcoming
                        ? m.scheduledStart
                          ? formatDateTime(m.scheduledStart)
                          : 'Instant meeting'
                        : formatDate(m.endedAt || m.scheduledStart || m.createdAt, 'Ended')}
                    </span>
                    {isUpcoming && (
                      <button
                        onClick={() => copyToClipboard(m.joinCode, 'Meeting code copied')}
                        className="font-mono t-caption text-ink-2 px-1.5 py-0.5 rounded bg-surface-inset border border-line hover:border-line-hover hover:text-ink transition-colors"
                        title="Copy meeting code"
                      >
                        {m.joinCode}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => handleDelete(m)}
                  aria-label={isUpcoming ? 'Cancel meeting' : 'Remove from history'}
                  className="text-ink-3 hover:text-danger-ink hover:bg-danger-soft"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                {isUpcoming ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(joinUrl(m.joinCode), 'Invite link copied')}
                      leading={<Link2 className="w-3.5 h-3.5" />}
                    >
                      Copy link
                    </Button>
                    <Button size="sm" onClick={() => onJoinDirectly?.(m)}>
                      Join
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => setSelected(m)}>
                    View recap
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {selected && <MeetingDetailsModal meeting={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ========================================================================== */
/*  Contacts                                                                  */
/* ========================================================================== */

export function ContactsView() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [query, setQuery] = useState('');

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const res = await userClient.get('/api/users/contacts');
      setContacts(res.data);
    } catch (e) {
      console.error('Failed to fetch contacts', e);
      toast.error('Could not load contacts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAdd = async () => {
    if (!email.trim()) return;
    try {
      setIsSaving(true);
      await userClient.post('/api/users/contacts', {
        email,
        name: `${firstName} ${lastName}`.trim(),
      });
      setIsAddOpen(false);
      setEmail('');
      setFirstName('');
      setLastName('');
      toast.success('Contact added');
      fetchContacts();
    } catch (e: any) {
      console.error('Failed to add contact', e);
      toast.error(e?.response?.data?.message || 'Could not add that contact.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (contact: any) => {
    const ok = await confirm({
      title: 'Remove contact?',
      description: `${contact.contactName || contact.contactEmail} will be removed from your directory.`,
      confirmLabel: 'Remove',
      destructive: true,
    });
    if (!ok) return;

    try {
      await userClient.delete(`/api/users/contacts/${contact.id}`);
      toast.success('Contact removed');
      fetchContacts();
    } catch (e) {
      console.error('Failed to delete contact', e);
      toast.error('Could not remove that contact.');
    }
  };

  const filtered = contacts.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.contactName || '').toLowerCase().includes(q) ||
      (c.contactEmail || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="t-h1 text-ink mb-1.5">Contacts</h1>
          <p className="t-body text-ink-3">People you meet with often.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} leading={<Plus className="w-4 h-4" />}>
          Add contact
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-3 border-b border-line bg-canvas-raised">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Search by name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {isLoading ? (
          <div className="p-10 flex justify-center text-ink-3">
            <Spinner size={18} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="w-5 h-5" />}
            title={query ? 'No matches' : 'No contacts yet'}
            description={
              query
                ? 'Try a different name or email address.'
                : 'Add the people you meet with most so inviting them takes one click.'
            }
            action={
              !query ? (
                <Button size="sm" onClick={() => setIsAddOpen(true)}>
                  Add your first contact
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {filtered.map((contact) => (
              <div
                key={contact.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-surface-hover transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar name={contact.contactName} email={contact.contactEmail} />
                  <div className="min-w-0">
                    <p className="t-small font-medium text-ink truncate">
                      {contact.contactName || contact.contactEmail}
                    </p>
                    <p className="t-caption text-ink-3 truncate">{contact.contactEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="iconSm"
                    aria-label={`Email ${contact.contactEmail}`}
                    onClick={() => window.open(`mailto:${contact.contactEmail}`)}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    aria-label="Remove contact"
                    onClick={() => handleDelete(contact)}
                    className="text-ink-3 hover:text-danger-ink hover:bg-danger-soft"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {isAddOpen && (
        <Modal
          onClose={() => setIsAddOpen(false)}
          title="Add contact"
          description="They'll show up when you invite people to a meeting."
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} loading={isSaving} disabled={!email.trim()}>
                Add contact
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Email address" htmlFor="contact-email">
              <Input
                id="contact-email"
                type="email"
                placeholder="jane@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" htmlFor="contact-first">
                <Input
                  id="contact-first"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Field>
              <Field label="Last name" htmlFor="contact-last">
                <Input
                  id="contact-last"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Field>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ========================================================================== */
/*  Settings                                                                  */
/* ========================================================================== */

const NOTIFICATION_PREFS = [
  { id: 'reminders', title: 'Meeting reminders', desc: 'Ping me 10 minutes before a meeting starts' },
  { id: 'chat', title: 'Chat messages', desc: 'Notify me about direct messages' },
  { id: 'recaps', title: 'Meeting recaps', desc: 'Tell me when a summary is ready' },
  { id: 'digest', title: 'Email digest', desc: 'Send a daily summary by email' },
] as const;

const PREFS_KEY = 'vaarta:notification-prefs';

function SettingsRow({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3.5 border-b border-line last:border-0">
      <div className="min-w-0">
        <p className="t-small font-medium text-ink">{title}</p>
        <p className="t-caption text-ink-3 mt-0.5">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsView() {
  const { user, fetchProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const [firstName, setFirstName] = useState(user?.fullName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.fullName?.split(' ').slice(1).join(' ') || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [timezone, setTimezone] = useState(
    user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [photoDraft, setPhotoDraft] = useState('');

  const openPhotoDialog = () => {
    setPhotoDraft(avatarUrl || '');
    setIsPhotoOpen(true);
  };

  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      /* ignore malformed storage */
    }
    return Object.fromEntries(NOTIFICATION_PREFS.map((p) => [p.id, true]));
  });

  const setPref = (id: string, value: boolean) => {
    const next = { ...prefs, [id]: value };
    setPrefs(next);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — preference simply won't persist */
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await userClient.put('/api/users/me', {
        displayName: `${firstName} ${lastName}`.trim(),
        avatarUrl,
        organization,
        timezone,
      });
      await fetchProfile();
      toast.success('Profile updated');
    } catch (error) {
      console.error(error);
      toast.error('Could not save your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * There is no authenticated change-password endpoint, so the honest path is
   * the existing reset-by-email flow rather than a form that goes nowhere.
   */
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsSendingReset(true);
    try {
      await authClient.post('/api/auth/forgot-password', { email: user.email });
      toast.success(`Reset link sent to ${user.email}`);
    } catch {
      toast.error('Could not send the reset link. Please try again.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const nav = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'audio-video', icon: Video, label: 'Audio & video' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'security', icon: Shield, label: 'Security' },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Card className="p-6">
            <h2 className="t-h3 text-ink mb-6">Public profile</h2>

            <div className="flex items-start gap-5 mb-8">
              <Avatar
                name={user?.fullName}
                email={user?.email}
                src={avatarUrl}
                size="xl"
                className="border border-line"
              />
              <div className="space-y-2.5">
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={openPhotoDialog}>
                    Change photo
                  </Button>
                  {avatarUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger-ink hover:bg-danger-soft"
                      onClick={() => setAvatarUrl(null)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="t-caption text-ink-3">A direct link to a square image works best.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="First name" htmlFor="s-first">
                  <Input id="s-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </Field>
                <Field label="Last name" htmlFor="s-last">
                  <Input id="s-last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Organisation" htmlFor="s-org">
                  <Input
                    id="s-org"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Where you work"
                  />
                </Field>
                <Field label="Timezone" htmlFor="s-tz">
                  <Input id="s-tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                </Field>
              </div>
              <Field label="Email address" hint="Your email is used to sign in and cannot be changed here.">
                <Input value={user?.email || ''} readOnly className="text-ink-3 cursor-not-allowed" />
              </Field>
            </div>

            <div className="mt-7 pt-5 border-t border-line flex justify-end">
              <Button onClick={handleSave} loading={isSaving}>
                Save changes
              </Button>
            </div>
          </Card>
        );

      case 'audio-video':
        return (
          <Card className="p-6">
            <h2 className="t-h3 text-ink mb-1">Audio & video</h2>
            <p className="t-small text-ink-3 mb-6">
              Check your camera and microphone before your next call.
            </p>
            <DeviceTester />
          </Card>
        );

      case 'notifications':
        return (
          <Card className="p-6">
            <h2 className="t-h3 text-ink mb-1">Notifications</h2>
            <p className="t-small text-ink-3 mb-4">Saved on this device.</p>
            <div>
              {NOTIFICATION_PREFS.map((p) => (
                <SettingsRow key={p.id} title={p.title} desc={p.desc}>
                  <Switch
                    checked={prefs[p.id] ?? true}
                    onChange={(v) => setPref(p.id, v)}
                    label={p.title}
                  />
                </SettingsRow>
              ))}
            </div>
          </Card>
        );

      case 'security':
        return (
          <div className="space-y-5">
            <Card className="p-6">
              <h2 className="t-h3 text-ink mb-1">Password</h2>
              <p className="t-small text-ink-3 mb-5">
                We'll email a secure link to <span className="text-ink font-medium">{user?.email}</span>.
                The link expires in 30 minutes.
              </p>
              <Button
                variant="secondary"
                onClick={handlePasswordReset}
                loading={isSendingReset}
                leading={<KeyRound className="w-4 h-4" />}
              >
                Send password reset link
              </Button>
            </Card>

            <Card className="p-6">
              <h2 className="t-h3 text-ink mb-1">Two-factor authentication</h2>
              <p className="t-small text-ink-3 mb-5">
                An extra step at sign-in, using an authenticator app.
              </p>
              <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-line bg-surface-inset">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface border border-line flex items-center justify-center text-ink-3">
                    <MonitorSmartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="t-small font-medium text-ink">Authenticator app</p>
                    <p className="t-caption text-ink-3">Not available yet</p>
                  </div>
                </div>
                <Badge tone="neutral">Coming soon</Badge>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full flex gap-8">
      <div className="w-56 shrink-0">
        <h1 className="t-h1 text-ink mb-5">Settings</h1>
        <nav className="space-y-0.5">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 h-9 rounded-md t-small font-medium transition-colors',
                activeTab === item.id
                  ? 'bg-iris-soft text-iris'
                  : 'text-ink-2 hover:bg-surface-hover hover:text-ink'
              )}
            >
              <item.icon className="w-[17px] h-[17px]" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 max-w-2xl">{renderTab()}</div>

      {isPhotoOpen && (
        <Modal
          onClose={() => setIsPhotoOpen(false)}
          title="Profile photo"
          description="Paste a direct link to a square image."
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsPhotoOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setAvatarUrl(photoDraft.trim() || null);
                  setIsPhotoOpen(false);
                }}
              >
                Use this photo
              </Button>
            </>
          }
        >
          <div className="flex items-center gap-4">
            <Avatar
              name={user?.fullName}
              email={user?.email}
              src={photoDraft.trim() || null}
              size="lg"
              className="border border-line"
            />
            <Input
              placeholder="https://example.com/photo.jpg"
              value={photoDraft}
              onChange={(e) => setPhotoDraft(e.target.value)}
              autoFocus
            />
          </div>
          <p className="t-caption text-ink-3 mt-3">Remember to save your profile afterwards.</p>
        </Modal>
      )}
    </div>
  );
}
