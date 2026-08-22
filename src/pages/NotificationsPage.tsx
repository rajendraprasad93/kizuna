import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Loader2, CheckCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Notification } from '@/types';

export function NotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!profile?.id) return;
      const { data } = await supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });
      setNotifications((data as Notification[]) || []);
      setLoading(false);
    }
    load();
  }, [profile?.id]);

  const markAllRead = async () => {
    if (!profile?.id) return;
    await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('user_id', profile.id).eq('is_read', false);
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <DashboardShell title="Notifications" subtitle={`${notifications.filter((n) => !n.is_read).length} unread`}>
      <div className="max-w-2xl mx-auto space-y-4">
        {notifications.length > 0 && (
          <div className="flex justify-end">
            <Button size="sm" variant="ghost" onClick={markAllRead}><CheckCheck className="h-4 w-4" /> Mark all read</Button>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No notifications yet.</p>
          </Card>
        ) : (
          notifications.map((n) => (
            <Card key={n.id} className={`p-4 ${!n.is_read ? 'border-brand-200 bg-brand-50/30' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.is_read ? 'bg-brand-100' : 'bg-slate-100'}`}>
                  <Bell className={`h-4 w-4 ${!n.is_read ? 'text-brand-600' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900">{n.title}</h4>
                    <span className="text-xs text-slate-400">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                  {n.report_id && <Link to={`/reports/${n.report_id}`} className="text-xs text-brand-600 hover:text-brand-700 font-medium mt-2 inline-block">View report →</Link>}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </DashboardShell>
  );
}
