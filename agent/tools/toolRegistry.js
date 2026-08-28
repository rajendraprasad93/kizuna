import { runModelTool } from "./modelAdapters.js";
import { clamp01 } from "../utils.js";

const tools = {
  duplicateDetection: {
    name: "duplicateDetection",
    description: "Find duplicate physical incidents.",
    cost: 1,
    parallelSafe: true,
    prerequisites: [],
    execution: async (input) => runModelTool("duplicateDetection", input),
  },
  relationshipDiscovery: {
    name: "relationshipDiscovery",
    description: "Discover causal and contextual relationships.",
    cost: 2,
    parallelSafe: true,
    prerequisites: [],
    execution: async (input) => runModelTool("relationshipDiscovery", input),
  },
  rootCauseAnalysis: {
    name: "rootCauseAnalysis",
    description: "Estimate the underlying cause.",
    cost: 3,
    parallelSafe: false,
    prerequisites: ["relationshipDiscovery"],
    execution: async (input) => runModelTool("rootCauseAnalysis", input),
  },
  recommendationEngine: {
    name: "recommendationEngine",
    description: "Generate feasible corrective actions.",
    cost: 2,
    parallelSafe: false,
    prerequisites: ["rootCauseAnalysis"],
    execution: async (input) => runModelTool("recommendationEngine", input),
  },
  departmentRouter: {
    name: "departmentRouter",
    description: "Select the responsible department.",
    cost: 1,
    parallelSafe: false,
    prerequisites: [],
    execution: async (input) => runModelTool("departmentRouter", input),
  },
};
export const getTool = (n) => tools[n];
export const listTools = () =>
  Object.entries(tools).map(([name, x]) => ({ name, ...x }));
export function normalizeToolResult(name, r) {
  r = r || {};
  const confidence = clamp01(
    r.confidence ??
      r.feasibility_score ??
      r.primary_department?.confidence ??
      r.most_likely_cause?.confidence,
    0.5,
  );
  const evidence = [];
  if (name === "duplicateDetection")
    evidence.push(
      r.is_duplicate ? "Duplicate detected." : "No strong duplicate detected.",
    );
  if (name === "relationshipDiscovery" && r.chain?.length)
    evidence.push(r.chain.join(" -> "));
  if (name === "rootCauseAnalysis" && r.most_likely_cause?.cause)
    evidence.push(r.most_likely_cause.cause);
  if (name === "recommendationEngine" && r.recommendations?.length)
    evidence.push(`${r.recommendations.length} recommendation(s).`);
  if (name === "departmentRouter" && r.primary_department?.name)
    evidence.push(r.primary_department.name);
  return { tool: name, confidence, evidence, raw: r };
}
