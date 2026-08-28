import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  MapPin,
  Loader2,
  Brain,
  Upload,
  X,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { DashboardShell } from "@/components/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import {
  runAIAnalysis,
  getPriorityFromConfidence,
  getDepartmentForProblem,
  type AnalysisResult,
} from "@/lib/ai-engine";
import type { ProblemCategory, Department } from "@/types";

type Step = "form" | "analyzing" | "result";

export function NewReportPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<ProblemCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [step, setStep] = useState<Step>("form");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [latitude, setLatitude] = useState(13.0827);
  const [longitude, setLongitude] = useState(80.2707);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [catData, deptData] = await Promise.all([
          api.categories.list(),
          api.departments.list(),
        ]);
        setCategories(catData || []);
        setDepartments(deptData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {},
      );
    }
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const imageData = reader.result as string;
      setSelectedImage(imageData);

      // Automatically analyze when image is uploaded
      await analyzeImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageData: string) => {
    if (!profile?.id) {
      setError("You must be signed in.");
      return;
    }

    setError(null);
    setStep("analyzing");

    try {
      // Strip data URL prefix to get raw base64
      let imageBase64: string | null = null;
      let mimeType = "image/jpeg";
      const match = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        imageBase64 = match[2];
      }

      // Run AI analysis with minimal input - just the image
      const result = await runAIAnalysis({
        description: description || "Image uploaded for analysis",
        categoryName: null,
        categoryId: null,
        latitude,
        longitude,
        categories,
        imageBase64,
        mimeType,
      });

      setAnalysisResult(result);

      // Auto-fill detected information
      const detectedCategory = categories.find(
        (c) =>
          c.name.toLowerCase() === result.final_problem_type.toLowerCase() ||
          c.display_name?.toLowerCase() ===
            result.final_problem_type.toLowerCase(),
      );
      if (detectedCategory) {
        setCategoryId(detectedCategory.id);
      }

      // Generate title from AI result
      const autoTitle = `${result.final_problem_type.charAt(0).toUpperCase() + result.final_problem_type.slice(1)} Issue`;
      setTitle(autoTitle);

      // Generate description from AI analysis
      const autoDescription =
        result.visible_conditions.length > 0
          ? `${result.visible_conditions.join(", ")} detected. ${result.possible_causes[0]?.cause || ""}`
          : `${result.final_problem_type} detected with ${Math.round(result.final_confidence * 100)}% confidence`;
      setDescription(autoDescription);

      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze image");
      setStep("form");
    }
  };

  const handleSubmit = async () => {
    if (!analysisResult) {
      setError("Please upload an image first.");
      return;
    }
    if (!profile?.id) {
      setError("You must be signed in.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const imageUrls = selectedImage ? [selectedImage] : [];
      const deptId = getDepartmentForProblem(
        analysisResult.final_problem_type,
        departments,
      );
      const priority = getPriorityFromConfidence(
        analysisResult.final_confidence,
      );
      const finalCategory = categories.find(
        (c) =>
          c.name.toLowerCase() ===
            analysisResult.final_problem_type.toLowerCase() ||
          c.display_name?.toLowerCase() ===
            analysisResult.final_problem_type.toLowerCase(),
      );

      const report = await api.reports.create({
        category_id: finalCategory?.id || categoryId || null,
        title,
        description,
        latitude,
        longitude,
        image_urls: imageUrls,
        ai_analysis: analysisResult,
        priority,
        department_id: deptId,
      });

      setCreatedReportId(report.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell title={t("newReportTitle")}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={t("newReportTitle")}
      subtitle={t("newReportSubtitle")}
    >
      <div className="max-w-2xl mx-auto">
        {step === "form" && (
          <div className="space-y-6">
            <Card className="p-8 text-center">
              <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                Upload a Photo
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                AI will automatically analyze and detect the problem
              </p>

              {selectedImage ? (
                <div className="relative rounded-xl overflow-hidden mb-4">
                  <img
                    src={selectedImage}
                    alt="Problem"
                    className="w-full h-64 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setAnalysisResult(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/60 text-white hover:bg-slate-900/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl py-12 cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 transition-colors">
                  <Camera className="h-12 w-12 text-slate-400 mb-3" />
                  <span className="text-sm text-slate-600 font-medium">
                    Click to upload a photo
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    JPG, PNG up to 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}

              <div className="mt-6 text-xs text-slate-500 bg-slate-50 rounded-lg px-4 py-3 text-left space-y-1">
                <div className="flex items-center gap-2">
                  <Brain className="h-3.5 w-3.5 text-brand-600" />
                  <span className="font-semibold text-slate-700">
                    AI will automatically detect:
                  </span>
                </div>
                <div className="ml-5 space-y-0.5">
                  <div>
                    • Problem category (flooding, pothole, garbage, etc.)
                  </div>
                  <div>• Severity level and priority</div>
                  <div>• Recommended actions and department routing</div>
                </div>
              </div>
            </Card>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        )}

        {step === "analyzing" && (
          <Card className="p-12 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center">
                <Brain className="h-10 w-10 text-brand-600 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
              AI is analyzing your report...
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Running vision detection, NLP analysis, root cause investigation,
              and recommendation engine.
            </p>
            <div className="max-w-xs mx-auto space-y-2 text-left">
              {[
                "Vision AI detection",
                "NLP text extraction",
                "Authenticity verification",
                "Root cause analysis",
                "Recommendation engine",
              ].map((s, i) => (
                <div
                  key={s}
                  className="flex items-center gap-2 text-sm text-slate-600 animate-slide-up"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                  {s}
                </div>
              ))}
            </div>
          </Card>
        )}

        {step === "result" && analysisResult && !createdReportId && (
          <div className="space-y-6">
            {selectedImage && (
              <Card className="p-4">
                <img
                  src={selectedImage}
                  alt="Problem"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </Card>
            )}

            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    VERIFIED & ANALYZED
                  </h3>
                  <p className="text-sm text-slate-600">
                    AI has completed the analysis. Review and confirm.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">
                    Problem Type
                  </div>
                  <div className="text-base font-bold text-slate-900 capitalize">
                    {analysisResult.final_problem_type}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Confidence</div>
                  <div className="text-base font-bold text-emerald-600">
                    {Math.round(analysisResult.final_confidence * 100)}%
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Severity</div>
                  <div className="text-base font-bold text-orange-600 capitalize">
                    {analysisResult.possible_causes[0]?.severity || "Medium"}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Priority</div>
                  <div className="text-base font-bold text-red-600">
                    {getPriorityFromConfidence(analysisResult.final_confidence)}
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-white rounded-xl p-4 border border-slate-200">
                <div className="text-xs text-slate-500 mb-2">Description</div>
                <div className="text-sm text-slate-900">{description}</div>
              </div>

              {analysisResult.visible_conditions.length > 0 && (
                <div className="mt-4 bg-white rounded-xl p-4 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-2">
                    Detected Conditions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.visible_conditions
                      .slice(0, 5)
                      .map((condition, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-brand-50 text-brand-700 text-xs rounded-md font-medium"
                        >
                          {condition.replace(/_/g, " ")}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {analysisResult.possible_causes.length > 0 && (
                <div className="mt-4 bg-white rounded-xl p-4 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-2">Root Cause</div>
                  <div className="text-sm text-slate-900 font-medium">
                    {analysisResult.possible_causes[0].cause}
                  </div>
                  {analysisResult.possible_causes[0].evidence && (
                    <div className="text-xs text-slate-600 mt-1">
                      Confidence:{" "}
                      {Math.round(
                        analysisResult.possible_causes[0].confidence * 100,
                      )}
                      %
                    </div>
                  )}
                </div>
              )}

              {analysisResult.recommended_action && (
                <div className="mt-4 bg-white rounded-xl p-4 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-2">
                    Recommended Action
                  </div>
                  <div className="text-sm text-slate-900 font-medium">
                    {analysisResult.recommended_action}
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">
                Optional: Edit Details
              </h3>
              <div className="space-y-4">
                <Input
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief title for the report"
                />
                <Textarea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add more details if needed"
                  rows={3}
                />
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
              </div>
            </Card>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                size="lg"
                fullWidth
                loading={submitting}
              >
                <CheckCircle2 className="h-5 w-5" /> Confirm & Submit Report
              </Button>
              <Button
                onClick={() => {
                  setStep("form");
                  setAnalysisResult(null);
                  setSelectedImage(null);
                  setTitle("");
                  setDescription("");
                }}
                size="lg"
                variant="outline"
              >
                <X className="h-5 w-5" /> Cancel
              </Button>
            </div>
          </div>
        )}

        {step === "result" && analysisResult && createdReportId && (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {t("problemDetected")}
                  </h3>
                  <p className="text-sm text-slate-600">
                    The AI has completed its analysis.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white rounded-xl p-3 border border-slate-200">
                  <div className="text-xs text-slate-500">Detected Problem</div>
                  <div className="text-sm font-bold text-slate-900 capitalize">
                    {analysisResult.final_problem_type}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-200">
                  <div className="text-xs text-slate-500">Confidence</div>
                  <div className="text-sm font-bold text-slate-900">
                    {Math.round(analysisResult.final_confidence * 100)}%
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-200">
                  <div className="text-xs text-slate-500">Root Cause</div>
                  <div className="text-sm font-bold text-slate-900">
                    {analysisResult.possible_causes[0]?.cause}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-200">
                  <div className="text-xs text-slate-500">
                    Recommended Action
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {analysisResult.recommended_action}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={() => navigate(`/reports/${createdReportId}`)}
                size="lg"
                fullWidth
              >
                <Eye className="h-5 w-5" /> {t("viewFullReport")}
              </Button>
              <Button
                onClick={() => {
                  setStep("form");
                  setAnalysisResult(null);
                  setCreatedReportId(null);
                  setTitle("");
                  setDescription("");
                  setSelectedImage(null);
                }}
                size="lg"
                variant="outline"
              >
                <Upload className="h-5 w-5" /> New Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
