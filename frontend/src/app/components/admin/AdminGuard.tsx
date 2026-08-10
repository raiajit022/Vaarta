import { ReactNode } from 'react';
import { ShieldOff } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../ui/Button';

/**
 * Client-side role gate for admin pages.
 *
 * This is UX, not security — it stops people seeing doors they cannot open. The
 * real boundary is `hasRole("ADMIN")` on `/api/admin/**` in auth-service and
 * meeting-service, which returns 403 regardless of what the client renders.
 *
 * Replaces the former `AdminLayout`, which swapped out the entire app shell and
 * made admin feel like a different product.
 */
export function AdminGuard({
  children,
  onNavigate,
}: {
  children: ReactNode;
  onNavigate: (route: string) => void;
}) {
  const { user } = useAuthStore();

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center py-24 px-6">
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

  return <>{children}</>;
}
