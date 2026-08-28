class DepartmentRouter {
  constructor() {
    this.d = {
      drainage: {
        id: "drainage",
        name: "Drainage Department",
        types: [
          "flooding",
          "water_logging",
          "blocked_drain",
          "water_accumulation",
          "sewer_overflow",
        ],
        caps: ["drain", "water", "flood"],
        max: 10,
        time: {
          emergency: "1-2 hours",
          high: "4-8 hours",
          medium: "24-48 hours",
          low: "3-5 days",
        },
        phone: "1800-DRAINAGE",
      },
      roads: {
        id: "roads",
        name: "Roads Department",
        types: [
          "pothole",
          "road_damage",
          "cracked_surface",
          "road_erosion",
          "traffic_hazard",
        ],
        caps: ["road", "pothole", "asphalt", "traffic"],
        max: 8,
        time: {
          emergency: "2-4 hours",
          high: "6-12 hours",
          medium: "1-2 days",
          low: "3-7 days",
        },
        phone: "1800-ROADS",
      },
      sanitation: {
        id: "sanitation",
        name: "Sanitation Department",
        types: [
          "garbage",
          "waste_accumulation",
          "illegal_dumping",
          "overflowing_bins",
          "sanitation_issue",
        ],
        caps: ["garbage", "waste", "dump"],
        max: 15,
        time: {
          emergency: "2-4 hours",
          high: "8-12 hours",
          medium: "1-2 days",
          low: "2-4 days",
        },
        phone: "1800-SANITATION",
      },
      electricity: {
        id: "electricity",
        name: "Electricity Department",
        types: [
          "streetlight_outage",
          "electrical_hazard",
          "power_outage",
          "exposed_wire",
          "electrical_fault",
        ],
        caps: ["electric", "power", "wire", "streetlight"],
        max: 6,
        time: {
          emergency: "15-30 minutes",
          high: "1-2 hours",
          medium: "4-8 hours",
          low: "12-24 hours",
        },
        phone: "1800-ELECTRIC",
      },
      parks: {
        id: "parks",
        name: "Parks & Recreation Department",
        types: [
          "tree_fall",
          "overgrown_vegetation",
          "park_damage",
          "playground_issue",
        ],
        caps: ["tree", "park", "vegetation", "playground"],
        max: 5,
        time: {
          emergency: "2-4 hours",
          high: "8-12 hours",
          medium: "1-3 days",
          low: "1-2 weeks",
        },
        phone: "1800-PARKS",
      },
      planning: {
        id: "planning",
        name: "City Planning Department",
        types: [
          "infrastructure_planning",
          "development_issue",
          "zoning_problem",
        ],
        caps: ["infrastructure", "capacity", "development"],
        max: 5,
        time: {
          emergency: "24-48 hours",
          high: "2-4 days",
          medium: "1-2 weeks",
          low: "1-3 months",
        },
        phone: "1800-PLANNING",
      },
      environment: {
        id: "environment",
        name: "Environmental Department",
        types: [
          "pollution",
          "environmental_hazard",
          "water_contamination",
          "air_quality",
        ],
        caps: ["pollution", "contamination", "environment"],
        max: 4,
        time: {
          emergency: "12-24 hours",
          high: "2-4 days",
          medium: "1-2 weeks",
          low: "1-2 months",
        },
        phone: "1800-ENVIRON",
      },
      emergency: {
        id: "emergency",
        name: "Emergency Services",
        types: [
          "emergency",
          "life_safety",
          "natural_disaster",
          "accident",
          "fire",
          "medical_emergency",
        ],
        caps: ["safety", "emergency", "life"],
        max: 20,
        time: {
          emergency: "15-30 minutes",
          high: "1-2 hours",
          medium: "4-8 hours",
          low: "12-24 hours",
        },
        phone: "911",
      },
      general: {
        id: "general",
        name: "General Department",
        types: ["other", "general", "unclassified"],
        caps: ["general", "investigation"],
        max: 10,
        time: {
          emergency: "2-4 hours",
          high: "8-12 hours",
          medium: "24-48 hours",
          low: "3-5 days",
        },
        phone: "311",
      },
    };
    this.map = {
      flooding: ["drainage", "emergency", "environment"],
      pothole: ["roads", "drainage"],
      garbage: ["sanitation"],
      streetlight_outage: ["electricity"],
      electrical_hazard: ["electricity", "emergency"],
      tree_fall: ["parks", "emergency"],
      pollution: ["environment", "sanitation"],
      infrastructure_planning: ["planning", "drainage", "roads"],
      road_damage: ["roads", "drainage"],
      blocked_drain: ["drainage", "sanitation"],
      water_contamination: ["environment", "drainage"],
      power_outage: ["electricity"],
      exposed_wire: ["electricity", "emergency"],
      illegal_dumping: ["sanitation", "environment"],
      traffic_hazard: ["roads", "emergency"],
    };
  }
  normalizeRecommendations(recs) {
    if (!recs) return [];
    if (Array.isArray(recs)) return recs;
    return [recs];
  }
  async routeProblem(report, rca, recs = [], status = {}) {
    let type = (report?.category || "other").toLowerCase(),
      sev = (report?.severity || "medium").toLowerCase();
    let normalized = this.normalizeRecommendations(recs);
    let ids = new Set(this.map[type] || []);
    if (sev === "emergency") ids.add("emergency");
    if (ids.size === 0) ids.add("general");
    let a = [...ids]
      .map((id) => this.d[id])
      .filter(Boolean)
      .map((d) => this.score(d, report, rca, normalized, status, sev))
      .sort((x, y) => y.score - x.score || x.load - y.load);
    let primaryStrong = a.find((x) => x.d.id !== "general" && x.score >= 0.7);
    if (primaryStrong) {
      a = a.filter(
        (x) => x.d.id !== "general" || x.score >= primaryStrong.score - 0.15,
      );
    }
    let p = a[0],
      s = a.slice(1, 4),
      sup = a.slice(4, 7),
      conf = p
        ? Math.max(
            0.1,
            Math.min(
              0.95,
              p.score +
                (a[1]
                  ? p.score - a[1].score > 0.2
                    ? 0.05
                    : a[1].score - p.score > 0.1
                      ? 0
                      : -0.05
                  : 0.05),
            ),
          )
        : 0;
    return {
      primary_department: p ? this.pub(p, sev) : null,
      secondary_departments: s.map((x) => this.pub(x, sev)),
      support_departments: sup.map((x) => ({
        id: x.d.id,
        name: x.d.name,
        confidence: x.score,
        reason: x.reason,
      })),
      confidence: Number(conf.toFixed(2)),
      requires_multiple_departments: s.length > 0,
      coordination_required: s.length > 1,
      estimated_response_time: p ? this.time(p.d, sev) : "Unknown",
      routing_instructions: p
        ? `PRIMARY: ${p.d.name} (${Math.round(p.score * 100)}%). Reason: ${p.reason.join(", ") || "best match"}.`
        : "Manual routing required.",
      recommended_handoff: p
        ? `Contact ${p.d.name} at ${p.d.phone}.`
        : "Contact General Department at 311.",
      routing_metadata: {
        candidates: a.length,
        top_score: p?.score || 0,
        model_version: "5.0.0",
      },
      timestamp: new Date().toISOString(),
    };
  }
  score(d, report, rca, recs, status, sev) {
    let st = status[d.id] || { available: true, load: 0 },
      type = d.types.includes(report.category) ? 1 : 0.2,
      text = (
        (rca?.most_likely_cause?.cause || "") +
        " " +
        (rca?.most_likely_cause?.evidence || []).join(" ")
      ).toLowerCase(),
      cap = d.caps.some((x) => text.includes(x)) ? 0.9 : 0.3,
      sm = sev === "emergency" && d.id === "emergency" ? 1 : 0.6,
      av =
        st.available === false ? 0 : 1 - Math.min(1, Math.max(0, st.load || 0)),
      align = recs.some((x) => {
        let dep = (x.department || x.name || x.id || "").toLowerCase();
        let depKey = d.name.toLowerCase();
        return dep === depKey || dep.includes(depKey) || depKey.includes(dep);
      })
        ? 0.9
        : 0.3,
      score =
        0.4 * type +
        0.25 * cap +
        0.15 * sm +
        0.1 * av +
        0.05 * 0.8 +
        0.05 * align;
    if (d.id === "general") score *= 0.65;
    if (sev === "emergency" && d.id === "emergency")
      score = Math.max(score, 0.9);
    if (st.available === false) score *= 0.55;
    let reason = [];
    if (type === 1) reason.push("strong problem-type match");
    if (cap >= 0.7) reason.push("root-cause capability match");
    if (st.available === false) reason.push("department unavailable");
    else if ((st.load || 0) >= 0.8) reason.push("high workload");
    if (align >= 0.7) reason.push("Model 4 alignment");
    return {
      d,
      score: Number(Math.min(1, score).toFixed(2)),
      reason,
      load: st.load || 0,
      available: st.available !== false,
    };
  }
  pub(x, sev) {
    return {
      id: x.d.id,
      name: x.d.name,
      confidence: x.score,
      reason: x.reason,
      expected_response_time: this.time(x.d, sev),
      contact: { phone: x.d.phone },
      available: x.available,
      current_load: x.load,
    };
  }
  time(d, s) {
    return d.time[s] || "48-72 hours";
  }
}
module.exports = DepartmentRouter;
