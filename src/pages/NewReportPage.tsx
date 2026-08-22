import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Loader2, Brain, Upload, X, CheckCircle2, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { runAIAnalysis, analysisToDbParams, getPriorityFromConfidence, getDepartmentForProblem, type AnalysisResult } from '@/lib/ai-engine';
import type { ProblemCategory, Department } from '@/types';

const CATEGORY_IMAGES: Record<string, string> = {
  flooding: 'https://images.pexels.com/photos/26202091/pexels-photo-26202091.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  pothole: 'https://images.pexels.com/photos/20518249/pexels-photo-20518249.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  garbage: 'https://images.pexels.com/photos/6316243/pexels-photo-6316243.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

type Step = 'form' | 'analyzing' | 'result';

export function NewReportPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [categories, setCategories] = useState<ProblemCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [step, setStep] = useState<Step>('form');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [latitude, setLatitude] = useState(13.0827);
  const [longitude, setLongitude] = useState(80.2707);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [catRes, deptRes] = await Promise.all([
        supabase.from('problem_categories').select('*').eq('is_active', true),
        supabase.from('departments').select('*').eq('is_active', true),
      ]);
      setCategories((catRes.data as ProblemCategory[]) || []);
      setDepartments((deptRes.data as Department[]) || []);
      setLoading(false);
    }
    load();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLatitude(pos.coords.latitude); setLongitude(pos.coords.longitude); },
        () => {}
      );
    }
  }, []);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { setError('Please describe the problem.'); return; }
    if (!profile?.id) { setError('You must be signed in.'); return; }

    setError(null);
    setSubmitting(true);

    try {
      const categoryName = selectedCategory?.name || null;
      const imageUrls = selectedImage ? [selectedImage] : [];

      const { data: report, error: insertErr } = await supabase
        .from('reports')
        .insert({
          user_id: profile.id,
          category_id: categoryId,
          title: title || null,
          description,
          latitude,
          longitude,
          image_urls: imageUrls,
          status: 'analyzing',
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      setCreatedReportId(report.id);

      const result = await runAIAnalysis({
        description,
        categoryName,
        categoryId,
        latitude,
        longitude,
        categories,
      });
      setAnalysisResult(result);

      const deptId = getDepartmentForProblem(result.final_problem_type, departments);
      const priority = getPriorityFromConfidence(result.final_confidence);
      const finalCategory = categories.find((c) => c.name === result.final_problem_type);

      await supabase.from('ai_analyses').insert(analysisToDbParams(report.id, result, finalCategory?.id || categoryId || ''));

      await supabase.from('reports').update({
        status: 'analyzed',
        priority,
        category_id: finalCategory?.id || categoryId,
        department_id: deptId,
      }).eq('id', report.id);

      await supabase.from('notifications').insert({
        user_id: profile.id,
        report_id: report.id,
        type: 'ai_analysis_complete',
        title: 'AI Analysis Complete',
        message: `Your report has been analyzed. Detected: ${result.final_problem_type} (${Math.round(result.final_confidence * 100)}% confidence)`,
      });

      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <DashboardShell title="New Report"><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div></DashboardShell>;
  }

  return (
    <DashboardShell title="Report a Problem" subtitle="Submit a new city problem report with AI analysis">
      <div className="max-w-2xl mx-auto">
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category selection */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-1">What type of problem?</h3>
              <p className="text-xs text-slate-500 mb-4">Select a category — or let the AI detect it from your description</p>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all ${categoryId === cat.id ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="aspect-video relative">
                      <img src={CATEGORY_IMAGES[cat.name]} alt={cat.display_name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <div className="text-xs font-semibold text-white">{cat.display_name.split(' / ')[0]}</div>
                    </div>
                    {categoryId === cat.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {!categoryId && (
                <p className="mt-3 text-xs text-brand-600 bg-brand-50 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Brain className="h-3.5 w-3.5" /> No category selected — AI will auto-detect from your description
                </p>
              )}
            </Card>

            {/* Photo */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-1">Add a photo</h3>
              <p className="text-xs text-slate-500 mb-4">Help the AI vision system detect the problem accurately</p>
              {selectedImage ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={selectedImage} alt="Problem" className="w-full h-48 object-cover" />
                  <button type="button" onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/60 text-white hover:bg-slate-900/80">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl py-8 cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 transition-colors">
                  <Camera className="h-8 w-8 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-600 font-medium">Click to upload a photo</span>
                  <span className="text-xs text-slate-400 mt-1">JPG, PNG up to 10MB</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </Card>

            {/* Description */}
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-slate-900">Describe the problem</h3>
              <Input
                label="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Water accumulation near Main Street"
              />
              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you see. The AI will analyze your text to detect the problem type, severity, and context."
                rows={4}
                required
              />
            </Card>

            {/* Location */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-1">Location</h3>
              <p className="text-xs text-slate-500 mb-4">GPS coordinates are auto-detected. You can adjust them manually.</p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Latitude"
                  type="number"
                  step="0.00000001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  icon={<MapPin className="h-4 w-4" />}
                />
                <Input
                  label="Longitude"
                  type="number"
                  step="0.00000001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  icon={<MapPin className="h-4 w-4" />}
                />
              </div>
              <div className="mt-3 text-xs text-slate-500 flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                <MapPin className="h-3.5 w-3.5" /> Location will be used for duplicate detection and cluster analysis
              </div>
            </Card>

            {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="flex gap-3">
              <Button type="submit" size="lg" fullWidth loading={submitting}>
                <Brain className="h-5 w-5" /> Submit & Run AI Analysis
              </Button>
            </div>
          </form>
        )}

        {step === 'analyzing' && (
          <Card className="p-12 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center">
                <Brain className="h-10 w-10 text-brand-600 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2">AI is analyzing your report...</h3>
            <p className="text-sm text-slate-500 mb-6">Running vision detection, NLP analysis, root cause investigation, and recommendation engine.</p>
            <div className="max-w-xs mx-auto space-y-2 text-left">
              {['Vision AI detection', 'NLP text extraction', 'Authenticity verification', 'Root cause analysis', 'Recommendation engine'].map((s, i) => (
                <div key={s} className="flex items-center gap-2 text-sm text-slate-600 animate-slide-up" style={{ animationDelay: `${i * 200}ms` }}>
                  <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                  {s}
                </div>
              ))}
            </div>
          </Card>
        )}

        {step === 'result' && analysisResult && createdReportId && (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">Report submitted & analyzed!</h3>
                  <p className="text-sm text-slate-600">The AI has completed its analysis.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white rounded-xl p-3 border border-slate-200">
                  <div className="text-xs text-slate-500">Detected Problem</div>
                  <div className="text-sm font-bold text-slate-900 capitalize">{analysisResult.final_problem_type}</div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-200">
                  <div className="text-xs text-slate-500">Confidence</div>
                  <div className="text-sm font-bold text-slate-900">{Math.round(analysisResult.final_confidence * 100)}%</div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-200">
                  <div className="text-xs text-slate-500">Root Cause</div>
                  <div className="text-sm font-bold text-slate-900">{analysisResult.possible_causes[0]?.cause}</div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-200">
                  <div className="text-xs text-slate-500">Recommended Action</div>
                  <div className="text-sm font-bold text-slate-900">{analysisResult.recommended_action}</div>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button onClick={() => navigate(`/reports/${createdReportId}`)} size="lg" fullWidth>
                <Eye className="h-5 w-5" /> View Full Report
              </Button>
              <Button onClick={() => { setStep('form'); setAnalysisResult(null); setCreatedReportId(null); setTitle(''); setDescription(''); setSelectedImage(null); }} size="lg" variant="outline">
                <Upload className="h-5 w-5" /> New Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
