import { config as defaultConfig } from "./config.js";
import { query } from "../server/db.js";
import { clamp01, unique } from "./utils.js";
import {
  getTool,
  listTools,
  normalizeToolResult,
} from "./tools/toolRegistry.js";

const KNOWN = new Set([
  "flooding",
  "pothole",
  "garbage",
  "road_damage",
  "streetlight_outage",
  "electrical_hazard",
  "tree_fall",
  "water_leak",
  "blocked_drain",
  "sanitation_issue",
]);

export class AgenticAI {
  constructor(options = {}) {
    this.config = options.config || defaultConfig.agent;
    this.stats = { totalRuns: 0, totalErrors: 0 };
    this.decisions = [];
  }
  async processReport(
    report,
    geminiAnalysis = null,
    allReports = [],
    context = {},
  ) {
    const started = Date.now(),
      run = await this.startRun(report, {
        report,
        geminiAnalysis,
        allReports,
        context,
      });
    this.stats.totalRuns++;
    try {
      const assessment = this.assessProblem(report, geminiAnalysis, context);
      
      // Create a report copy with category field for compatibility with models
      const reportWithCategory = {
        ...report,
        category: assessment.problemType // Add mapped category name
      };
      
      // DEBUG LOGGING
      console.log('=== DEBUG REPORT WITH CATEGORY ===');
      console.log('Original report:', JSON.stringify(report, null, 2));
      console.log('Assessment problemType:', assessment.problemType);
      console.log('reportWithCategory:', JSON.stringify(reportWithCategory, null, 2));
      
      const results = {},
        trace = [],
        errors = [],
        used = new Set();
      let iteration = 0,
        decision = null;
      while (iteration < this.config.maxIterations) {
        iteration++;
        const state = this.evaluateState(assessment, results, errors);
        if (state.shouldStop) {
          decision = this.makeDecision(assessment, results, state);
          break;
        }
        const candidates = this.selectNextTools(
          assessment,
          results,
          used,
          state,
        );
        if (!candidates.length) {
          decision = this.makeDecision(assessment, results, {
            ...state,
            forcedHumanReview: true,
            stopReason: "No useful remaining tool",
          });
          break;
        }
        const batch = this.chooseBatch(candidates, results);
        const executions = await Promise.all(
          batch.map((candidate) => {
            // DEBUG LOGGING
            console.log(`=== DEBUG EXECUTING TOOL ${candidate.name} ===`);
            console.log('Tool will receive reportWithCategory.category:', reportWithCategory.category);
            
            return this.executeTool(candidate.name, {
              report: reportWithCategory, // Use report with category field
              geminiAnalysis,
              allReports,
              context,
              previousResults: results,
              iteration,
              assessment,
              problemType: assessment.problemType,
            });
          })
        );
        for (const e of executions) {
          used.add(e.toolName);
          if (e.error) {
            errors.push({ tool: e.toolName, iteration, error: e.error });
          } else results[e.toolName] = e.normalized.raw;
          trace.push(e);
          await this.saveStep(run?.id, {
            iteration,
            toolName: e.toolName,
            reason: e.reason,
            status: e.error ? "failed" : "completed",
            confidence: e.normalized?.confidence || 0,
            durationMs: e.durationMs,
            input: { reportId: report.id },
            output: e.normalized?.raw || null,
            error: e.error || null,
          });
        }
      }
      if (!decision) {
        const state = this.evaluateState(assessment, results, errors);
        decision = this.makeDecision(assessment, results, {
          ...state,
          forcedHumanReview: true,
          stopReason: "Maximum iterations reached",
        });
      }
      const response = {
        report_id: report.id,
        status: "completed",
        timestamp: new Date().toISOString(),
        processing_time_ms: Date.now() - started,
        assessment,
        decision,
        insights: this.summarize(assessment, results, errors, decision),
        actions: {
          primary_department: decision.primaryDepartment,
          secondary_departments: decision.secondaryDepartments,
          recommended_actions: decision.recommendedActions,
          timeline: decision.timeline,
        },
        execution: {
          iterations: iteration,
          tools_used: [...used],
          steps_completed: trace.filter((x) => !x.error).length,
          errors,
          trace,
        },
        human_review_required: decision.requiresHumanReview,
        human_review_reason: decision.humanReviewReason,
      };
      await this.finishRun(run?.id, response, decision);
      this.decisions.push({
        reportId: report.id,
        timestamp: response.timestamp,
        action: decision.action,
        confidence: decision.confidence,
        requiresHumanReview: decision.requiresHumanReview,
      });
      if (this.decisions.length > 1000) this.decisions.shift();
      return response;
    } catch (error) {
      this.stats.totalErrors++;
      const response = this.errorResponse(report, error, started);
      await this.finishRun(run?.id, response, {
        action: "human_review_required",
        confidence: 0,
        requiresHumanReview: true,
      });
      return response;
    }
  }
  assessProblem(report, g, context) {
    // Map category_id to category name
    const CATEGORY_MAP = {
      "9e074cac-6ebb-4a4d-a425-5183aff24b66": "flooding",
      "ab626bfb-64a0-471b-b5e6-e0fac49c3366": "pothole", 
      "f1ff7e18-1402-403c-80d8-905a272d5496": "garbage"
    };
    
    const categoryName = report?.category_id ? CATEGORY_MAP[report.category_id] : null;
    const problemType =
      g?.problem_type?.primary || categoryName || report?.category || "unknown";
    let confidence = clamp01(
      g?.problem_type?.confidence ?? report?.ai_confidence,
      0.5,
    );
    const severity = g?.severity?.level || report?.severity || "medium";
    let urgency = "medium",
      riskLevel = "medium";
    if (severity === "emergency") {
      urgency = "immediate";
      riskLevel = "critical";
    } else if (severity === "high") {
      urgency = "high";
      riskLevel = "high";
    } else if (severity === "low") {
      urgency = "low";
      riskLevel = "low";
    }
    const conditions = g?.visible_conditions || [];
    if (!KNOWN.has(problemType)) confidence *= 0.8;
    if (this.hasConflictingEvidence(g)) confidence *= 0.7;
    if (
      context.historicalPattern?.confidence > 0.7 &&
      context.historicalPattern?.frequency > 5
    )
      confidence = Math.min(1, confidence + 0.1);
    return {
      problemType,
      severity,
      urgency,
      riskLevel,
      complexity:
        conditions.length > 3
          ? "complex"
          : conditions.length > 1
            ? "moderate"
            : "simple",
      confidence: clamp01(confidence, 0.5),
      knownProblem: KNOWN.has(problemType),
      requiresImmediateAction: urgency === "immediate",
    };
  }
  selectNextTools(a, r, used, state) {
    const c = [],
      add = (name, reason, score) => {
        if (used.has(name)) return;
        const t = getTool(name);
        if (!t) return;
        if (t.prerequisites.some((p) => !r[p])) return;
        c.push({ name, reason, score });
      };
    if (!r.duplicateDetection)
      add(
        "duplicateDetection",
        "Check whether this is an existing incident.",
        10,
      );
    if (
      !r.relationshipDiscovery &&
      (a.complexity !== "simple" ||
        a.urgency === "high" ||
        ["flooding", "road_damage", "pothole"].includes(a.problemType))
    )
      add("relationshipDiscovery", "Gather contextual and causal evidence.", 9);
    if (
      !r.rootCauseAnalysis &&
      (r.relationshipDiscovery ||
        a.confidence >= this.config.thresholds.low ||
        a.complexity !== "simple")
    )
      add("rootCauseAnalysis", "Estimate the underlying cause.", 8);
    if (!r.recommendationEngine && r.rootCauseAnalysis)
      add(
        "recommendationEngine",
        "Turn evidence into an actionable intervention.",
        7,
      );
    if (!r.departmentRouter)
      add(
        "departmentRouter",
        "Determine response ownership.",
        a.urgency === "immediate" ? 10 : 6,
      );
    if (state.conflict && !r.relationshipDiscovery)
      add("relationshipDiscovery", "Resolve conflicting evidence.", 11);
    return c.sort((x, y) => y.score - x.score);
  }
  chooseBatch(c, r) {
    if (!c[0]) return [];
    const out = [c[0]];
    for (const x of c.slice(1)) {
      const t = getTool(x.name);
      if (t.parallelSafe && !t.prerequisites.some((p) => !r[p])) out.push(x);
    }
    return out;
  }
  async executeTool(name, input) {
    const started = Date.now(),
      tool = getTool(name);
    try {
      const raw = await import("./tools/modelAdapters.js").then((m) =>
        m.runModelTool(name, input),
      );
      return {
        toolName: name,
        reason: this.reason(name),
        normalized: normalizeToolResult(name, raw),
        durationMs: Date.now() - started,
        error: null,
      };
    } catch (error) {
      return {
        toolName: name,
        reason: this.reason(name),
        normalized: { tool: name, confidence: 0, evidence: [], raw: null },
        durationMs: Date.now() - started,
        error: error.message,
      };
    }
  }
  reason(n) {
    return (
      {
        duplicateDetection: "Check duplicate incident.",
        relationshipDiscovery: "Find relationships.",
        rootCauseAnalysis: "Find underlying cause.",
        recommendationEngine: "Generate corrective action.",
        departmentRouter: "Route the case.",
      }[n] || "Gather evidence."
    );
  }
  evaluateState(a, r, errors) {
    const root =
      r.rootCauseAnalysis?.most_likely_cause?.confidence ??
      r.rootCauseAnalysis?.confidence;
    const route =
      r.departmentRouter?.primary_department?.confidence ??
      r.departmentRouter?.confidence;
    const rec =
      r.recommendationEngine?.feasibility_score ??
      r.recommendationEngine?.confidence;
    const conflict = this.detectConflict(r);
    const confidence = this.calculateDecisionConfidence(
      a,
      root,
      route,
      rec,
      conflict,
    );
    const criticalFailure = errors.some((e) =>
      ["rootCauseAnalysis", "departmentRouter"].includes(e.tool),
    );
    const core =
      !!r.rootCauseAnalysis && !!r.recommendationEngine && !!r.departmentRouter;
    const enough =
      confidence >= this.config.thresholds.high &&
      core &&
      !conflict &&
      !criticalFailure;
    const shouldStop =
      enough ||
      (core && confidence >= this.config.thresholds.medium && !conflict) ||
      a.urgency === "immediate";
    return {
      decisionConfidence: confidence,
      conflict,
      criticalFailure,
      hasCoreDecision: core,
      shouldStop,
      stopReason: shouldStop ? "Sufficient evidence" : "More evidence required",
    };
  }
  calculateDecisionConfidence(a, root, route, rec, conflict) {
    const pairs = [
      [a.confidence, 0.25],
      [root, 0.35],
      [route, 0.15],
      [rec, 0.25],
    ].filter((x) => Number.isFinite(Number(x[0])));
    if (!pairs.length) return 0.3;
    const w = pairs.reduce((s, x) => s + x[1], 0),
      score = pairs.reduce((s, x) => s + Number(x[0]) * x[1], 0) / w;
    return clamp01(conflict ? score * 0.65 : score, 0.3);
  }
  detectConflict(r) {
    const root = r.rootCauseAnalysis?.most_likely_cause,
      alt = r.rootCauseAnalysis?.alternative_causes?.[0];
    return !!(
      root &&
      alt &&
      Number(root.confidence) < 0.55 &&
      Number(alt.confidence) > Number(root.confidence) + 0.15
    );
  }
  makeDecision(a, r, state) {
    const reasoning = [],
      hr = [];
    if (a.urgency === "immediate") {
      reasoning.push("Emergency-level urgency detected.");
      hr.push("Emergency situation requires human oversight.");
    }
    if (r.duplicateDetection?.is_duplicate)
      reasoning.push(
        `${r.duplicateDetection.all_duplicates?.length ?? r.duplicateDetection.matched_reports ?? 0} related report(s) detected.`,
      );
    const root = r.rootCauseAnalysis?.most_likely_cause;
    if (root?.cause)
      reasoning.push(
        `Leading root cause: ${root.cause} (${Math.round(Number(root.confidence || 0) * 100)}%).`,
      );
    const route = r.departmentRouter?.primary_department;
    if (route?.name) reasoning.push(`Primary owner: ${route.name}.`);
    const recs =
      r.recommendationEngine?.recommendations ||
      r.recommendationEngine?.actions ||
      [];
    const actions = recs
      .slice(0, 3)
      .map((x) => x.title || x.action || x.name)
      .filter(Boolean);
    let action = "human_review_required",
      timeline = "review",
      human = true;

    if (a.urgency === "immediate") {
      action = "emergency_response";
      timeline = "immediate";
      human = true;
      hr.push(
        "Emergency response requires human oversight even when evidence is otherwise strong.",
      );
    } else if (state.conflict) {
      action = "human_review_required";
      timeline = "review";
      human = true;
      hr.push("Conflicting evidence detected.");
    } else if (state.criticalFailure) {
      action = "human_review_required";
      timeline = "review";
      human = true;
      hr.push("A critical specialist model failed during analysis.");
    } else if (state.forcedHumanReview) {
      action = "human_review_required";
      timeline = "review";
      human = true;
      if (state.stopReason === "Maximum iterations reached") {
        hr.push("Analysis reached maximum iterations without reaching high confidence.");
      } else if (state.stopReason === "No useful remaining tool") {
        hr.push("No additional specialist tools available to improve analysis.");
      } else {
        hr.push("Analysis was stopped for review.");
      }
    } else if (!state.hasCoreDecision) {
      action = "human_review_required";
      timeline = "review";
      human = true;
      hr.push("Required decision evidence is incomplete.");
    } else if (!a.knownProblem) {
      action = "semi_autonomous";
      timeline = "review";
      human = true;
      hr.push("New or unknown problem type.");
    } else if (state.decisionConfidence >= this.config.thresholds.high) {
      action = "autonomous_processing";
      timeline = "standard";
      human = false;
    } else if (state.decisionConfidence >= this.config.thresholds.medium) {
      action = "semi_autonomous";
      timeline = "review";
      human = true;
      hr.push(
        "Evidence supports a recommendation but not autonomous execution.",
      );
    } else {
      action = "human_review_required";
      timeline = "review";
      human = true;
      hr.push(`AI confidence (${(state.decisionConfidence * 100).toFixed(1)}%) is below the autonomous threshold (${(this.config.thresholds.high * 100).toFixed(0)}%).`);
    }

    if (state.decisionConfidence < this.config.thresholds.low) {
      action = "human_review_required";
      human = true;
      hr.push(`AI confidence (${(state.decisionConfidence * 100).toFixed(1)}%) is below the acceptable review threshold (${(this.config.thresholds.low * 100).toFixed(0)}%).`);
    }
    if (!route?.name && a.urgency !== "immediate") {
      human = true;
      hr.push("Department routing remains uncertain.");
    }

    return {
      action,
      confidence: clamp01(state.decisionConfidence, 0.3),
      requiresHumanReview: human,
      timeline,
      primaryDepartment: route?.name || null,
      primaryDepartmentId: route?.id || null,
      secondaryDepartments: r.departmentRouter?.secondary_departments || [],
      recommendedActions: actions,
      reasoning: unique(reasoning),
      humanReviewReason: human
        ? unique(hr).join("; ") || "Human review recommended."
        : "",
    };
  }
  summarize(a, r, errors, d) {
    const f = [];
    if (r.duplicateDetection?.is_duplicate)
      f.push(
        `Duplicate: ${r.duplicateDetection.all_duplicates?.length ?? r.duplicateDetection.matched_reports ?? 0} similar report(s).`,
      );
    if (r.relationshipDiscovery?.chain?.length)
      f.push(
        `Relationship chain: ${r.relationshipDiscovery.chain.join(" → ")}.`,
      );
    if (r.rootCauseAnalysis?.most_likely_cause)
      f.push(`Root cause: ${r.rootCauseAnalysis.most_likely_cause.cause}.`);
    if (r.departmentRouter?.primary_department)
      f.push(`Department: ${r.departmentRouter.primary_department.name}.`);
    return {
      summary: `Agent analyzed ${a.problemType} using ${Object.keys(r).length} specialist model(s).`,
      key_findings: f,
      warnings: errors.map((e) => `${e.tool}: ${e.error}`),
      next_steps: d.recommendedActions,
    };
  }
  hasConflictingEvidence(g) {
    if (!g) return false;
    const c = g.visible_conditions || [],
      t = String(g.problem_type?.primary || "").toLowerCase();
    return (
      t === "flooding" &&
      !c.some((x) => /water|flood/i.test(String(x.condition || "")))
    );
  }
  async startRun(report, request) {
    const x = await query(
      `INSERT INTO agent_runs(report_id,status,problem_type,request_json) VALUES($1,'running',$2,$3) RETURNING id`,
      [report.id, report.category || null, JSON.stringify(request)],
    );
    return { id: x.rows[0]?.id || null };
  }
  async saveStep(id, s) {
    if (!id) return;
    await query(
      `INSERT INTO agent_steps(run_id,iteration,tool_name,reason,status,confidence,duration_ms,input_json,output_json,error_text) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        id,
        s.iteration,
        s.toolName,
        s.reason,
        s.status,
        s.confidence,
        s.durationMs,
        JSON.stringify(s.input || {}),
        JSON.stringify(s.output || null),
        s.error || null,
      ],
    );
  }
  async finishRun(id, response, d) {
    if (!id) return;
    await query(
      `UPDATE agent_runs SET completed_at=NOW(),status=$2,final_confidence=$3,requires_human_review=$4,final_action=$5,execution_time_ms=$6,response_json=$7 WHERE id=$1`,
      [
        id,
        response.status,
        d.confidence,
        d.requiresHumanReview,
        d.action,
        response.processing_time_ms,
        JSON.stringify(response),
      ],
    );
    await query(
      `INSERT INTO agent_decisions(run_id,report_id,action,confidence,requires_human_review,reasoning,decision_json) VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [
        id,
        response.report_id,
        d.action,
        d.confidence,
        d.requiresHumanReview,
        JSON.stringify(d.reasoning || []),
        JSON.stringify(d),
      ],
    );
  }
  async provideFeedback(reportId, f) {
    const x = await query(
      `INSERT INTO agent_feedback(report_id,is_correct,corrected_problem_type,corrected_root_cause,corrected_department,notes,feedback_json) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [
        reportId,
        f.isCorrect === true,
        f.correctedProblemType || null,
        f.correctedRootCause || null,
        f.correctedDepartment || null,
        f.notes || null,
        JSON.stringify(f),
      ],
    );
    return { success: true, feedback_id: x.rows[0]?.id || null };
  }
  getStatus() {
    return {
      active: true,
      totalRuns: this.stats.totalRuns,
      totalErrors: this.stats.totalErrors,
      inMemoryDecisionCount: this.decisions.length,
      availableTools: listTools(),
      thresholds: this.config.thresholds,
      maxIterations: this.config.maxIterations,
    };
  }
  getDecisionHistory(limit = 10) {
    return this.decisions.slice(
      -Math.max(1, Math.min(Number(limit) || 10, 100)),
    );
  }
  errorResponse(report, e, started) {
    return {
      report_id: report?.id || "unknown",
      status: "failed",
      timestamp: new Date().toISOString(),
      processing_time_ms: Date.now() - started,
      decision: {
        action: "human_review_required",
        confidence: 0,
        requiresHumanReview: true,
        timeline: "review",
        reasoning: ["Agent failed safely."],
      },
      insights: {
        summary: "Automated processing failed.",
        key_findings: [],
        warnings: [e.message],
        next_steps: ["Manual investigation required."],
      },
      actions: {
        primary_department: null,
        secondary_departments: [],
        recommended_actions: ["Manual investigation required"],
        timeline: "review",
      },
      execution: {
        iterations: 0,
        tools_used: [],
        steps_completed: 0,
        errors: [e.message],
      },
      human_review_required: true,
      human_review_reason: "Agentic AI encountered an error.",
    };
  }
}
export default new AgenticAI();
