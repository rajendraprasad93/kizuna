class RootCauseAnalysisModel {
  constructor() {
    this.templates = {
      flooding: [
        [
          "flooding_1",
          "Blocked Drainage System",
          "structural",
          "high",
          0.7,
          [
            "standing_water",
            "blocked_drain",
            "slow_drainage",
            "water_accumulation",
            "drainage_complaints",
          ],
          "Inspect and clean drainage system",
        ],
        [
          "flooding_2",
          "Inadequate Drainage Capacity",
          "structural",
          "medium",
          0.55,
          [
            "heavy_rainfall",
            "water_depth_high",
            "historical_flooding",
            "urban_development",
            "aged_infrastructure",
          ],
          "Assess drainage capacity and plan infrastructure upgrade",
        ],
        [
          "flooding_3",
          "Heavy Rainfall Exceeding Capacity",
          "environmental",
          "medium",
          0.5,
          ["heavy_rainfall", "extreme_weather", "flood_warnings"],
          "Apply flood mitigation measures and inspect vulnerable locations",
        ],
        [
          "flooding_4",
          "Garbage Blocking Drainage",
          "human",
          "high",
          0.6,
          [
            "garbage_accumulation",
            "blocked_drain",
            "waste_in_drain",
            "sanitation_issues",
          ],
          "Clean drainage and improve waste collection",
        ],
      ],
      pothole: [
        [
          "pothole_1",
          "Water Damage to Asphalt",
          "environmental",
          "high",
          0.7,
          [
            "standing_water",
            "cracked_surface",
            "water_penetration",
            "poor_drainage",
          ],
          "Repair road surface and improve drainage",
        ],
        [
          "pothole_2",
          "Heavy Traffic Load",
          "human",
          "medium",
          0.55,
          [
            "high_traffic_area",
            "heavy_vehicles",
            "road_wear",
            "frequent_use",
            "commercial_vehicles",
          ],
          "Inspect road base and consider traffic/load management",
        ],
        [
          "pothole_3",
          "Poor Construction Quality",
          "structural",
          "medium",
          0.45,
          [
            "thin_asphalt",
            "poor_base",
            "recent_construction",
            "premature_failure",
          ],
          "Conduct a construction quality audit",
        ],
      ],
      garbage: [
        [
          "garbage_1",
          "Inadequate Waste Collection",
          "human",
          "high",
          0.7,
          [
            "overflowing_bins",
            "collection_day_passed",
            "high_population",
            "irregular_collection",
          ],
          "Increase collection frequency or capacity",
        ],
        [
          "garbage_2",
          "Illegal Dumping",
          "human",
          "medium",
          0.5,
          ["scattered_waste", "non_bin_area", "hidden_location", "remote_area"],
          "Inspect dumping pattern and strengthen enforcement",
        ],
        [
          "garbage_3",
          "Insufficient Waste Processing Capacity",
          "structural",
          "medium",
          0.45,
          [
            "overflowing_landfill",
            "processing_delays",
            "capacity_issues",
            "recycling_shortage",
          ],
          "Assess waste-processing capacity",
        ],
      ],
      road_damage: [
        [
          "road_1",
          "Poor Drainage System",
          "structural",
          "high",
          0.65,
          [
            "water_logging",
            "damaged_drainage",
            "road_erosion",
            "flooding_history",
          ],
          "Inspect drainage and repair damaged road sections",
        ],
        [
          "road_2",
          "Excessive Heavy Vehicle Traffic",
          "human",
          "medium",
          0.5,
          ["truck_routes", "commercial_zone", "heavy_loads", "industrial_area"],
          "Assess heavy-vehicle load and traffic management",
        ],
      ],
    };
  }

  async analyzeRootCauses(
    report,
    aiAnalysis = null,
    relationshipData = null,
    context = {},
  ) {
    const type = String(report?.category || "unknown")
      .toLowerCase()
      .trim();
    const templates = this.templates[type] || [];
    if (!templates.length) return this.fallback(type);

    const evidenceSources = {
      ai: JSON.stringify(aiAnalysis || {}).toLowerCase(),
      relationships: (relationshipData?.relationships || []).map(
        (relationship) => ({
          value: JSON.stringify(relationship).toLowerCase(),
          label: `${relationship.source} -> ${relationship.target}`,
        }),
      ),
      context: JSON.stringify(context || {}).toLowerCase(),
    };
    const causes = templates
      .map((t) => this.analyzeCause(t, evidenceSources))
      .sort((a, b) => b.confidence - a.confidence);
    const top = causes[0];
    const overall = this.overall(causes);

    return {
      problem_type: type,
      possible_causes: causes,
      most_likely_cause: top,
      explanation: `Most supported hypothesis for ${type}: ${top.cause} (${Math.round(top.confidence * 100)}%).`,
      confidence: overall,
      requires_human_review: this.needsReview(causes),
      action_plan: {
        immediate:
          top.urgency === "high" || top.confidence >= 0.7
            ? [
                {
                  action: top.recommended_action,
                  priority: 1,
                  resources_needed: top.resources,
                },
              ]
            : [],
        short_term:
          causes[1] && causes[1].confidence >= 0.45
            ? [{ action: causes[1].recommended_action, priority: 2 }]
            : [],
        long_term:
          causes[2] && causes[2].confidence >= 0.4
            ? [{ action: causes[2].recommended_action, priority: 3 }]
            : [],
      },
      evidence_summary: top.evidence.join("; ") || "Limited evidence.",
      model_version: "3.0.0",
    };
  }

  analyzeCause(t, evidenceSources, relationshipData, context) {
    const [id, cause, category, urgency, base, patterns, action] = t;
    let score = base,
      evidence = [];
    const sources =
      evidenceSources?.ai === undefined
        ? {
            ai: JSON.stringify(evidenceSources || {}).toLowerCase(),
            relationships: (relationshipData?.relationships || []).map(
              (relationship) => ({
                value: JSON.stringify(relationship).toLowerCase(),
                label: `${relationship.source} -> ${relationship.target}`,
              }),
            ),
            context: JSON.stringify(context || {}).toLowerCase(),
          }
        : evidenceSources;
    for (const p of patterns)
      if (sources.ai.includes(p)) {
        score += 0.05;
        evidence.push(`AI evidence: ${p}`);
      }
    for (const relationship of sources.relationships) {
      if (patterns.some((p) => relationship.value.includes(p))) {
        score += 0.04;
        evidence.push(`Model 2 evidence: ${relationship.label}`);
      }
    }
    for (const p of patterns)
      if (sources.context.includes(p)) {
        score += 0.04;
        evidence.push(`Context evidence: ${p}`);
      }
    score = Math.min(0.95, Math.max(0.05, score));
    return {
      id,
      cause,
      category,
      urgency,
      confidence: Number(score.toFixed(2)),
      evidence: [...new Set(evidence)],
      recommended_action: action,
      resources: this.resources(cause),
    };
  }

  resources(cause) {
    if (
      cause.includes("Drainage") ||
      cause.includes("Water") ||
      cause.includes("Flood")
    )
      return ["drainage_crew", "inspection_equipment"];
    if (
      cause.includes("Road") ||
      cause.includes("Asphalt") ||
      cause.includes("Traffic")
    )
      return ["road_engineering_team"];
    if (
      cause.includes("Waste") ||
      cause.includes("Garbage") ||
      cause.includes("Dumping")
    )
      return ["sanitation_team"];
    return ["inspection_team"];
  }

  overall(causes) {
    if (!causes.length) return 0;
    const w = [0.6, 0.25, 0.15];
    let s = 0,
      tw = 0;
    causes.slice(0, 3).forEach((c, i) => {
      s += c.confidence * w[i];
      tw += w[i];
    });
    return Number((s / tw).toFixed(2));
  }

  needsReview(c) {
    if (!c.length || c[0].confidence < 0.5) return true;
    return !!(c[1] && c[0].confidence - c[1].confidence < 0.1);
  }

  fallback(type) {
    return {
      problem_type: type,
      possible_causes: [],
      most_likely_cause: null,
      explanation:
        "No supported root-cause hypothesis. Manual investigation required.",
      confidence: 0,
      requires_human_review: true,
      action_plan: {
        immediate: [{ action: "Conduct site investigation", priority: 1 }],
      },
      evidence_summary: "No evidence available.",
      model_version: "3.0.0",
    };
  }
}
module.exports = RootCauseAnalysisModel;
