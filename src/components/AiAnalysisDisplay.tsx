import { Brain, Eye, FileText, ShieldCheck, GitBranch, Target, Network, TrendingUp, AlertTriangle, CheckCircle2, Clock, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { AiAnalysis } from '@/types';

interface AiAnalysisDisplayProps {
  analysis: AiAnalysis;
  compact?: boolean;
}

function ConfidenceBar({ value, color = 'blue' }: { value: number; color?: string }) {
  const pct = Math.round(value * 100);
  const colors: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${colors[color] || colors.blue} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono font-semibold text-slate-600 w-9 text-right">{pct}%</span>
    </div>
  );
}

export function AiAnalysisDisplay({ analysis, compact }: AiAnalysisDisplayProps) {
  return (
    <div className="space-y-4">
      {/* AI Pipeline Header */}
      <Card className="p-5 bg-gradient-to-br from-slate-50 to-white border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">AI Analysis</h3>
              <p className="text-xs text-slate-500">Processed in {analysis.processing_time_ms}ms</p>
            </div>
          </div>
          {analysis.is_authentic !== null && (
            <Badge color={analysis.is_authentic ? 'green' : 'red'}>
              <ShieldCheck className="h-3 w-3" />
              {analysis.is_authentic ? 'Authentic' : 'Flagged'}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-slate-600">Vision AI</span>
            </div>
            <ConfidenceBar value={analysis.problem_confidence || 0} color="blue" />
          </div>
          <div className="bg-white rounded-xl p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-cyan-500" />
              <span className="text-xs font-medium text-slate-600">NLP Analysis</span>
            </div>
            <ConfidenceBar value={analysis.text_confidence || 0} color="blue" />
          </div>
        </div>

        <div className="mt-3 bg-white rounded-xl p-3 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600">Final Confidence</span>
            <span className="text-sm font-bold text-slate-900">{Math.round((analysis.final_confidence || 0) * 100)}%</span>
          </div>
          <ConfidenceBar value={analysis.final_confidence || 0} color="green" />
        </div>
      </Card>

      {!compact && (
        <>
          {/* Detected Problem */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Detected Problem</h3>
            </div>
            <div className="text-lg font-bold text-slate-900 capitalize mb-2">{analysis.final_problem_type || analysis.detected_problem}</div>
            {analysis.visible_conditions && analysis.visible_conditions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {analysis.visible_conditions.map((c) => (
                  <Badge key={c} color="blue">{c.replace(/_/g, ' ')}</Badge>
                ))}
              </div>
            )}
          </Card>

          {/* Verification */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Verification & Authenticity</h3>
            </div>
            <div className="mb-3">
              <ConfidenceBar value={analysis.authenticity_score || 0} color="green" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(analysis.verification_details).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  {val ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                  <span className="text-slate-600 capitalize">{key.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Root Causes */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <GitBranch className="h-4 w-4 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Possible Root Causes</h3>
            </div>
            <div className="space-y-3">
              {analysis.possible_causes.map((cause, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">#{i + 1}</span>
                      <span className="text-sm font-semibold text-slate-900">{cause.cause}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge color={cause.severity === 'high' ? 'red' : cause.severity === 'medium' ? 'amber' : 'slate'}>
                        {cause.severity}
                      </Badge>
                      <Badge color={cause.urgency === 'immediate' ? 'red' : 'slate'}>
                        <Clock className="h-3 w-3" /> {cause.urgency.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <ConfidenceBar value={cause.confidence} color="amber" />
                  <ul className="mt-2 space-y-1">
                    {cause.evidence.map((e, j) => (
                      <li key={j} className="text-xs text-slate-500 flex items-start gap-1.5">
                        <span className="text-slate-300 mt-0.5">•</span> {e}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Recommended Interventions</h3>
            </div>
            <div className="space-y-3">
              {analysis.alternative_actions.map((action, i) => (
                <div key={i} className={`rounded-xl p-3 border ${i === 0 ? 'bg-brand-50 border-brand-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-brand-600" />
                      <span className="text-sm font-semibold text-slate-900">{action.action}</span>
                    </div>
                    <Badge color={i === 0 ? 'blue' : 'slate'}>Priority {action.priority}</Badge>
                  </div>
                  <ConfidenceBar value={action.confidence} color="purple" />
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {action.estimated_duration_hours}h</span>
                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {action.expected_impact}</span>
                    <span className="flex items-center gap-1"><Network className="h-3 w-3" /> {action.department}</span>
                  </div>
                  {action.steps.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {action.steps.map((s, j) => (
                        <span key={j} className="text-xs bg-white text-slate-600 rounded-md px-2 py-0.5 border border-slate-200">{j + 1}. {s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Relationship Graph */}
          {analysis.relationship_graph && analysis.relationship_graph.nodes && analysis.relationship_graph.nodes.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                  <Network className="h-4 w-4 text-teal-600" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">Problem Relationship Graph</h3>
              </div>
              <RelationshipGraphView graph={analysis.relationship_graph} />
              <div className="mt-3 text-xs text-slate-500 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" />
                {analysis.related_incident_count} related incidents found in this area
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function RelationshipGraphView({ graph }: { graph: { nodes: { id: string; label: string }[]; edges: { from: string; to: string; label: string; weight: number }[] } }) {
  const positions: Record<string, { x: number; y: number }> = {};
  const nodeCount = graph.nodes.length;
  graph.nodes.forEach((node, i) => {
    const angle = (i / nodeCount) * 2 * Math.PI - Math.PI / 2;
    positions[node.id] = {
      x: 50 + 30 * Math.cos(angle),
      y: 50 + 30 * Math.sin(angle),
    };
  });

  const edgeColors: Record<string, string> = {
    causes: '#ef4444',
    contributes_to: '#f59e0b',
    occurs_with: '#3b82f6',
    is_remedied_by: '#10b981',
  };

  return (
    <div className="relative w-full h-48 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
        {graph.edges.map((edge, i) => {
          const from = positions[edge.from];
          const to = positions[edge.to];
          if (!from || !to) return null;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          const color = edgeColors[edge.label] || '#94a3b8';
          return (
            <g key={i}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={0.5 + edge.weight * 0.8} opacity={0.6} />
              <text x={mx} y={my - 1} textAnchor="middle" fontSize="2.5" fill={color} className="font-medium">{edge.label.replace(/_/g, ' ')}</text>
              <text x={mx} y={my + 2.5} textAnchor="middle" fontSize="2" fill="#94a3b8">{Math.round(edge.weight * 100)}%</text>
            </g>
          );
        })}
        {graph.nodes.map((node) => {
          const pos = positions[node.id];
          if (!pos) return null;
          return (
            <g key={node.id}>
              <circle cx={pos.x} cy={pos.y} r="6" fill="white" stroke="#cbd5e1" strokeWidth="0.5" />
              <text x={pos.x} y={pos.y + 1.5} textAnchor="middle" fontSize="3" fill="#1e293b" className="font-semibold">{node.label.split(' ')[0]}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
