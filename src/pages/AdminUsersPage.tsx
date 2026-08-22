import { useEffect, useState } from 'react';
import { Loader2, Users as UsersIcon, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Profile, Department } from '@/types';

export function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      const [userRes, deptRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('departments').select('*'),
      ]);
      setUsers((userRes.data as Profile[]) || []);
      setDepartments((deptRes.data as Department[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filter === 'all' ? users : users.filter((u) => u.role === filter);

  const roleColor = (role: string) => role === 'admin' ? 'purple' : role === 'department' ? 'emerald' : 'blue';
  const roleLabel = (role: string) => role === 'admin' ? 'Admin' : role === 'department' ? 'Official' : 'Citizen';

  return (
    <DashboardShell title="User Management" subtitle={`${users.length} users`}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {['all', 'citizen', 'department', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === r ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {r === 'all' ? 'All' : roleLabel(r)}s
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <UsersIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No users found.</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Department</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => {
                  const dept = departments.find((d) => d.id === user.department_id);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-semibold text-xs">
                            {user.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{user.full_name}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge color={roleColor(user.role) as 'blue' | 'emerald' | 'purple'}>{roleLabel(user.role)}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-slate-600">{dept?.name || '—'}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-400 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
