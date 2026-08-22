import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DashboardShell } from '@/components/DashboardShell';
import { MapView } from '@/components/MapView';
import { useNavigate } from 'react-router-dom';
import type { Report, ProblemCategory } from '@/types';

export function DepartmentMapPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<ProblemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [repRes, catRes] = await Promise.all([
        supabase.from('reports').select('*, category:problem_categories(*)').order('created_at', { ascending: false }),
        supabase.from('problem_categories').select('*'),
      ]);
      setReports((repRes.data as unknown as Report[]) || []);
      setCategories((catRes.data as ProblemCategory[]) || []);
      setLoading(false);
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
            selectedId={selected}
            onSelect={(r) => navigate(`/reports/${r.id}`)}
          />
        </div>
      )}
    </DashboardShell>
  );
}
