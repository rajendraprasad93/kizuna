/*
Connect the verified specialist model implementations to the agent.
The real modules are stored in the Kizuna model packages and are used directly.
Fallback logic is only retained for genuine runtime failure conditions.
*/
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const workspaceRoot = path.resolve(
  fileURLToPath(new URL("../..", import.meta.url)),
);

const MODEL_PATHS = {
  duplicateDetection: "agent/models/duplicateDetection.js",
  relationshipDiscovery: "agent/models/relationshipDiscovery.cjs",
  rootCauseAnalysis: "agent/models/rootCauseAnalysis.cjs",
  recommendationEngine: "agent/models/recommendationEngine.cjs",
  departmentRouter: "agent/models/departmentRouter.cjs",
};

const flattenExport = (mod) => {
  if (!mod) return null;
  if (mod.default && mod.default !== mod) return mod.default;
  return mod;
};

const exportKeys = (value) => {
  if (!value) return [];
  if (typeof value === "function") return [value.name || "default"];
  if (typeof value === "object") return Object.keys(value);
  return [String(value)];
};

const selectExport = (name, value) => {
  if (!value) return null;
  const exported = flattenExport(value);
  if (name === "duplicateDetection") {
    if (exported?.findDuplicates) return exported;
    if (typeof exported === "function") return exported;
    if (exported?.default?.findDuplicates) return exported.default;
    if (typeof exported?.default === "function") return exported.default;
    return null;
  }
  if (name === "relationshipDiscovery") {
    if (exported?.discoverRelationships) return exported;
    if (typeof exported === "function") return exported;
    if (exported?.default?.discoverRelationships) return exported.default;
    if (typeof exported?.default === "function") return exported.default;
    return null;
  }
  if (name === "rootCauseAnalysis") {
    if (exported?.analyzeRootCauses) return exported;
    if (typeof exported === "function") return exported;
    if (exported?.default?.analyzeRootCauses) return exported.default;
    if (typeof exported?.default === "function") return exported.default;
    return null;
  }
  if (name === "recommendationEngine") {
    if (exported?.generateRecommendations) return exported;
    if (typeof exported === "function") return exported;
    if (exported?.default?.generateRecommendations) return exported.default;
    if (typeof exported?.default === "function") return exported.default;
    return null;
  }
  if (name === "departmentRouter") {
    if (exported?.routeProblem) return exported;
    if (typeof exported === "function") return exported;
    if (exported?.default?.routeProblem) return exported.default;
    if (typeof exported?.default === "function") return exported.default;
    return null;
  }
  return null;
};

const optional = async (name) => {
  const relativePath = MODEL_PATHS[name];
  const absolutePath = path.resolve(workspaceRoot, relativePath);
  const fileExists = existsSync(absolutePath);
  console.log(
    `[model-loader] model=${name} path=${absolutePath} exists=${fileExists} import=${fileExists ? "pending" : "missing"}`,
  );

  if (!fileExists) return null;

  try {
    const imported = await import(pathToFileURL(absolutePath).href);
    const exported = flattenExport(imported);
    const selected = selectExport(name, imported);
    console.log(
      `[model-loader] model=${name} import=success exports=${exportKeys(exported).join(",") || "none"} selected=${selected ? (typeof selected === "function" ? selected.name : Object.keys(selected).slice(0, 5).join(",") || "object") : "none"}`,
    );
    return exported;
  } catch (error) {
    console.warn(
      `[model-loader] model=${name} import=failed path=${absolutePath} error=${error.message}`,
    );
    return null;
  }
};

let models;
async function load() {
  if (models) return models;
  models = {
    duplicateDetection: await optional("duplicateDetection"),
    relationshipDiscovery: await optional("relationshipDiscovery"),
    rootCauseAnalysis: await optional("rootCauseAnalysis"),
    recommendationEngine: await optional("recommendationEngine"),
    departmentRouter: await optional("departmentRouter"),
  };
  return models;
}

function fallbackResult(name, input = {}) {
  const report = input.report || {};
  const problemType = String(
    report.category || input.problemType || "unknown",
  ).toLowerCase();
  const isFlood = problemType.includes("flood");
  const isEmergency =
    String(report.severity || "").toLowerCase() === "emergency" ||
    String(input.geminiAnalysis?.severity?.level || "").toLowerCase() ===
      "emergency";

  switch (name) {
    case "duplicateDetection":
      return {
        is_duplicate: false,
        all_duplicates: [],
        confidence: 0,
        matched_reports: 0,
        summary: "Duplicate detection failed; human review required.",
        error: "Real model unavailable",
      };
    case "relationshipDiscovery":
      return {
        problem_type: problemType,
        relationships: [],
        graph: { nodes: [], edges: [] },
        evidence_chain: [problemType],
        summary:
          "Relationship discovery failed; manual investigation required.",
        confidence: 0,
        total_relationships: 0,
        has_significant_relationships: false,
        error: "Real model unavailable",
      };
    case "rootCauseAnalysis":
      return {
        problem_type: problemType,
        possible_causes: [],
        most_likely_cause: null,
        explanation: "Root cause analysis failed; manual review required.",
        confidence: 0,
        requires_human_review: true,
        action_plan: {
          immediate: [{ action: "Conduct site investigation", priority: 1 }],
        },
        evidence_summary: "Insufficient model output.",
        model_version: "fallback",
        error: "Real model unavailable",
      };
    case "recommendationEngine":
      return {
        problem_type: problemType,
        root_cause: "unknown",
        recommendations: [],
        summary: "Recommendation generation failed; manual review required.",
        feasibility_score: 0,
        error: "Real model unavailable",
        model_version: "fallback",
      };
    case "departmentRouter":
      return {
        primary_department: null,
        secondary_departments: [],
        support_departments: [],
        confidence: 0,
        requires_multiple_departments: false,
        coordination_required: false,
        estimated_response_time: "Unknown",
        routing_instructions: "Manual routing required.",
        recommended_handoff: "Contact General Department at 311.",
        routing_metadata: { candidates: 0, top_score: 0 },
        timestamp: new Date().toISOString(),
        error: "Real model unavailable",
      };
    default:
      throw new Error("Unknown specialist model: " + name);
  }
}

