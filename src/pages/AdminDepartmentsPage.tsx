import { useEffect, useState } from 'react';
import { Loader2, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Department, Report } from '@/types';

export function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [deptRes, repRes] = await Promise.all([
        supabase.from('departments').select('*').order('name'),
        supabase.from('reports').select('*'),
      ]);
      setDepartments((deptRes.data as Department[]) || []);
      setReports((repRes.data as unknown as Report[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <DashboardShell title="Departments" subtitle={`${departments.length} departments`}>
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {departments.map((dept) => {
            const deptReports = reports.filter((r) => r.department_id === dept.id);
            const resolved = deptReports.filter((r) => r.status === 'resolved').length;
            const active = deptReports.filter((r) => !['resolved', 'closed', 'rejected'].includes(r.status)).length;
            const rate = deptReports.length > 0 ? Math.round((resolved / deptReports.length) * 100) : 0;

            return (
              <Card key={dept.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{dept.name}</h3>
                      <p className="text-xs text-slate-500">{dept.description}</p>
                    </div>
                  </div>
                  <Badge color={dept.is_active ? 'green' : 'slate'}>{dept.is_active ? 'Active' : 'Inactive'}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-slate-900">{deptReports.length}</div>
                    <div className="text-xs text-slate-500">Total</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-amber-700">{active}</div>
                    <div className="text-xs text-amber-600">Active</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-emerald-700">{rate}%</div>
                    <div className="text-xs text-emerald-600">Resolved</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500">
                  {dept.contact_email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {dept.contact_email}</div>}
                  {dept.contact_phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {dept.contact_phone}</div>}
                  {dept.address && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {dept.address}</div>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
