import { useState, useRef, useEffect } from 'react';
import {
  Home, Calendar, Users, Settings, Search, Bell, Shield, LogOut, Sun, Moon, Check,
} from 'lucide-react';
import { cn } from '../../../../ui/cn';
import { Input } from '../../../../ui/Input';
import { Avatar } from '../../../../ui/Avatar';
import { Logo } from '../../../../ui/Logo';
import { Button } from '../../../../ui/Button';
import { EmptyState } from '../../../../ui/EmptyState';
import { useTheme } from '../../../../hooks/useTheme';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useMeetingStore } from '../../../../store/useMeetingStore';

/** Closes a floating panel on outside click and on Escape. */
function useDismiss(onDismiss: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onDismiss();
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [onDismiss]);
  return ref;
}

/**
 * Primary navigation rail.
 *
 * Sign-out now lives in the user card at the bottom rather than as a button
 * floating over the page in the corner.
 */
export function Sidebar({
  currentView,
  setView,
  onSignOut,
}: {
  currentView: string;
  setView: (v: string) => void;
  onSignOut?: () => void;
}) {
  const { user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useDismiss(() => setMenuOpen(false));

  const items = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'meetings', icon: Calendar, label: 'Meetings' },
    { id: 'contacts', icon: Users, label: 'Contacts' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  if (user?.role === 'ADMIN') {
    items.push({ id: 'admin-users', icon: Shield, label: 'Admin' });
  }

  return (
    <aside className="w-[248px] shrink-0 border-r border-line bg-canvas-raised h-screen flex flex-col">
      <div className="h-16 flex items-center px-5 shrink-0">
        <Logo size="sm" />
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {items.map((item) => {
          const active =
            currentView === item.id ||
            (item.id === 'admin-users' && currentView.startsWith('admin-'));
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                'relative w-full flex items-center gap-3 px-3 h-9 rounded-md t-small font-medium transition-colors',
                active
                  ? 'bg-iris-soft text-iris'
                  : 'text-ink-2 hover:bg-surface-hover hover:text-ink'
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-iris" />
              )}
              <item.icon className="w-[17px] h-[17px] shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User card */}
      <div className="p-3 border-t border-line relative" ref={menuRef}>
        {menuOpen && (
          <div className="absolute bottom-[calc(100%-4px)] left-3 right-3 mb-1 rounded-xl border border-line bg-surface elev-3 p-1 z-50">
            <button
              onClick={() => {
                setMenuOpen(false);
                setView('settings');
              }}
              className="w-full flex items-center gap-2.5 px-3 h-9 rounded-md t-small text-ink-2 hover:bg-surface-hover hover:text-ink transition-colors"
            >
              <Settings className="w-4 h-4" /> Account settings
            </button>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="w-full flex items-center gap-2.5 px-3 h-9 rounded-md t-small text-danger-ink hover:bg-danger-soft transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-hover transition-colors text-left"
        >
          <Avatar name={user?.fullName} email={user?.email} src={user?.avatarUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="t-small font-medium text-ink truncate">
              {user?.fullName || user?.email?.split('@')[0] || 'Account'}
            </p>
            <p className="t-caption text-ink-3 truncate">{user?.email}</p>
          </div>
        </button>
      </div>
    </aside>
  );
}

/**
 * Top bar: search, theme toggle, notifications and profile.
 *
 * The theme toggle is new here — the signed-in product previously had no way to
 * switch themes at all, so a user who chose light on the landing page landed in
 * a dark app with no escape.
 */
export function TopNav({ onAvatarClick }: { onAvatarClick?: () => void }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useDismiss(() => setShowNotifications(false));
  const { isDark, setIsDark } = useTheme();

  const { user } = useAuthStore();
  const { meetings } = useMeetingStore();

  const upcoming = meetings
    .filter((m) => m.status === 'SCHEDULED' && m.scheduledStart && new Date(m.scheduledStart) > new Date())
    .sort((a, b) => new Date(a.scheduledStart!).getTime() - new Date(b.scheduledStart!).getTime());

  return (
    <header className="h-16 shrink-0 border-b border-line bg-canvas/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="w-full max-w-sm">
        <Input
          icon={<Search className="w-4 h-4" />}
          placeholder="Search meetings, contacts…"
          aria-label="Search"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDark(!isDark)}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </Button>

        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className={cn('relative', showNotifications && 'bg-surface-hover text-ink')}
          >
            <Bell className="w-[18px] h-[18px]" />
            {upcoming.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-iris ring-2 ring-canvas" />
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-[320px] rounded-xl border border-line bg-surface elev-3 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-line flex items-center justify-between">
                <span className="t-small font-semibold text-ink">Upcoming</span>
                <button className="t-caption font-medium text-iris hover:underline">
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-fine">
                {upcoming.length === 0 ? (
                  <EmptyState
                    icon={<Check className="w-5 h-5" />}
                    title="All clear"
                    description="Nothing scheduled coming up."
                    className="py-8"
                  />
                ) : (
                  upcoming.map((meeting) => {
                    const mins = Math.round(
                      (new Date(meeting.scheduledStart!).getTime() - Date.now()) / 60000
                    );
                    const when =
                      mins < 60
                        ? `Starts in ${mins} min`
                        : `Starts at ${new Date(meeting.scheduledStart!).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`;
                    return (
                      <div
                        key={meeting.id}
                        className="px-4 py-3 hover:bg-surface-hover transition-colors flex gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-iris-soft text-iris flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="t-small text-ink font-medium truncate">{meeting.title}</p>
                          <p className="t-caption text-ink-3 mt-0.5">{when}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onAvatarClick}
          className="ml-1 rounded-full hover:opacity-85 transition-opacity"
          aria-label="Account"
        >
          <Avatar name={user?.fullName} email={user?.email} src={user?.avatarUrl} size="sm" />
        </button>
      </div>
    </header>
  );
}