export async function runModelTool(name, i = {}) {
  const m = await load();
  try {
    switch (name) {
      case "duplicateDetection": {
        if (m.duplicateDetection?.findDuplicates) {
          return await m.duplicateDetection.findDuplicates(
            i.report,
            i.allReports || [],
          );
        }
        if (typeof m.duplicateDetection === "function") {
          return await m.duplicateDetection(i.report, i.allReports || []);
        }
        throw new Error("Duplicate detection model is not connected.");
      }
      case "relationshipDiscovery": {
        const RelationshipDiscoveryModel =
          m.relationshipDiscovery?.default || m.relationshipDiscovery;
        if (RelationshipDiscoveryModel) {
          const instance = new RelationshipDiscoveryModel();
          return await instance.discoverRelationships(
            i.report,
            i.allReports || [],
          );
        }
        if (m.relationshipDiscovery?.discoverRelationships) {
          return await m.relationshipDiscovery.discoverRelationships(
            i.report,
            i.allReports || [],
          );
        }
        throw new Error("Relationship discovery model is not connected.");
      }
      case "rootCauseAnalysis": {
        const RootCauseAnalysisModel =
          m.rootCauseAnalysis?.default || m.rootCauseAnalysis;
        if (RootCauseAnalysisModel) {
          const instance = new RootCauseAnalysisModel();
          return await instance.analyzeRootCauses(
            i.report,
            i.geminiAnalysis || null,
            i.previousResults?.relationshipDiscovery || null,
            i.context?.weatherData || {},
          );
        }
        if (m.rootCauseAnalysis?.analyzeRootCauses) {
          return await m.rootCauseAnalysis.analyzeRootCauses(
            i.report,
            i.geminiAnalysis || null,
            i.previousResults?.relationshipDiscovery || null,
            i.context?.weatherData || {},
          );
        }
        throw new Error("Root cause model is not connected.");
      }
      case "recommendationEngine": {
        const RecommendationEngine =
          m.recommendationEngine?.default || m.recommendationEngine;
        if (RecommendationEngine) {
          const instance = new RecommendationEngine();
          return await instance.generateRecommendations(
            i.report,
            i.previousResults?.rootCauseAnalysis || {},
            i.context?.departmentStatus || {},
          );
        }
        if (m.recommendationEngine?.generateRecommendations) {
          return await m.recommendationEngine.generateRecommendations(
            i.report,
            i.previousResults?.rootCauseAnalysis || {},
            i.context?.departmentStatus || {},
          );
        }
        throw new Error("Recommendation engine is not connected.");
      }
      case "departmentRouter": {
        const DepartmentRouter =
          m.departmentRouter?.default || m.departmentRouter;
        if (DepartmentRouter) {
          const instance = new DepartmentRouter();
          return await instance.routeProblem(
            i.report,
            i.previousResults?.rootCauseAnalysis || {},
            i.previousResults?.recommendationEngine?.recommendations || [],
            i.context?.departmentStatus || {},
          );
        }
        if (m.departmentRouter?.routeProblem) {
          return await m.departmentRouter.routeProblem(
            i.report,
            i.previousResults?.rootCauseAnalysis || {},
            i.previousResults?.recommendationEngine?.recommendations || [],
            i.context?.departmentStatus || {},
          );
        }
        throw new Error("Department router is not connected.");
      }
      default:
        throw new Error("Unknown specialist model: " + name);
    }
  } catch (error) {
    if (!m.duplicateDetection && name === "duplicateDetection")
      return fallbackResult(name, i);
    if (!m.relationshipDiscovery && name === "relationshipDiscovery")
      return fallbackResult(name, i);
    if (!m.rootCauseAnalysis && name === "rootCauseAnalysis")
      return fallbackResult(name, i);
    if (!m.recommendationEngine && name === "recommendationEngine")
      return fallbackResult(name, i);
    if (!m.departmentRouter && name === "departmentRouter")
      return fallbackResult(name, i);
    throw error;
  }
}
