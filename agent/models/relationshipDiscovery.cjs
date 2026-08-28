/**
 * Model 2: Relationship Discovery
 *
 * Purpose:
 * Discover statistically supported relationships between DIFFERENT civic
 * problem types around the same place/time.
 *
 * Important:
 * - "causes" is NOT asserted from observational data alone.
 * - Historical and location-based evidence is reported as "occurs_with".
 * - Domain knowledge can provide a hypothesis, but it is marked separately.
 *
 * Example:
 * blocked_drain --occurs_with--> flooding
 * garbage      --occurs_with--> blocked_drain
 * flooding     --occurs_with--> road_damage
 */

class RelationshipDiscoveryModel {
  constructor(options = {}) {
    this.radiusMeters = options.radiusMeters ?? 500;
    this.timeWindowDays = options.timeWindowDays ?? 30;
    this.minPairCount = options.minPairCount ?? 2;
    this.minConfidence = options.minConfidence ?? 0.35;

    // Hypotheses only. These are NOT treated as proven causal relationships.
    this.knowledgeGraph = {
      flooding: {
        hypotheses: ["blocked_drain", "water_logging", "heavy_rainfall"],
      },
      pothole: {
        hypotheses: ["water_accumulation", "road_damage", "flooding"],
      },
      garbage: {
        hypotheses: ["blocked_drain", "overflowing_bin", "illegal_dumping"],
      },
      road_damage: {
        hypotheses: ["flooding", "poor_drainage", "pothole"],
      },
      blocked_drain: {
        hypotheses: ["garbage", "poor_maintenance", "flooding"],
      },
      water_leak: {
        hypotheses: ["flooding", "road_damage"],
      },
      streetlight_outage: {
        hypotheses: ["electrical_issue", "poor_maintenance"],
      },
      tree_fall: {
        hypotheses: ["strong_wind", "heavy_rain"],
      },
    };
  }

  async discoverRelationships(report, existingReports = []) {
    try {
      const problemType = this.normalizeCategory(report.category);
      if (!problemType) return this.emptyResult("unknown");

      const graphHypotheses = this.getKnowledgeHypotheses(problemType);

      const nearby = this.filterNearbyReports(
        report,
        existingReports,
        this.radiusMeters,
      );

      const historical = this.findHistoricalRelationships(
        problemType,
        nearby,
        report,
      );

      const temporal = this.findTemporalRelationships(
        problemType,
        nearby,
        report,
      );

      const relationships = this.mergeAndRank([
        ...graphHypotheses,
        ...historical,
        ...temporal,
      ]);

      const graph = this.buildRelationshipGraph(problemType, relationships);
      const chain = this.buildEvidenceChain(problemType, relationships);

      return {
        problem_type: problemType,
        relationships,
        graph,
        evidence_chain: chain,
        summary: this.generateSummary(problemType, relationships),
        confidence: this.calculateOverallConfidence(relationships),
        total_relationships: relationships.length,
        has_significant_relationships: relationships.some(
          (r) => r.confidence >= this.minConfidence,
        ),
        evidence_scope: {
          radius_meters: this.radiusMeters,
          time_window_days: this.timeWindowDays,
          nearby_reports: nearby.length,
        },
      };
    } catch (error) {
      return {
        problem_type: this.normalizeCategory(report?.category) || "unknown",
        relationships: [],
        graph: { nodes: [], edges: [] },
        evidence_chain: [],
        summary: "Unable to discover relationships",
        confidence: 0,
        total_relationships: 0,
        has_significant_relationships: false,
        error: error.message,
      };
    }
  }

  getKnowledgeHypotheses(problemType) {
    const targets = this.knowledgeGraph[problemType]?.hypotheses || [];
    return targets.map((target) => ({
      source: problemType,
      target,
      type: "hypothesis",
      strength: 0.5,
      confidence: 0.5,
      evidence: [
        `Domain hypothesis: ${problemType} may be associated with ${target}`,
      ],
      discovered_from: "domain_knowledge",
      is_historical: false,
      is_location_based: false,
      is_temporal: false,
    }));
  }

  findHistoricalRelationships(problemType, nearbyReports, currentReport) {
    const counts = {};
    for (const r of nearbyReports) {
      const category = this.normalizeCategory(r.category);
      if (!category || category === problemType) continue;
      counts[category] = (counts[category] || 0) + 1;
    }

    const totalOther = Object.values(counts).reduce((a, b) => a + b, 0);
    if (!totalOther) return [];

    const minCount = Math.max(2, this.minPairCount);

    return Object.entries(counts)
      .filter(([, count]) => count >= minCount)
      .map(([target, count]) => {
        const support = count / totalOther;
        return {
          source: problemType,
          target,
          type: "occurs_with",
          strength: Math.min(0.95, 0.4 + support * 0.55),
          confidence: Math.min(0.95, 0.45 + Math.min(count / 20, 0.45)),
          evidence: [
            `${count} nearby reports of ${target}`,
            `${Math.round(support * 100)}% of nearby non-${problemType} reports`,
          ],
          discovered_from: "historical_data",
          is_historical: true,
          is_location_based: true,
          is_temporal: false,
        };
      });
  }

