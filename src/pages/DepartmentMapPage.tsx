import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { DashboardShell } from '@/components/DashboardShell';
import { MapView } from '@/components/MapView';
import { useNavigate } from 'react-router-dom';
import type { Report, ProblemCategory } from '@/types';

export function DepartmentMapPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<ProblemCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [reps, cats] = await Promise.all([
          api.reports.list(),
          api.categories.list(),
        ]);
        setReports(reps || []);
        setCategories(cats || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <DashboardShell title="Map View" subtitle="All reported problems on the map">
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
      ) : (
        <div className="space-y-4">
          <MapView
            reports={reports}
            categories={categories}
            height="600px"
            onSelect={(r) => navigate(`/reports/${r.id}`)}
          />
        </div>
      )}
    </DashboardShell>
  );
}
