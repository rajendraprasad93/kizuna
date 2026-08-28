import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, User, Camera, Brain, Loader2, MessageSquare, Wrench, DollarSign, Timer } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { AiAnalysisDisplay } from '@/components/AiAnalysisDisplay';
import { MapView } from '@/components/MapView';
import type { Report, ProblemCategory, AiAnalysis, ActionTaken, Profile, Department, ReportStatus, UserRole } from '@/types';

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [report, setReport] = useState<Report | null>(null);
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [actions, setActions] = useState<ActionTaken[]>([]);
  const [categories, setCategories] = useState<ProblemCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [department, setDepartment] = useState<Department | null>(null);
  const [reporter, setReporter] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const canManage = profile?.role === 'department' || profile?.role === 'admin';
  const role: UserRole = profile?.role || 'citizen';
  const dashLink = role === 'admin' ? '/admin/dashboard' : role === 'department' ? '/department/dashboard' : '/dashboard';

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const [repData, cats, depts] = await Promise.all([
          api.reports.get(id!),
          api.categories.list(),
          api.departments.list(),
        ]);

        if (!repData) { setLoading(false); return; }
        setReport(repData);
        setCategories(cats || []);
        setDepartments(depts || []);
        setActions(repData.actions_taken || []);

        // Extract AI analysis from report if embedded
        if ((repData as any).ai_analysis) {
          setAnalysis((repData as any).ai_analysis as AiAnalysis);
        }

        if (repData.department_id) {
          const dept = depts?.find((d) => d.id === repData.department_id);
          setDepartment(dept || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return <DashboardShell title={t('reportDetails')}><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div></DashboardShell>;
  }

  if (!report) {
    return (
      <DashboardShell title={t('reportNotFound')}>
        <Card className="p-8 text-center">
          <p className="text-slate-500 mb-4">{t('couldNotFind')}</p>
          <Link to={dashLink}><Button>{t('backToDashboard')}</Button></Link>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={report.title || t('reportDetails')}
      subtitle={`${t('reported')} ${new Date(report.created_at).toLocaleString()}`}
      actions={
        canManage ? (
          <>
            <Button size="sm" variant="outline" onClick={() => setShowStatusModal(true)}>{t('updateStatus')}</Button>
            <Button size="sm" onClick={() => setShowActionModal(true)}><Wrench className="h-4 w-4" /> {t('recordAction')}</Button>
          </>
        ) : undefined
      }
    >
      <div className="mb-4">
        <Link to={dashLink}>
          <Button size="sm" variant="ghost"><ArrowLeft className="h-4 w-4" /> {t('back')}</Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Report info + AI */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {report.image_urls && report.image_urls.length > 0 && (
            <Card className="p-0 overflow-hidden">
              <div className="grid grid-cols-1">
                {report.image_urls.map((url, i) => (
                  <img key={i} src={url} alt={`Report ${i + 1}`} className="w-full max-h-96 object-cover" />
                ))}
              </div>
            </Card>
          )}

          {/* Report Info */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <StatusBadge status={report.status} />
              {report.category && <Badge color={report.category.color as 'blue' | 'amber' | 'green'}>{report.category.display_name}</Badge>}
              <Badge color="slate">Priority {report.priority}</Badge>
              {report.is_duplicate && <Badge color="red">Duplicate</Badge>}
            </div>
            {report.description && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{report.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                {parseFloat(String(report.latitude)).toFixed(6)}, {parseFloat(String(report.longitude)).toFixed(6)}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="h-4 w-4 text-slate-400" />
                {new Date(report.submitted_at || report.created_at).toLocaleDateString()}
              </div>
              {reporter && (
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="h-4 w-4 text-slate-400" />
                  {reporter.full_name}
                </div>
              )}
              {department && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Brain className="h-4 w-4 text-slate-400" />
                  {department.name}
                </div>
              )}
            </div>
          </Card>

          {/* AI Analysis */}
          {analysis ? (
            <AiAnalysisDisplay analysis={analysis} />
          ) : (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-slate-400" />
                <h3 className="font-semibold text-slate-900">AI Analysis</h3>
              </div>
              <p className="text-sm text-slate-500">AI analysis has not been run on this report yet.</p>
            </Card>
          )}

          {/* Actions Timeline */}
          {actions.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-slate-400" /> Actions Taken
              </h3>
              <div className="space-y-4">
                {actions.map((action) => (
                  <div key={action.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Wrench className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">{action.action_type}</span>
                        <span className="text-xs text-slate-400">{new Date(action.created_at).toLocaleString()}</span>
                      </div>
                      {action.description && <p className="text-sm text-slate-600 mt-1">{action.description}</p>}
                      {action.after_image_urls && action.after_image_urls.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {action.after_image_urls.map((url, i) => (
                            <img key={i} src={url} alt="" className="w-20 h-20 rounded-lg object-cover" />
                          ))}
                        </div>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-slate-400">
                        {action.cost != null && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> ${action.cost}</span>}
                        {action.duration_minutes != null && <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> {action.duration_minutes}min</span>}
                        {action.notes && <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {action.notes}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right: Map + Meta */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Location</h3>
            <MapView reports={[report]} categories={categories} height="200px" centerLat={report.latitude} centerLng={report.longitude} zoom={15} />
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Timeline</h3>
            <div className="space-y-3">
              <TimelineItem label="Submitted" date={report.submitted_at || report.created_at} active />
              {report.assigned_at && <TimelineItem label="Assigned" date={report.assigned_at} active />}
              {report.resolved_at && <TimelineItem label="Resolved" date={report.resolved_at} active />}
              {report.status === 'in_progress' && <TimelineItem label="In Progress" date={report.updated_at} active />}
            </div>
          </Card>

          {analysis && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">AI Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Problem</span><span className="font-medium text-slate-900 capitalize">{analysis.final_problem_type}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Confidence</span><span className="font-medium text-slate-900">{Math.round((analysis.final_confidence || 0) * 100)}%</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Authenticity</span><span className="font-medium text-slate-900">{Math.round((analysis.authenticity_score || 0) * 100)}%</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Related</span><span className="font-medium text-slate-900">{analysis.related_incident_count} incidents</span></div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Status Modal */}
      {showStatusModal && report && (
        <StatusUpdateModal
          report={report}
          departments={departments}
          onClose={() => setShowStatusModal(false)}
          onUpdate={async (status, deptId) => {
            await api.reports.update(report.id, {
              status,
              ...(deptId ? { department_id: deptId } : {}),
              ...(status === 'assigned' && deptId ? { assigned_at: new Date().toISOString() } : {}),
              ...(status === 'resolved' ? { resolved_at: new Date().toISOString() } : {}),
            } as Partial<Report>);
            setShowStatusModal(false);
            navigate(0);
          }}
        />
      )}

      {/* Action Modal */}
      {showActionModal && report && (
        <ActionModal
          onClose={() => setShowActionModal(false)}
          onSubmit={async (actionType, description, notes, cost, duration, images) => {
            await api.actions.create({
              report_id: report.id,
              action_type: actionType,
              description,
              notes,
              cost: cost || undefined,
              duration_minutes: duration || undefined,
              after_image_urls: images,
            });
            setShowActionModal(false);
            navigate(0);
          }}
        />
      )}
    </DashboardShell>
  );
}

function TimelineItem({ label, date, active }: { label: string; date: string; active?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${active ? 'bg-brand-500' : 'bg-slate-300'}`} />
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-900">{label}</div>
        <div className="text-xs text-slate-400">{new Date(date).toLocaleString()}</div>
      </div>
    </div>
  );
}

function StatusUpdateModal({ report, departments, onClose, onUpdate }: {
  report: Report;
  departments: Department[];
  onClose: () => void;
  onUpdate: (status: ReportStatus, deptId?: string) => Promise<void>;
}) {
  const [status, setStatus] = useState<ReportStatus>(report.status as ReportStatus);
  const [deptId, setDeptId] = useState(report.department_id || '');
  const [saving, setSaving] = useState(false);

  const statuses: ReportStatus[] = ['submitted', 'analyzed', 'assigned', 'in_progress', 'resolved', 'rejected', 'closed'];

  return (
    <Modal open={true} onClose={onClose} title="Update Report Status" size="sm">
      <div className="space-y-4">
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as ReportStatus)}>
          {statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
        </Select>
        {status === 'assigned' && (
          <Select label="Department" value={deptId} onChange={(e) => setDeptId(e.target.value)}>
            <option value="">Select department...</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        )}
        <Button fullWidth loading={saving} onClick={async () => { setSaving(true); await onUpdate(status, deptId || undefined); setSaving(false); }}>
          Update Status
        </Button>
      </div>
    </Modal>
  );
}

function ActionModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (actionType: string, description: string, notes: string, cost: number | null, duration: number | null, images: string[]) => Promise<void>;
}) {
  const [actionType, setActionType] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  const [duration, setDuration] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setImages((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  return (
    <Modal open={true} onClose={onClose} title="Record Action Taken" size="md">
      <div className="space-y-4">
        <Input label="Action Type" value={actionType} onChange={(e) => setActionType(e.target.value)} placeholder="e.g., Drainage Cleaning, Road Repair" />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What was done?" rows={2} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Cost ($)" type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0" />
          <Input label="Duration (min)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="0" />
        </div>
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">After Photos</label>
          <div className="flex gap-2 flex-wrap mb-2">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} alt="" className="w-20 h-20 rounded-lg object-cover" />
                <button onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs">×</button>
              </div>
            ))}
          </div>
          <label className="flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg py-3 cursor-pointer hover:border-brand-400">
            <Camera className="h-5 w-5 text-slate-400 mr-2" />
            <span className="text-sm text-slate-600">Upload photos</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        <Button fullWidth loading={saving} onClick={async () => {
          if (!actionType) return;
          setSaving(true);
          await onSubmit(actionType, description, notes, cost ? parseFloat(cost) : null, duration ? parseInt(duration) : null, images);
          setSaving(false);
        }}>
          Save Action
        </Button>
      </div>
    </Modal>
  );
}
