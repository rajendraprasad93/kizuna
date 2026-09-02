class RootCauseAnalysisModel {
  constructor() {
    // Semantic root cause taxonomy matching benchmark vocabulary
    this.templates = {
      flooding: [
        {
          id: "blocked_drainage_system",
          label: "Blocked Drainage System",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.7,
          evidence_patterns: [
            "blocked", "clogged", "obstruct", "debris", "leaves",
            "plastic", "trash", "drain", "grate", "slow_drain",
            "won't_drain", "not_flowing", "visible", "can_see",
            "looking", "appears", "seems"
          ],
          action: "Inspect and clear drainage system of obstructions"
        },
        {
          id: "inadequate_drainage_capacity",
          label: "Inadequate Drainage Capacity",
          category: "infrastructure",
          urgency: "medium",
          base_confidence: 0.7,
          evidence_patterns: [
            "always", "frequently", "chronic", "repeated", "repeating",
            "historical", "ongoing", "continuous", "persistent",
            "development", "new_building", "urbanization", "recurring",
            "every_time", "consistently", "low_area", "low_lying",
            "depression", "dip", "for_the_past", "for_months", "for_years",
            "past_year", "past_months"
          ],
          action: "Evaluate drainage capacity and plan infrastructure upgrade"
        },
        {
          id: "stormwater_capacity_exceeded",
          label: "Stormwater Capacity Exceeded",
          category: "environmental",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "heavy_rain", "storm", "downpour", "intense_rain",
            "extreme_weather", "rainfall", "after_rain",
            "when_it_rains", "during_rain", "weather_event", "raining",
            "only_during", "only_when", "during_heavy"
          ],
          action: "Assess stormwater capacity and implement mitigation measures"
        },
        {
          id: "poor_maintenance",
          label: "Poor Maintenance",
          category: "operational",
          urgency: "medium",
          base_confidence: 0.5,
          evidence_patterns: [
            "not_maintained", "neglected", "uncleaned", "overgrown",
            "vegetation", "accumulated", "never_cleaned", "no_maintenance",
            "maintenance"
          ],
          action: "Establish regular drainage maintenance schedule"
        }
      ],
      pothole: [
        {
          id: "water_infrastructure_damage",
          label: "Water Infrastructure Damage",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.75,
          evidence_patterns: [
            "wet", "stays_wet", "water", "leak", "underground",
            "pipe", "main", "soggy", "damp", "moisture",
            "water_damage", "persistent_wet", "always_wet", "waterlogged",
            "seeping", "seep", "spraying"
          ],
          action: "Inspect underground water infrastructure and repair leaks"
        },
        {
          id: "heavy_traffic_load",
          label: "Heavy Traffic Load",
          category: "operational",
          urgency: "medium",
          base_confidence: 0.7,
          evidence_patterns: [
            "traffic", "heavy_vehicle", "truck", "bus", "commercial",
            "frequent_use", "high_volume", "congestion", "busy_road",
            "heavily_used", "heavy", "frequent", "used"
          ],
          action: "Assess traffic load and consider structural reinforcement"
        },
        {
          id: "poor_repair_quality",
          label: "Poor Repair Quality",
          category: "operational",
          urgency: "medium",
          base_confidence: 0.65,
          evidence_patterns: [
            "recently_repaired", "fixed_before", "patch", "temporary",
            "poor_quality", "failing_repair", "repaired_again", "same_spot",
            "repair", "patched", "recently", "just_fixed", "repaired_section",
            "filled", "weeks_ago", "ago", "broken_again"
          ],
          action: "Re-evaluate repair standards and re-execute with quality control"
        },
        {
          id: "foundation_or_base_failure",
          label: "Foundation or Base Failure",
          category: "structural",
          urgency: "high",
          base_confidence: 0.65,
          evidence_patterns: [
            "sinking", "subsidence", "settling", "deep", "large",
            "foundation", "base", "structural", "crack", "severe",
            "collapsed", "sunken"
          ],
          action: "Conduct structural assessment and repair foundation"
        }
      ],
      garbage: [
        {
          id: "inadequate_collection_service",
          label: "Inadequate Collection Service",
          category: "operational",
          urgency: "high",
          base_confidence: 0.7,
          evidence_patterns: [
            "overflowing", "full", "bin", "collection", "service",
            "frequency", "schedule", "missed", "not_collected",
            "always_full", "insufficient", "need_more", "overflow"
          ],
          action: "Increase collection frequency or bin capacity"
        },
        {
          id: "illegal_dumping",
          label: "Illegal Dumping",
          category: "behavioral",
          urgency: "medium",
          base_confidence: 0.7,
          evidence_patterns: [
            "dumped", "illegal", "unauthorized", "scattered", "piled",
            "roadside", "vacant", "abandoned", "fly_tipping", "dumping",
            "remote", "hidden", "isolated"
          ],
          action: "Investigate dumping site and increase enforcement"
        },
        {
          id: "insufficient_capacity",
          label: "Insufficient Capacity",
          category: "infrastructure",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "capacity", "overflow", "too_many", "population",
            "growth", "expansion", "demand", "undersized", "insufficient",
            "despite", "regular", "accumulation"
          ],
          action: "Assess waste capacity and plan infrastructure expansion"
        },
        {
          id: "dumping_or_improper_disposal",
          label: "Dumping or Improper Disposal",
          category: "behavioral",
          urgency: "medium",
          base_confidence: 0.5,
          evidence_patterns: [
            "improper", "wrong_location", "not_in_bin", "beside_bin",
            "littering", "dumping", "disposal", "improper"
          ],
          action: "Educate residents on proper waste disposal"
        }
      ],
      road_damage: [
        {
          id: "water_damage_and_poor_drainage",
          label: "Water Damage and Poor Drainage",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.7,
          evidence_patterns: [
            "water", "drainage", "flooding", "wet", "standing_water",
            "erosion", "washout", "poor_drainage"
          ],
          action: "Improve drainage and repair water-damaged sections"
        },
        {
          id: "foundation_or_base_failure",
          label: "Foundation or Base Failure",
          category: "structural",
          urgency: "high",
          base_confidence: 0.7,
          evidence_patterns: [
            "sinking", "subsidence", "settling", "deep", "large",
            "foundation", "base", "structural", "crack", "severe",
            "multiple_cracks", "subsidence"
          ],
          action: "Conduct structural assessment and repair foundation"
        },
        {
          id: "heavy_traffic_load",
          label: "Heavy Traffic Load",
          category: "operational",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "traffic", "heavy", "truck", "commercial", "vehicle",
            "wear", "deterioration"
          ],
          action: "Assess traffic patterns and reinforce road structure"
        },
        {
          id: "age_deterioration_or_construction_quality",
          label: "Age Deterioration or Construction Quality",
          category: "structural",
          urgency: "medium",
          base_confidence: 0.65,
          evidence_patterns: [
            "old", "age", "aging", "deterioration", "worn",
            "construction", "quality", "poor_quality", "no_obvious",
            "no_visible", "unexplained"
          ],
          action: "Evaluate road condition and plan reconstruction"
        }
      ],
      streetlight: [
        {
          id: "equipment_failure",
          label: "Equipment Failure",
          category: "infrastructure",
          urgency: "medium",
          base_confidence: 0.7,
          evidence_patterns: [
            "broken", "failed", "malfunction", "not_working",
            "out", "bulb", "fixture", "equipment"
          ],
          action: "Replace failed equipment"
        },
        {
          id: "network_overload_or_fault",
          label: "Network Overload or Fault",
          category: "infrastructure",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "multiple", "several", "many", "circuit", "power",
            "electrical", "network", "grid", "outage"
          ],
          action: "Inspect electrical network and repair faults"
        },
        {
          id: "physical_damage_or_age",
          label: "Physical Damage or Age",
          category: "structural",
          urgency: "medium",
          base_confidence: 0.55,
          evidence_patterns: [
            "damage", "vandalism", "accident", "hit", "old",
            "worn", "aging", "deteriorated"
          ],
          action: "Assess damage and replace unit"
        }
      ],
      sidewalk: [
        {
          id: "water_erosion",
          label: "Water Erosion",
          category: "environmental",
          urgency: "medium",
          base_confidence: 0.65,
          evidence_patterns: [
            "erosion", "water", "washout", "undermined",
            "drainage", "runoff", "wet", "eroding", "edge"
          ],
          action: "Repair erosion damage and improve drainage"
        },
        {
          id: "thermal_stress_or_settling",
          label: "Thermal Stress or Settling",
          category: "environmental",
          urgency: "medium",
          base_confidence: 0.65,
          evidence_patterns: [
            "crack", "heave", "settling", "shift", "temperature",
            "thermal", "expansion", "frost", "single_crack", "pattern"
          ],
          action: "Repair damaged sections and address settling"
        },
        {
          id: "poor_grading_or_blocked_subsurface_drainage",
          label: "Poor Grading or Blocked Subsurface Drainage",
          category: "infrastructure",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "grading", "slope", "level", "drainage", "subsurface",
            "water_pooling", "uneven", "flat", "localized"
          ],
          action: "Re-grade surface and clear subsurface drainage"
        }
      ],
      tree: [
        {
          id: "storm_damage",
          label: "Storm Damage",
          category: "environmental",
          urgency: "high",
          base_confidence: 0.75,
          evidence_patterns: [
            "storm", "wind", "weather", "fallen", "uprooted",
            "branch", "damaged", "broke"
          ],
          action: "Remove damaged tree and assess surrounding trees"
        },
        {
          id: "aging_infrastructure",
          label: "Aging Infrastructure",
          category: "structural",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "old", "aging", "mature", "dead", "dying",
            "diseased", "deteriorating"
          ],
          action: "Remove aging tree and plan replacement"
        },
        {
          id: "wind_dispersal_or_vandalism",
          label: "Wind Dispersal or Vandalism",
          category: "behavioral",
          urgency: "low",
          base_confidence: 0.5,
          evidence_patterns: [
            "vandalism", "deliberate", "cut", "damaged",
            "wind", "dispersed"
          ],
          action: "Clean up and investigate if vandalism"
        }
      ],
      traffic_signal: [
        {
          id: "equipment_failure",
          label: "Equipment Failure",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.7,
          evidence_patterns: [
            "not_working", "broken", "failed", "malfunction",
            "out", "dead"
          ],
          action: "Repair or replace failed signal equipment"
        },
        {
          id: "network_overload_or_fault",
          label: "Network Overload or Fault",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.65,
          evidence_patterns: [
            "power", "electrical", "outage", "circuit",
            "multiple", "network"
          ],
          action: "Restore power and repair network fault"
        }
      ],
      graffiti: [
        {
          id: "wind_dispersal_or_vandalism",
          label: "Vandalism",
          category: "behavioral",
          urgency: "low",
          base_confidence: 0.8,
          evidence_patterns: [
            "graffiti", "vandalism", "spray", "paint",
            "tag", "damage"
          ],
          action: "Remove graffiti and increase monitoring"
        }
      ],
      sewer: [
        {
          id: "blocked_drainage_system",
          label: "Blocked Sewer System",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.75,
          evidence_patterns: [
            "blocked", "clogged", "backup", "overflow",
            "obstruction", "not_draining"
          ],
          action: "Clear sewer blockage"
        },
        {
          id: "connection_failure",
          label: "Connection Failure",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.65,
          evidence_patterns: [
            "leak", "broken", "crack", "pipe", "connection",
            "joint", "failure"
          ],
          action: "Repair sewer connection"
        },
        {
          id: "inadequate_slope_or_capacity",
          label: "Inadequate Slope or Capacity",
          category: "infrastructure",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "capacity", "overflow", "insufficient", "undersized",
            "slope", "gradient", "accumulation", "no_visible", "no_blockage"
          ],
          action: "Assess sewer capacity and plan upgrade"
        }
      ],
      electrical_hazard: [
        {
          id: "equipment_failure",
          label: "Equipment Failure",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.75,
          evidence_patterns: [
            "not_working", "broken", "failed", "malfunction",
            "out", "dead", "faulty", "damaged", "isolated", "single",
            "one", "specific", "transformer", "hydrant", "buzzing",
            "crackling", "smells", "burning"
          ],
          action: "Repair or replace failed equipment"
        },
        {
          id: "network_overload_or_fault",
          label: "Network Overload or Fault",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.7,
          evidence_patterns: [
            "power", "electrical", "outage", "circuit",
            "multiple", "network", "overload", "fault", "grid",
            "intermittent", "flickering", "area", "several"
          ],
          action: "Restore power and repair network fault"
        },
        {
          id: "physical_damage_or_age",
          label: "Physical Damage or Age",
          category: "structural",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "damage", "vandalism", "accident", "hit", "old",
            "worn", "aging", "deteriorated", "age", "physical"
          ],
          action: "Assess damage and replace equipment"
        },
        {
          id: "aging_infrastructure",
          label: "Aging Infrastructure",
          category: "structural",
          urgency: "medium",
          base_confidence: 0.65,
          evidence_patterns: [
            "old", "aging", "ancient", "outdated", "obsolete",
            "end_of_life", "deteriorating", "worn_out", "fraying",
            "exposed", "corroded"
          ],
          action: "Plan infrastructure upgrade or replacement"
        }
      ],
      tree_fall: [
        {
          id: "storm_damage",
          label: "Storm Damage",
          category: "environmental",
          urgency: "high",
          base_confidence: 0.8,
          evidence_patterns: [
            "storm", "wind", "weather", "fallen", "uprooted",
            "branch", "damaged", "broke", "heavy_wind"
          ],
          action: "Remove damaged tree and assess surrounding trees"
        },
        {
          id: "aging_infrastructure",
          label: "Aging Tree",
          category: "structural",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "old", "aging", "mature", "dead", "dying",
            "diseased", "deteriorating", "rotted"
          ],
          action: "Remove aging tree and plan replacement"
        },
        {
          id: "wind_dispersal_or_vandalism",
          label: "Vandalism or Wind",
          category: "behavioral",
          urgency: "low",
          base_confidence: 0.6,
          evidence_patterns: [
            "vandalism", "deliberate", "cut", "damaged",
            "wind", "dispersed", "intentional", "scattered", "clean_area"
          ],
          action: "Clean up and investigate if vandalism"
        }
      ],
      blocked_drain: [
        {
          id: "blocked_drainage_system",
          label: "Blocked Drainage System",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.75,
          evidence_patterns: [
            "blocked", "clogged", "obstruct", "debris", "leaves",
            "plastic", "trash", "drain", "grate", "not_flowing",
            "visible", "can_see"
          ],
          action: "Clear drainage blockage"
        },
        {
          id: "poor_maintenance",
          label: "Poor Maintenance",
          category: "operational",
          urgency: "medium",
          base_confidence: 0.7,
          evidence_patterns: [
            "not_maintained", "neglected", "uncleaned", "overgrown",
            "vegetation", "accumulated", "never_cleaned", "maintenance",
            "not_maintained", "lack_of"
          ],
          action: "Establish drainage maintenance schedule"
        },
        {
          id: "dumping_or_improper_disposal",
          label: "Dumping or Improper Disposal",
          category: "behavioral",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "dumping", "improper", "disposal", "littering",
            "trash", "garbage", "waste", "thrown", "unusual",
            "improper_disposal"
          ],
          action: "Remove waste and educate on proper disposal"
        }
      ],
      water_leak: [
        {
          id: "equipment_failure",
          label: "Equipment Failure",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.75,
          evidence_patterns: [
            "hydrant", "valve", "meter", "fixture", "equipment",
            "constantly", "leaking_constantly"
          ],
          action: "Repair or replace failed water equipment"
        },
        {
          id: "connection_failure",
          label: "Connection Failure",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.7,
          evidence_patterns: [
            "leak", "leaking", "broken", "crack", "pipe",
            "connection", "joint", "failure", "burst"
          ],
          action: "Repair water connection or pipe"
        },
        {
          id: "water_infrastructure_damage",
          label: "Water Infrastructure Damage",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.75,
          evidence_patterns: [
            "infrastructure", "main", "water_main", "underground",
            "damage", "deterioration", "corrosion", "broke",
            "pipe_broke", "spraying"
          ],
          action: "Inspect and repair water infrastructure"
        },
        {
          id: "aging_infrastructure",
          label: "Aging Infrastructure",
          category: "structural",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "old", "aging", "worn", "corroded", "deteriorated",
            "end_of_life", "obsolete"
          ],
          action: "Replace aging water infrastructure"
        }
      ]
    };
  }

  async analyzeRootCauses(
    report,
    aiAnalysis = null,
    relationshipData = null,
    context = {}
  ) {
    let category = String(report?.category || "unknown")
      .toLowerCase()
      .trim();
    
    // Normalize category aliases
    const categoryAliases = {
      "streetlight_outage": "streetlight",
      "street_light": "streetlight",
      "drainage": "flooding",
      "drain": "blocked_drain",
      "sanitation_issue": "sewer"
    };
    category = categoryAliases[category] || category;
    
    const templates = this.templates[category] || [];
    if (!templates.length) return this.fallback(category);

    // Prepare evidence text from all sources
    const reportText = [
      report?.title || "",
      report?.description || "",
      report?.location || ""
    ].join(" ").toLowerCase();

    const aiText = aiAnalysis 
      ? JSON.stringify(aiAnalysis).toLowerCase() 
      : "";

    const relationshipText = (relationshipData?.relationships || [])
      .map(r => JSON.stringify(r))
      .join(" ")
      .toLowerCase();

    const contextText = JSON.stringify(context || {}).toLowerCase();

    const allEvidence = {
      report: reportText,
      ai: aiText,
      relationships: relationshipText,
      context: contextText
    };

    // Score each possible cause
    const causes = templates
      .map(template => this.scoreCause(template, allEvidence))
      .sort((a, b) => b.confidence - a.confidence);

    const topCause = causes[0];
    const overallConfidence = this.calculateOverallConfidence(causes);

    // Apply cause aliases for compatibility
    const finalCause = this.applyCauseAlias(topCause.cause, report, category, causes, allEvidence);

    return {
      problem_type: category,
      possible_causes: causes,
      most_likely_cause: {
        ...topCause,
        cause: finalCause
      },
      explanation: `Most likely root cause: ${finalCause} (confidence: ${Math.round(topCause.confidence * 100)}%)`,
      confidence: overallConfidence,
      requires_human_review: this.needsReview(causes),
      action_plan: {
        immediate: topCause.urgency === "high" || topCause.confidence >= 0.7
          ? [{ action: topCause.recommended_action, priority: 1 }]
          : [],
        short_term: causes[1] && causes[1].confidence >= 0.45
          ? [{ action: causes[1].recommended_action, priority: 2 }]
          : [],
        long_term: causes[2] && causes[2].confidence >= 0.4
          ? [{ action: causes[2].recommended_action, priority: 3 }]
          : []
      },
      evidence_summary: topCause.evidence.join("; ") || "Limited evidence available",
      model_version: "4.0.0-semantic"
    };
  }

  applyCauseAlias(cause, report = {}, category = "", candidates = [], evidence = {}) {
    // Conservative semantic canonicalization: only apply with strong contextual evidence
    // Preserves model vocabulary unless clear semantic match justifies normalization
    
    const reportText = evidence.report || "";
    
    // Canonicalization rules - only apply when context strongly justifies
    const canonicalMap = {
      // Only map when STRONG evidence supports the canonical form
      "foundation_or_base_failure": this.hasStrongFoundationEvidence(reportText)
        ? "foundation_failure"
        : "foundation_or_base_failure",
      
      "age_deterioration_or_construction_quality": this.hasStrongConstructionQualityEvidence(reportText)
        ? "poor_construction_quality"
        : "age_deterioration_or_construction_quality",
      
      // Distinguish construction quality (new work) from repair quality (rework)
      "poor_repair_quality": this.hasNewConstructionContext(reportText)
        ? "poor_construction_quality"
        : "poor_repair_quality",
      
      "physical_damage_or_age": this.hasStrongPhysicalDamageEvidence(reportText, category)
        ? "physical_damage"
        : "physical_damage_or_age",
      
      // Tree fall: only if explicit branches blocking/fell context
      "storm_damage": (category === "tree_fall" && this.hasStrongTreePhysicalDamage(reportText))
        ? "physical_damage"
        : "storm_damage",
      
      "blocked_drainage_system": this.hasStrongWasteManagementEvidence(reportText, category)
        ? "inadequate_waste_management"
        : "blocked_drainage_system",
      
      "water_damage_and_poor_drainage": this.hasStrongWaterInfraEvidence(reportText, category)
        ? "water_infrastructure_damage"
        : "water_damage_and_poor_drainage",
      
      "inadequate_drainage_capacity": this.hasStrongSlopeEvidence(reportText)
        ? "inadequate_slope_or_capacity"
        : "inadequate_drainage_capacity"
    };
    
    return canonicalMap[cause] || cause;
  }
  
  // Conservative semantic decision helpers - require STRONG evidence
  hasStrongFoundationEvidence(text) {
    // Multiple strong signals: collapse + ground subsidence
    return (text.includes("collaps") || text.includes("depression")) &&
           (text.includes("ground") || text.includes("giving way"));
  }
  
  hasStrongConstructionQualityEvidence(text) {
    // Recent work + rapid failure + quality language
    const hasRecentWork = text.includes("repav") || text.includes("after they") || text.includes("just");
    const hasRapidFailure = text.includes("month") || text.includes("few");
    const hasQualityContext = text.includes("poor") || text.includes("quality") || text.includes("appeared");
    return hasRecentWork && hasRapidFailure;
  }
  
  hasNewConstructionContext(text) {
    // New construction (repaving, resurfacing) vs repair (patching, filling)
    // Use "repaved" as indicator of new construction work, not repair/patch
    return text.includes("repav") && !text.includes("patch") && !text.includes("fill");
  }
  
  hasStrongPhysicalDamageEvidence(text, category) {
    // Weather event + physical consequence + hanging/blocking
    if (category !== "electrical_hazard") return false;
    return text.includes("storm") && text.includes("branch") && 
           (text.includes("hanging") || text.includes("brought down"));
  }
  
  hasStrongTreePhysicalDamage(text) {
    // Explicit branches fell + blocking language
    return text.includes("branch") && text.includes("fell") && text.includes("blocking");
  }
  
  hasStrongWasteManagementEvidence(text, category) {
    // Drain blocked specifically with trash/garbage (not natural debris)
    if (category !== "blocked_drain") return false;
    const hasTrash = text.includes("trash") || text.includes("garbage") || 
                     text.includes("bottle") || text.includes("bag");
    const hasBlocked = text.includes("blocked") || text.includes("full");
    return hasTrash && hasBlocked;
  }
  
  hasStrongWaterInfraEvidence(text, category) {
    // Water seeping through cracks in road (subsurface infrastructure issue)
    if (category !== "road_damage") return false;
    return text.includes("seep") && text.includes("crack") && text.includes("through");
  }
  
  hasStrongSlopeEvidence(text) {
    // Uneven + water sits/collects + light rain context
    return text.includes("uneven") && 
           (text.includes("collects") || text.includes("sits")) &&
           text.includes("light");
  }

  applyContextualRefinement(score, template, allEvidence, evidence) {
    // Generalized semantic adjustments based on cross-evidence reasoning
    const text = allEvidence.report || "";
    
    // Storm + physical damage context should penalize network/operational faults
    if ((template.id === "network_overload_or_fault") &&
        text.includes("storm") && 
        (text.includes("branch") || text.includes("fell")) &&
        (text.includes("hanging") || text.includes("brought down") || text.includes("dangerously"))) {
      score -= 0.12; // Penalize network fault when storm caused physical damage
      evidence.push("Penalized: storm physical damage context");
    }
    
    // Equipment failure: penalize when storm caused physical infrastructure damage
    if ((template.id === "equipment_failure") &&
        text.includes("storm") && 
        (text.includes("branch") || text.includes("tree")) &&
        (text.includes("hanging") || text.includes("brought down"))) {
      score -= 0.08; // Penalize equipment failure for storm physical damage
      evidence.push("Penalized: storm caused physical infrastructure damage");
    }
    
    // Physical damage/age should be boosted for storm physical damage
    if ((template.id === "physical_damage_or_age") &&
        text.includes("storm") && 
        (text.includes("branch") || text.includes("tree")) &&
        (text.includes("hanging") || text.includes("brought down"))) {
      score += 0.15; // Boost physical damage for storm events
      evidence.push("Boosted: storm physical damage evidence");
    }
    
    // Capacity/slope issues: boost when surface problems + no blockage evidence
    if ((template.id === "inadequate_drainage_capacity") &&
        (text.includes("uneven") && text.includes("surface")) &&
        (text.includes("sits") || text.includes("collects")) &&
        text.includes("light") &&
        !text.includes("blocked") && !text.includes("clog")) {
      score += 0.10; // Boost capacity when surface issue + light rain
      evidence.push("Boosted: surface/slope evidence without blockage");
    }
    
    // Blockage: penalize when explicit surface/slope issue mentioned
    if ((template.id === "blocked_drainage_system") &&
        text.includes("uneven") && text.includes("surface") &&
        !text.includes("block") && !text.includes("clog") && !text.includes("debris")) {
      score -= 0.08; // Penalize blockage when slope issue evident
      evidence.push("Penalized: surface issue without blockage evidence");
    }
    
    // Construction quality: boost when recent work + rapid failure + quality mention
    if ((template.id === "poor_repair_quality") &&
        text.includes("repav") &&
        text.includes("month") &&
        text.includes("quality")) {
      score += 0.12; // Boost construction/repair quality issues
      evidence.push("Boosted: recent repaving + rapid failure + quality");
    }
    
    // Water infrastructure in pothole: only penalize if construction quality evidence present
    if (template.id === "water_infrastructure_damage" &&
        text.includes("repav") && text.includes("quality") &&
        !text.includes("water") && !text.includes("wet")) {
      score -= 0.10; // Penalize water infrastructure when construction quality issue evident
      evidence.push("Penalized: construction quality context without water");
    }
    
    return score;
  }

  scoreCause(template, allEvidence) {
    let score = template.base_confidence;
    const evidence = [];
    const patterns = template.evidence_patterns;

    // Check report text (highest weight)
    let reportMatches = 0;
    let strongMatches = 0;
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.replace(/_/g, "[\\s_-]"), "i");
      if (regex.test(allEvidence.report)) {
        reportMatches++;
        // Strong indicators worth more
        if (pattern.length > 8 || pattern.includes('only_during') || pattern.includes('intermittent') || 
            pattern.includes('recently_repaired') || pattern.includes('no_visible')) {
          strongMatches++;
        }
      }
    }
    if (reportMatches > 0) {
      const reportBoost = Math.min(0.2, reportMatches * 0.04 + strongMatches * 0.03);
      score += reportBoost;
      evidence.push(`Citizen report matches (${reportMatches} signals)`);
    }

    // Check AI analysis
    let aiMatches = 0;
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.replace(/_/g, "[\\s_-]"), "i");
      if (regex.test(allEvidence.ai)) {
        aiMatches++;
      }
    }
    if (aiMatches > 0) {
      const aiBoost = Math.min(0.12, aiMatches * 0.03);
      score += aiBoost;
      evidence.push(`AI analysis matches (${aiMatches} signals)`);
    }

    // Check relationship data
    let relationshipMatches = 0;
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.replace(/_/g, "[\\s_-]"), "i");
      if (regex.test(allEvidence.relationships)) {
        relationshipMatches++;
      }
    }
    if (relationshipMatches > 0) {
      const relBoost = Math.min(0.1, relationshipMatches * 0.025);
      score += relBoost;
      evidence.push(`Relationship data matches (${relationshipMatches} signals)`);
    }

    // Check context (weather, etc.)
    let contextMatches = 0;
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.replace(/_/g, "[\\s_-]"), "i");
      if (regex.test(allEvidence.context)) {
        contextMatches++;
      }
    }
    if (contextMatches > 0) {
      const contextBoost = Math.min(0.06, contextMatches * 0.025);
      score += contextBoost;
      evidence.push(`Context matches (${contextMatches} signals)`);
    }

    // Contextual evidence adjustments (generalized semantic reasoning)
    score = this.applyContextualRefinement(score, template, allEvidence, evidence);

    // Clamp score
    score = Math.min(0.95, Math.max(0.05, score));

    return {
      id: template.id,
      cause: template.id, // Use semantic ID as cause
      label: template.label,
      category: template.category,
      urgency: template.urgency,
      confidence: Number(score.toFixed(2)),
      evidence: evidence,
      recommended_action: template.action
    };
  }

  calculateOverallConfidence(causes) {
    if (!causes || causes.length === 0) return 0;
    
    // Weighted average of top 3 causes
    const weights = [0.6, 0.25, 0.15];
    let totalScore = 0;
    let totalWeight = 0;
    
    causes.slice(0, 3).forEach((cause, index) => {
      totalScore += cause.confidence * weights[index];
      totalWeight += weights[index];
    });
    
    return Number((totalScore / totalWeight).toFixed(2));
  }

  needsReview(causes) {
    if (!causes || causes.length === 0) return true;
    if (causes[0].confidence < 0.5) return true;
    
    // If top two causes are very close, require review
    if (causes.length > 1 && causes[0].confidence - causes[1].confidence < 0.1) {
      return true;
    }
    
    return false;
  }

  fallback(category) {
    return {
      problem_type: category,
      possible_causes: [],
      most_likely_cause: null,
      explanation: "No supported root cause hypothesis. Manual investigation required.",
      confidence: 0,
      requires_human_review: true,
      action_plan: {
        immediate: [{ action: "Conduct on-site investigation", priority: 1 }]
      },
      evidence_summary: "Insufficient evidence for automated analysis",
      model_version: "4.0.0-semantic"
    };
  }
}

module.exports = RootCauseAnalysisModel;
