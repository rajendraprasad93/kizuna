import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Loader2, CheckCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Notification } from '@/types';

export function NotificationsPage() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!profile?.id) return;
      try {
        const data = await api.notifications.list();
        setNotifications(data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [profile?.id]);

  const markAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (err) { console.error(err); }
  };

  return (
    <DashboardShell title={t('notificationsTitle')} subtitle={`${notifications.filter((n) => !n.is_read).length} unread`}>
      <div className="max-w-2xl mx-auto space-y-4">
        {notifications.length > 0 && (
          <div className="flex justify-end">
            <Button size="sm" variant="ghost" onClick={markAllRead}><CheckCheck className="h-4 w-4" /> {t('markAllRead')}</Button>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t('noNotifications')}</p>
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
