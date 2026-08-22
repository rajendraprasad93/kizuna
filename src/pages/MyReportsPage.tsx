import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, FileText, MapPin, Clock, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { MapView } from '@/components/MapView';
import type { Report, ProblemCategory, ReportStatus } from '@/types';

export function MyReportsPage() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<ProblemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [view, setView] = useState<'list' | 'map'>('list');

  useEffect(() => {
    async function load() {
      const [repRes, catRes] = await Promise.all([
        supabase.from('reports').select('*, category:problem_categories(*)').eq('user_id', profile?.id).order('created_at', { ascending: false }),
        supabase.from('problem_categories').select('*'),
      ]);
      setReports((repRes.data as unknown as Report[]) || []);
      setCategories((catRes.data as ProblemCategory[]) || []);
      setLoading(false);
    }
    if (profile?.id) load();
  }, [profile?.id]);

  const filtered = statusFilter === 'all' ? reports : reports.filter((r) => r.status === statusFilter);

  return (
    <DashboardShell title="My Reports" subtitle={`${reports.length} total reports`}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="analyzing">Analyzing</option>
              <option value="analyzed">Analyzed</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant={view === 'list' ? 'secondary' : 'ghost'} onClick={() => setView('list')}>List</Button>
            <Button size="sm" variant={view === 'map' ? 'secondary' : 'ghost'} onClick={() => setView('map')}>Map</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
        ) : view === 'map' ? (
          <MapView reports={filtered} categories={categories} height="500px" onSelect={(r) => { window.location.href = `/reports/${r.id}`; }} />
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">No reports found.</p>
            <Link to="/report/new"><Button>Report a Problem</Button></Link>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map((report) => (
              <Link key={report.id} to={`/reports/${report.id}`}>
                <Card hover className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <StatusBadge status={report.status} />
                        {report.category && <Badge color={report.category.color as 'blue' | 'amber' | 'green'}>{report.category.display_name.split(' / ')[0]}</Badge>}
                        <Badge color="slate">P{report.priority}</Badge>
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm">{report.title || 'Untitled'}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{report.description || 'No description'}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {report.image_urls && report.image_urls.length > 0 && (
                      <img src={report.image_urls[0]} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
