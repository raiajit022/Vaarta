import { ReactNode } from 'react';
import { Users, Video, LogOut, ArrowLeft, ShieldOff } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Logo } from '../../ui/Logo';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { cn } from '../../ui/cn';

interface AdminLayoutProps {
  children: ReactNode;
  onNavigate: (route: string) => void;
  currentRoute: string;
}

/** Admin shell. Renders an access-denied state for non-admin users. */
export function AdminLayout({ children, onNavigate, currentRoute }: AdminLayoutProps) {
  const { user, logout } = useAuthStore();

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-canvas p-6">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-danger-soft border border-danger-line text-danger-ink flex items-center justify-center mx-auto mb-5">
            <ShieldOff className="w-5 h-5" />
          </div>
          <h1 className="t-h2 text-ink mb-2">Access denied</h1>
          <p className="t-small text-ink-3 mb-6">This area is restricted to administrators.</p>
          <Button variant="secondary" onClick={() => onNavigate('dashboard')}>
            Back to Vaarta
          </Button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'admin-users', label: 'Users', icon: Users },
    { id: 'admin-meetings', label: 'Meetings', icon: Video },
  ];

  return (
    <div className="min-h-screen w-full flex bg-canvas text-ink">
      <aside className="w-[248px] shrink-0 border-r border-line bg-canvas-raised flex flex-col">
        <div className="p-5">
          <Logo size="sm" className="mb-2.5" />
          <Badge tone="iris">Admin portal</Badge>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {menuItems.map((item) => {
            const active = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
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
                <item.icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-line space-y-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full flex items-center gap-3 px-3 h-9 rounded-md t-small font-medium text-ink-2 hover:bg-surface-hover hover:text-ink transition-colors"
          >
            <ArrowLeft size={17} />
            Back to app
          </button>

          <div className="flex items-center gap-2.5 p-2">
            <Avatar name={user?.fullName} email={user?.email} src={user?.avatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="t-small font-medium text-ink truncate">{user?.fullName || 'Admin'}</p>
              <p className="t-caption text-ink-3 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              window.location.reload();
            }}
            className="w-full flex items-center gap-3 px-3 h-9 rounded-md t-small font-medium text-danger-ink hover:bg-danger-soft transition-colors"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto scrollbar-fine">
        <div className="p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