  findTemporalRelationships(problemType, nearbyReports, currentReport) {
    const currentDate = this.parseDate(currentReport.created_at);
    if (!currentDate) return [];

    const counts = {};
    for (const r of nearbyReports) {
      const category = this.normalizeCategory(r.category);
      if (!category || category === problemType) continue;

      const date = this.parseDate(r.created_at);
      if (!date) continue;

      const days = Math.abs(currentDate - date) / 86400000;
      if (days <= this.timeWindowDays) {
        counts[category] = (counts[category] || 0) + 1;
      }
    }

    const minCount = Math.max(2, this.minPairCount);

    return Object.entries(counts)
      .filter(([, count]) => count >= minCount)
      .map(([target, count]) => ({
        source: problemType,
        target,
        type: "temporal_association",
        strength: Math.min(0.9, 0.35 + count * 0.05),
        confidence: Math.min(0.9, 0.45 + count * 0.04),
        evidence: [
          `${count} ${target} reports occurred within ${this.timeWindowDays} days`,
          "Temporal proximity is evidence of association, not proof of causation",
        ],
        discovered_from: "historical_temporal_data",
        is_historical: true,
        is_location_based: true,
        is_temporal: true,
      }));
  }

  filterNearbyReports(report, reports, radiusMeters) {
    if (!this.hasCoordinates(report)) return [];

    return reports.filter((r) => {
      if (!this.hasCoordinates(r)) return false;
      if (r.id && report.id && r.id === report.id) return false;
      return (
        this.calculateDistance(
          Number(report.latitude),
          Number(report.longitude),
          Number(r.latitude),
          Number(r.longitude),
        ) <= radiusMeters
      );
    });
  }

  mergeAndRank(relationships) {
    const map = new Map();

    for (const rel of relationships) {
      if (!rel.source || !rel.target || rel.source === rel.target) continue;

      const key = `${rel.source}|${rel.target}`;
      const old = map.get(key);

      if (!old) {
        map.set(key, { ...rel, evidence: [...(rel.evidence || [])] });
      } else {
        old.strength = Math.max(old.strength, rel.strength);
        old.confidence = 1 - (1 - old.confidence) * (1 - rel.confidence) * 0.65;
        old.evidence = [...new Set([...old.evidence, ...(rel.evidence || [])])];
        old.discovered_from = [
          ...new Set([old.discovered_from, rel.discovered_from]),
        ].join("+");
        old.is_historical ||= rel.is_historical;
        old.is_location_based ||= rel.is_location_based;
        old.is_temporal ||= rel.is_temporal;
      }
    }

    return [...map.values()]
      .map((r) => ({
        ...r,
        rank_score: Number(
          (r.strength * 0.55 + r.confidence * 0.45).toFixed(4),
        ),
      }))
      .sort((a, b) => b.rank_score - a.rank_score);
  }

  buildRelationshipGraph(problemType, relationships) {
    const nodes = [
      {
        id: problemType,
        label: problemType,
        type: "problem",
        is_primary: true,
      },
    ];
    const nodeSet = new Set([problemType]);

    const edges = relationships.map((rel) => {
      if (!nodeSet.has(rel.target)) {
        nodes.push({
          id: rel.target,
          label: rel.target,
          type: "problem",
          is_primary: false,
        });
        nodeSet.add(rel.target);
      }

      return {
        from: rel.source,
        to: rel.target,
        label: rel.type,
        weight: rel.strength,
        confidence: rel.confidence,
      };
    });

    return { nodes, edges };
  }

  buildEvidenceChain(problemType, relationships) {
    return [
      problemType,
      ...relationships
        .filter((r) => r.rank_score >= 0.6)
        .slice(0, 4)
        .map((r) => r.target),
    ];
  }

  generateSummary(problemType, relationships) {
    if (!relationships.length) {
      return `No significant relationships found for ${problemType}.`;
    }

    const top = relationships
      .slice(0, 3)
      .map((r) => `${r.target} (${Math.round(r.confidence * 100)}% confidence)`)
      .join(", ");

    return `For ${problemType}, the strongest observed relationships are: ${top}. These are associations/hypotheses and should be validated before causal decisions.`;
  }

  calculateOverallConfidence(relationships) {
    if (!relationships.length) return 0;
    const top = relationships.slice(0, 5);
    return Number(
      (top.reduce((sum, r) => sum + r.confidence, 0) / top.length).toFixed(3),
    );
  }

  normalizeCategory(category) {
    if (!category) return null;
    return String(category).trim().toLowerCase().replace(/\s+/g, "_");
  }

  hasCoordinates(r) {
    return (
      Number.isFinite(Number(r?.latitude)) &&
      Number.isFinite(Number(r?.longitude))
    );
  }

  parseDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const dp = ((lat2 - lat1) * Math.PI) / 180;
    const dl = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(dp / 2) ** 2 +
      Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  emptyResult(problemType) {
    return {
      problem_type: problemType,
      relationships: [],
      graph: { nodes: [], edges: [] },
      evidence_chain: [problemType],
      summary: `No relationships discovered for ${problemType}.`,
      confidence: 0,
      total_relationships: 0,
      has_significant_relationships: false,
    };
  }
}

module.exports = RelationshipDiscoveryModel;
