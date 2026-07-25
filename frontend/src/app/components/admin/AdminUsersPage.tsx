import { useState, useEffect } from "react";
import { authClient } from "../../apiClient";
import { Shield, ShieldAlert, CheckCircle2, XCircle, MoreVertical } from "lucide-react";

/**
 * Representation of a user for administrative purposes.
 */
interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  emailVerified: boolean;
  disabled: boolean;
  createdAt: string;
}

/**
 * Admin portal page for managing users.
 * Displays a list of all registered users and allows administrators
 * to toggle user roles and disable/enable accounts.
 */

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await authClient.get("/api/admin/users");
      setUsers(res.data);
    } catch (err: any) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      await authClient.put(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error("Failed to update role", err);
      alert("Failed to update user role.");
    }
  };

  const toggleDisabled = async (userId: string, currentDisabled: boolean) => {
    const newDisabled = !currentDisabled;
    try {
      await authClient.put(`/api/admin/users/${userId}/disable`, { disabled: newDisabled });
      setUsers(users.map(u => u.id === userId ? { ...u, disabled: newDisabled } : u));
    } catch (err) {
      console.error("Failed to update disabled status", err);
      alert("Failed to update disabled status.");
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-stone-200 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-stone-200 rounded"></div><div className="h-4 bg-stone-200 rounded w-5/6"></div></div></div></div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-white">
          User Management
        </h1>
        <div className="text-sm text-stone-500">
          Total users: {users.length}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1712] border border-stone-200/80 dark:border-stone-800/80 rounded-[12px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600 dark:text-stone-300">
            <thead className="bg-stone-50/50 dark:bg-stone-800/30 text-stone-500 dark:text-stone-400 font-medium border-b border-stone-200/80 dark:border-stone-800/80">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-stone-900 dark:text-stone-100">
                      {user.fullName || "—"}
                    </div>
                    <div className="text-stone-500 dark:text-stone-400 text-xs mt-0.5">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' 
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200/60 dark:border-purple-500/20' 
                        : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700'
                    }`}>
                      {user.role === 'ADMIN' ? <Shield size={12} /> : null}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      {user.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                          <ShieldAlert size={12} /> Unverified
                        </span>
                      )}
                      
                      {user.disabled && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                          <XCircle size={12} /> Disabled
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-stone-500 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => toggleRole(user.id, user.role)}
                        className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-200 dark:border-stone-600 dark:hover:bg-stone-700"
                      >
                        Make {user.role === 'ADMIN' ? 'User' : 'Admin'}
                      </button>
                      <button 
                        onClick={() => toggleDisabled(user.id, user.disabled)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md border ${
                          user.disabled 
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                        }`}
                      >
                        {user.disabled ? 'Enable' : 'Disable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-stone-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
