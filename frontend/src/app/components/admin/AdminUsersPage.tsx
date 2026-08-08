import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, CheckCircle2, XCircle, Users as UsersIcon, Search } from 'lucide-react';
import { toast } from 'sonner';
import { authClient } from '../../apiClient';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { Avatar } from '../../ui/Avatar';
import { Spinner } from '../../ui/Spinner';
import { EmptyState } from '../../ui/EmptyState';
import { confirm } from '../../ui/confirm';
import { formatDate } from '../../utils/datetime';

interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  emailVerified: boolean;
  disabled: boolean;
  createdAt: string;
}

/** Admin view for promoting, demoting, disabling and re-enabling accounts. */
export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await authClient.get('/api/admin/users');
      setUsers(res.data);
      setError(null);
    } catch (err: any) {
      setError('Could not load users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (user: AdminUser) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const ok = await confirm({
      title: newRole === 'ADMIN' ? 'Grant admin access?' : 'Revoke admin access?',
      description:
        newRole === 'ADMIN'
          ? `${user.email} will be able to manage all users and end any meeting.`
          : `${user.email} will lose access to the admin portal.`,
      confirmLabel: newRole === 'ADMIN' ? 'Make admin' : 'Make user',
      destructive: newRole === 'USER',
    });
    if (!ok) return;

    try {
      setBusyId(user.id);
      await authClient.put(`/api/admin/users/${user.id}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
      toast.success(`${user.email} is now ${newRole === 'ADMIN' ? 'an admin' : 'a user'}`);
    } catch (err) {
      console.error('Failed to update role', err);
      toast.error('Could not update that role.');
    } finally {
      setBusyId(null);
    }
  };

  const toggleDisabled = async (user: AdminUser) => {
    const next = !user.disabled;
    const ok = await confirm({
      title: next ? 'Disable this account?' : 'Re-enable this account?',
      description: next
        ? `${user.email} will be signed out and blocked from logging in.`
        : `${user.email} will be able to log in again.`,
      confirmLabel: next ? 'Disable' : 'Enable',
      destructive: next,
    });
    if (!ok) return;

    try {
      setBusyId(user.id);
      await authClient.put(`/api/admin/users/${user.id}/disable`, { disabled: next });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, disabled: next } : u)));
      toast.success(next ? 'Account disabled' : 'Account enabled');
    } catch (err) {
      console.error('Failed to update disabled status', err);
      toast.error('Could not update that account.');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (u.fullName || '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const adminCount = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="t-h1 text-ink mb-1.5">Users</h1>
          <p className="t-body text-ink-3">
            {users.length} account{users.length === 1 ? '' : 's'} · {adminCount} admin
            {adminCount === 1 ? '' : 's'}
          </p>
        </div>
        <Input
          icon={<Search className="w-4 h-4" />}
          placeholder="Search users…"
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
              <Button size="sm" variant="secondary" onClick={fetchUsers}>
                Retry
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<UsersIcon className="w-5 h-5" />}
            title={query ? 'No matches' : 'No users yet'}
            description={query ? 'Try a different name or email.' : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-canvas-raised border-b border-line">
                <tr>
                  {['User', 'Role', 'Status', 'Joined', ''].map((h, i) => (
                    <th
                      key={h || i}
                      className={`px-5 py-3 t-overline text-ink-3 font-semibold ${i === 4 ? 'text-right' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.fullName} email={user.email} size="sm" />
                        <div className="min-w-0">
                          <p className="t-small font-medium text-ink truncate">
                            {user.fullName || '—'}
                          </p>
                          <p className="t-caption text-ink-3 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge tone={user.role === 'ADMIN' ? 'iris' : 'neutral'}>
                        {user.role === 'ADMIN' && <Shield size={11} />}
                        {user.role}
                      </Badge>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-col items-start gap-1.5">
                        {user.emailVerified ? (
                          <span className="inline-flex items-center gap-1 t-caption text-live-ink">
                            <CheckCircle2 size={12} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 t-caption text-saffron-ink">
                            <ShieldAlert size={12} /> Unverified
                          </span>
                        )}
                        {user.disabled && (
                          <span className="inline-flex items-center gap-1 t-caption text-danger-ink">
                            <XCircle size={12} /> Disabled
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 t-caption text-ink-3 whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busyId === user.id}
                          onClick={() => toggleRole(user)}
                        >
                          Make {user.role === 'ADMIN' ? 'user' : 'admin'}
                        </Button>
                        <Button
                          variant={user.disabled ? 'secondary' : 'dangerGhost'}
                          size="sm"
                          disabled={busyId === user.id}
                          onClick={() => toggleDisabled(user)}
                        >
                          {user.disabled ? 'Enable' : 'Disable'}
                        </Button>
                      </div>
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
