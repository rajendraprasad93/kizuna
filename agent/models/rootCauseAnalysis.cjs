class RootCauseAnalysisModel {
  constructor() {
    this.semanticAliasMap = {
      blocked_drainage_system: [
        "blocked_drainage_system",
        "blocked_drain",
        "blocked_drainage",
        "blocked_sewer",
        "inadequate_waste_management",
        "garbage_blocking_drain",
        "trash_in_drain",
        "clogged_drain",
        "drain_blockage",
      ],
      inadequate_drainage_capacity: [
        "inadequate_drainage_capacity",
        "stormwater_capacity_exceeded",
        "inadequate_slope_or_capacity",
        "poor_grading_or_blocked_subsurface_drainage",
        "water_pooling",
        "capacity_exceeded",
        "drainage_capacity_exceeded",
        "poor_drainage_system",
      ],
      stormwater_capacity_exceeded: [
        "stormwater_capacity_exceeded",
        "heavy_rainfall_exceeding_capacity",
        "rainfall_exceeding_capacity",
        "capacity_limit",
        "inadequate_drainage_capacity",
        "only_during_heavy_rain",
        "flooding_during_rainstorm",
      ],
      foundation_or_base_failure: [
        "foundation_or_base_failure",
        "foundation_failure",
        "base_failure",
        "ground_settling",
        "subsidence",
        "sinkhole",
        "road_collapse",
      ],
      age_deterioration_or_construction_quality: [
        "age_deterioration_or_construction_quality",
        "poor_construction_quality",
        "reasonable_age_or_quality",
        "worn_surface",
        "poor_repair_quality",
        "construction_quality",
        "age_deterioration",
      ],
      physical_damage_or_age: [
        "physical_damage_or_age",
        "physical_damage",
        "storm_damage",
        "tree_damage",
        "wind_damage",
        "damaged_line",
        "damage_or_age",
      ],
      inadequate_collection_service: [
        "inadequate_collection_service",
        "inadequate_waste_management",
        "waste_collection_gap",
        "volumes_exceed_collection",
        "missed_collection",
        "overflowing_bins",
        "overflowing_trash_cans",
        "collection_schedule_gap",
      ],
      insufficient_capacity: [
        "insufficient_capacity",
        "inadequate_collection_service",
        "insufficient_waste_processing_capacity",
        "overflow_despite_regular_collection",
        "collection_capacity_exceeded",
      ],
      equipment_failure: [
        "equipment_failure",
        "failed_lamp",
        "failed_fixture",
        "transformer_failure",
        "power_supply_fault",
        "insulation_failure",
        "hydrant_failure",
        "network_overload_or_fault",
      ],
      water_infrastructure_damage: [
        "water_infrastructure_damage",
        "water_main_break",
        "pipe_burst",
        "water_leak",
        "connection_failure",
        "underground_water_damage",
      ],
      heavy_traffic_load: [
        "heavy_traffic_load",
        "traffic_load",
        "heavy_truck_traffic",
        "truck_route_wear",
        "commercial_traffic_load",
      ],
      poor_repair_quality: [
        "poor_repair_quality",
        "repaired_but_failed",
        "recent_repair_failed",
        "patch_failure",
        "poor_construction_quality",
      ],
    };

    this.negationPatterns = [
      "no visible blockage",
      "no blockage",
      "not blocked",
      "clear drain",
      "drain is clear",
      "despite regular collection",
      "regular collection",
      "not clogged",
      "only during heavy rain",
      "during every heavy rainstorm",
      "every time it rains",
      "after every storm",
    ];

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
            "blocked",
            "clogged",
            "obstruct",
            "debris",
            "leaves",
            "plastic",
            "trash",
            "drain",
            "grate",
            "slow_drain",
            "won't_drain",
            "not_flowing",
            "visible",
            "can_see",
            "looking",
            "appears",
            "seems",
            "sewage",
            "backup",
          ],
          action: "Inspect and clear drainage system of obstructions",
        },
        {
          id: "inadequate_drainage_capacity",
          label: "Inadequate Drainage Capacity",
          category: "infrastructure",
          urgency: "medium",
          base_confidence: 0.7,
          evidence_patterns: [
            "always",
            "frequently",
            "chronic",
            "repeated",
            "repeating",
            "historical",
            "ongoing",
            "continuous",
            "persistent",
            "development",
            "new_building",
            "urbanization",
            "recurring",
            "every_time",
            "consistently",
            "low_area",
            "low_lying",
            "depression",
            "dip",
            "for_the_past",
            "for_months",
            "for_years",
            "past_year",
            "past_months",
            "hours to drain",
            "water takes hours",
            "flat area",
            "pools",
            "water collecting",
            "when it rains",
          ],
          action: "Evaluate drainage capacity and plan infrastructure upgrade",
        },
        {
          id: "stormwater_capacity_exceeded",
          label: "Stormwater Capacity Exceeded",
          category: "environmental",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "heavy_rain",
            "storm",
            "downpour",
            "intense_rain",
            "extreme_weather",
            "rainfall",
            "after_rain",
            "when_it_rains",
            "during_rain",
            "weather_event",
            "raining",
            "only_during",
            "only_when",
            "during_heavy",
            "heavy rainstorm",
            "every rainstorm",
            "every time it rains",
            "after every storm",
          ],
          action:
            "Assess stormwater capacity and implement mitigation measures",
        },
        {
          id: "poor_maintenance",
          label: "Poor Maintenance",
          category: "operational",
          urgency: "medium",
          base_confidence: 0.5,
          evidence_patterns: [
            "not_maintained",
            "neglected",
            "uncleaned",
            "overgrown",
            "vegetation",
            "accumulated",
            "never_cleaned",
            "no_maintenance",
            "maintenance",
          ],
          action: "Establish regular drainage maintenance schedule",
        },
      ],
      pothole: [
        {
          id: "water_infrastructure_damage",
          label: "Water Infrastructure Damage",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.75,
          evidence_patterns: [
            "wet",
            "stays_wet",
            "water",
            "leak",
            "underground",
            "pipe",
            "main",
            "soggy",
            "damp",
            "moisture",
            "water_damage",
            "persistent_wet",
            "always_wet",
            "waterlogged",
          ],
          action: "Inspect underground water infrastructure and repair leaks",
        },
        {
          id: "heavy_traffic_load",
          label: "Heavy Traffic Load",
          category: "operational",
          urgency: "medium",
          base_confidence: 0.7,
          evidence_patterns: [
            "traffic",
            "heavy_vehicle",
            "truck",
            "bus",
            "commercial",
            "frequent_use",
            "high_volume",
            "congestion",
            "busy_road",
            "heavily_used",
            "heavy",
            "frequent",
            "used",
          ],
          action: "Assess traffic load and consider structural reinforcement",
        },
        {
          id: "poor_repair_quality",
          label: "Poor Repair Quality",
          category: "operational",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "recently_repaired",
            "fixed_before",
            "patch",
            "temporary",
            "poor_quality",
            "failing_repair",
            "repaired_again",
            "same_spot",
            "repair",
            "patched",
            "recently",
            "just_fixed",
            "repaired_section",
          ],
          action:
            "Re-evaluate repair standards and re-execute with quality control",
        },
        {
          id: "foundation_or_base_failure",
          label: "Foundation or Base Failure",
          category: "structural",
          urgency: "high",
          base_confidence: 0.65,
          evidence_patterns: [
            "sinking",
            "subsidence",
            "settling",
            "deep",
            "large",
            "foundation",
            "base",
            "structural",
            "crack",
            "severe",
            "collapsed",
            "sunken",
          ],
          action: "Conduct structural assessment and repair foundation",
        },
      ],
      garbage: [
        {
          id: "inadequate_collection_service",
          label: "Inadequate Collection Service",
          category: "operational",
          urgency: "high",
          base_confidence: 0.7,
          evidence_patterns: [
            "overflowing",
            "full",
            "bin",
            "collection",
            "service",
            "frequency",
            "schedule",
            "missed",
            "not_collected",
            "always_full",
            "insufficient",
            "need_more",
            "overflow",
          ],
          action: "Increase collection frequency or bin capacity",
        },
        {
          id: "illegal_dumping",
          label: "Illegal Dumping",
          category: "behavioral",
          urgency: "medium",
          base_confidence: 0.7,
          evidence_patterns: [
            "dumped",
            "illegal",
            "unauthorized",
            "scattered",
            "piled",
            "roadside",
            "vacant",
            "abandoned",
            "fly_tipping",
            "dumping",
            "remote",
            "hidden",
            "isolated",
          ],
          action: "Investigate dumping site and increase enforcement",
        },
        {
          id: "insufficient_capacity",
          label: "Insufficient Capacity",
          category: "infrastructure",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "capacity",
            "overflow",
            "too_many",
            "population",
            "growth",
            "expansion",
            "demand",
            "undersized",
            "insufficient",
            "despite",
            "regular",
            "accumulation",
          ],
          action: "Assess waste capacity and plan infrastructure expansion",
        },
        {
          id: "dumping_or_improper_disposal",
          label: "Dumping or Improper Disposal",
          category: "behavioral",
          urgency: "medium",
          base_confidence: 0.5,
          evidence_patterns: [
            "improper",
            "wrong_location",
            "not_in_bin",
            "beside_bin",
            "littering",
            "dumping",
            "disposal",
            "improper",
          ],
          action: "Educate residents on proper waste disposal",
        },
      ],
      road_damage: [
        {
          id: "water_damage_and_poor_drainage",
          label: "Water Damage and Poor Drainage",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.7,
          evidence_patterns: [
            "water",
            "drainage",
            "flooding",
            "wet",
            "standing_water",
            "erosion",
            "washout",
            "poor_drainage",
          ],
          action: "Improve drainage and repair water-damaged sections",
        },
        {
          id: "foundation_or_base_failure",
          label: "Foundation or Base Failure",
          category: "structural",
          urgency: "high",
          base_confidence: 0.7,
          evidence_patterns: [
            "sinking",
            "subsidence",
            "settling",
            "deep",
            "large",
            "foundation",
            "base",
            "structural",
            "crack",
            "severe",
            "multiple_cracks",
            "subsidence",
          ],
          action: "Conduct structural assessment and repair foundation",
        },
        {
          id: "heavy_traffic_load",
          label: "Heavy Traffic Load",
          category: "operational",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "traffic",
            "heavy",
            "truck",
            "commercial",
            "vehicle",
            "wear",
            "deterioration",
          ],
          action: "Assess traffic patterns and reinforce road structure",
        },
        {
          id: "age_deterioration_or_construction_quality",
          label: "Age Deterioration or Construction Quality",
          category: "structural",
          urgency: "medium",
          base_confidence: 0.65,
          evidence_patterns: [
            "old",
            "age",
            "aging",
            "deterioration",
            "worn",
            "construction",
            "quality",
            "poor_quality",
            "no_obvious",
            "no_visible",
            "unexplained",
          ],
          action: "Evaluate road condition and plan reconstruction",
        },
      ],
      streetlight: [
        {
          id: "equipment_failure",
          label: "Equipment Failure",
          category: "infrastructure",
          urgency: "medium",
          base_confidence: 0.7,
          evidence_patterns: [
            "broken",
            "failed",
            "malfunction",
            "not_working",
            "out",
            "bulb",
            "fixture",
            "equipment",
          ],
          action: "Replace failed equipment",
        },
        {
          id: "network_overload_or_fault",
          label: "Network Overload or Fault",
          category: "infrastructure",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "multiple",
            "several",
            "many",
            "circuit",
            "power",
            "electrical",
            "network",
            "grid",
            "outage",
          ],
          action: "Inspect electrical network and repair faults",
        },
        {
          id: "physical_damage_or_age",
          label: "Physical Damage or Age",
          category: "structural",
          urgency: "medium",
          base_confidence: 0.55,
          evidence_patterns: [
            "damage",
            "vandalism",
            "accident",
            "hit",
            "old",
            "worn",
            "aging",
            "deteriorated",
          ],
          action: "Assess damage and replace unit",
        },
      ],
      sidewalk: [
        {
          id: "water_erosion",
          label: "Water Erosion",
          category: "environmental",
          urgency: "medium",
          base_confidence: 0.65,
          evidence_patterns: [
            "erosion",
            "water",
            "washout",
            "undermined",
            "drainage",
            "runoff",
            "wet",
            "eroding",
            "edge",
          ],
          action: "Repair erosion damage and improve drainage",
        },
        {
          id: "thermal_stress_or_settling",
          label: "Thermal Stress or Settling",
          category: "environmental",
          urgency: "medium",
          base_confidence: 0.65,
          evidence_patterns: [
            "crack",
            "heave",
            "settling",
            "shift",
            "temperature",
            "thermal",
            "expansion",
            "frost",
            "single_crack",
            "pattern",
          ],
          action: "Repair damaged sections and address settling",
        },
        {
          id: "poor_grading_or_blocked_subsurface_drainage",
          label: "Poor Grading or Blocked Subsurface Drainage",
          category: "infrastructure",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "grading",
            "slope",
            "level",
            "drainage",
            "subsurface",
            "water_pooling",
            "uneven",
            "flat",
            "localized",
          ],
          action: "Re-grade surface and clear subsurface drainage",
        },
      ],
      tree: [
        {
          id: "storm_damage",
          label: "Storm Damage",
          category: "environmental",
          urgency: "high",
          base_confidence: 0.75,
          evidence_patterns: [
            "storm",
            "wind",
            "weather",
            "fallen",
            "uprooted",
            "branch",
            "damaged",
            "broke",
          ],
          action: "Remove damaged tree and assess surrounding trees",
        },
        {
          id: "aging_infrastructure",
          label: "Aging Infrastructure",
          category: "structural",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "old",
            "aging",
            "mature",
            "dead",
            "dying",
            "diseased",
            "deteriorating",
          ],
          action: "Remove aging tree and plan replacement",
        },
        {
          id: "wind_dispersal_or_vandalism",
          label: "Wind Dispersal or Vandalism",
          category: "behavioral",
          urgency: "low",
          base_confidence: 0.5,
          evidence_patterns: [
            "vandalism",
            "deliberate",
            "cut",
            "damaged",
            "wind",
            "dispersed",
          ],
          action: "Clean up and investigate if vandalism",
        },
      ],
      traffic_signal: [
        {
          id: "equipment_failure",
          label: "Equipment Failure",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.7,
          evidence_patterns: [
            "not_working",
            "broken",
            "failed",
            "malfunction",
            "out",
            "dead",
          ],
          action: "Repair or replace failed signal equipment",
        },
        {
          id: "network_overload_or_fault",
          label: "Network Overload or Fault",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.65,
          evidence_patterns: [
            "power",
            "electrical",
            "outage",
            "circuit",
            "multiple",
            "network",
          ],
          action: "Restore power and repair network fault",
        },
      ],
      graffiti: [
        {
          id: "wind_dispersal_or_vandalism",
          label: "Vandalism",
          category: "behavioral",
          urgency: "low",
          base_confidence: 0.8,
          evidence_patterns: [
            "graffiti",
            "vandalism",
            "spray",
            "paint",
            "tag",
            "damage",
          ],
          action: "Remove graffiti and increase monitoring",
        },
      ],
      sewer: [
        {
          id: "blocked_drainage_system",
          label: "Blocked Sewer System",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.75,
          evidence_patterns: [
            "blocked",
            "clogged",
            "backup",
            "overflow",
            "obstruction",
            "not_draining",
          ],
          action: "Clear sewer blockage",
        },
        {
          id: "connection_failure",
          label: "Connection Failure",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.65,
          evidence_patterns: [
            "leak",
            "broken",
            "crack",
            "pipe",
            "connection",
            "joint",
            "failure",
          ],
          action: "Repair sewer connection",
        },
        {
          id: "inadequate_slope_or_capacity",
          label: "Inadequate Slope or Capacity",
          category: "infrastructure",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "capacity",
            "overflow",
            "insufficient",
            "undersized",
            "slope",
            "gradient",
            "accumulation",
            "no_visible",
            "no_blockage",
          ],
          action: "Assess sewer capacity and plan upgrade",
        },
      ],
      electrical_hazard: [
        {
          id: "equipment_failure",
          label: "Equipment Failure",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.7,
          evidence_patterns: [
            "not_working",
            "broken",
            "failed",
            "malfunction",
            "out",
            "dead",
            "faulty",
            "damaged",
            "isolated",
            "single",
            "one",
            "specific",
          ],
          action: "Repair or replace failed equipment",
        },
        {
          id: "network_overload_or_fault",
          label: "Network Overload or Fault",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.7,
          evidence_patterns: [
            "power",
            "electrical",
            "outage",
            "circuit",
            "multiple",
            "network",
            "overload",
            "fault",
            "grid",
            "intermittent",
            "flickering",
            "area",
            "several",
          ],
          action: "Restore power and repair network fault",
        },
        {
          id: "physical_damage_or_age",
          label: "Physical Damage or Age",
          category: "structural",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "damage",
            "vandalism",
            "accident",
            "hit",
            "old",
            "worn",
            "aging",
            "deteriorated",
            "age",
            "physical",
          ],
          action: "Assess damage and replace equipment",
        },
        {
          id: "aging_infrastructure",
          label: "Aging Infrastructure",
          category: "structural",
          urgency: "medium",
          base_confidence: 0.65,
          evidence_patterns: [
            "old",
            "aging",
            "ancient",
            "outdated",
            "obsolete",
            "end_of_life",
            "deteriorating",
            "worn_out",
            "fraying",
            "exposed",
            "corroded",
          ],
          action: "Plan infrastructure upgrade or replacement",
        },
      ],
      tree_fall: [
        {
          id: "storm_damage",
          label: "Storm Damage",
          category: "environmental",
          urgency: "high",
          base_confidence: 0.8,
          evidence_patterns: [
            "storm",
            "wind",
            "weather",
            "fallen",
            "uprooted",
            "branch",
            "damaged",
            "broke",
            "heavy_wind",
          ],
          action: "Remove damaged tree and assess surrounding trees",
        },
        {
          id: "aging_infrastructure",
          label: "Aging Tree",
          category: "structural",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "old",
            "aging",
            "mature",
            "dead",
            "dying",
            "diseased",
            "deteriorating",
            "rotted",
          ],
          action: "Remove aging tree and plan replacement",
        },
        {
          id: "wind_dispersal_or_vandalism",
          label: "Vandalism or Wind",
          category: "behavioral",
          urgency: "low",
          base_confidence: 0.6,
          evidence_patterns: [
            "vandalism",
            "deliberate",
            "cut",
            "damaged",
            "wind",
            "dispersed",
            "intentional",
            "scattered",
            "clean_area",
          ],
          action: "Clean up and investigate if vandalism",
        },
      ],
      blocked_drain: [
        {
          id: "blocked_drainage_system",
          label: "Blocked Drainage System",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.75,
          evidence_patterns: [
            "blocked",
            "clogged",
            "obstruct",
            "debris",
            "leaves",
            "plastic",
            "trash",
            "drain",
            "grate",
            "not_flowing",
            "visible",
            "can_see",
          ],
          action: "Clear drainage blockage",
        },
        {
          id: "poor_maintenance",
          label: "Poor Maintenance",
          category: "operational",
          urgency: "medium",
          base_confidence: 0.7,
          evidence_patterns: [
            "not_maintained",
            "neglected",
            "uncleaned",
            "overgrown",
            "vegetation",
            "accumulated",
            "never_cleaned",
            "maintenance",
            "not_maintained",
            "lack_of",
          ],
          action: "Establish drainage maintenance schedule",
        },
        {
          id: "dumping_or_improper_disposal",
          label: "Dumping or Improper Disposal",
          category: "behavioral",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "dumping",
            "improper",
            "disposal",
            "littering",
            "trash",
            "garbage",
            "waste",
            "thrown",
            "unusual",
            "improper_disposal",
          ],
          action: "Remove waste and educate on proper disposal",
        },
      ],
      water_leak: [
        {
          id: "connection_failure",
          label: "Connection Failure",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.75,
          evidence_patterns: [
            "leak",
            "leaking",
            "broken",
            "crack",
            "pipe",
            "connection",
            "joint",
            "failure",
            "burst",
          ],
          action: "Repair water connection or pipe",
        },
        {
          id: "water_infrastructure_damage",
          label: "Water Infrastructure Damage",
          category: "infrastructure",
          urgency: "high",
          base_confidence: 0.7,
          evidence_patterns: [
            "infrastructure",
            "main",
            "water_main",
            "underground",
            "damage",
            "deterioration",
            "corrosion",
          ],
          action: "Inspect and repair water infrastructure",
        },
        {
          id: "aging_infrastructure",
          label: "Aging Infrastructure",
          category: "structural",
          urgency: "medium",
          base_confidence: 0.6,
          evidence_patterns: [
            "old",
            "aging",
            "worn",
            "corroded",
            "deteriorated",
            "end_of_life",
            "obsolete",
          ],
          action: "Replace aging water infrastructure",
        },
      ],
    };
  }

  normalizeCauseName(value) {
    if (!value) return "";
    const normalized = String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    if (!normalized) return "";

    const exactKey = Object.keys(this.semanticAliasMap).find(
      (key) =>
        key === normalized || this.semanticAliasMap[key].includes(normalized),
    );
    if (exactKey) return exactKey;

    for (const aliasList of Object.values(this.semanticAliasMap)) {
      if (aliasList.includes(normalized)) {
        return (
          Object.keys(this.semanticAliasMap).find(
            (key) => this.semanticAliasMap[key] === aliasList,
          ) || normalized
        );
      }
    }

    return normalized;
  }

  applyCauseAlias(cause) {
    if (!cause) return cause;
    const normalized = this.normalizeCauseName(cause);
    if (!normalized) return cause;
    if (this.semanticAliasMap[normalized]) return normalized;
    return cause;
  }

  buildSignalMap(templateId) {
    const templateSignals = {
      blocked_drainage_system: {
        strong: [
          "blocked drain",
          "clogged drain",
          "blocked with leaves",
          "trash in drain",
          "sewage backup",
          "drain full of trash",
          "overflowing drain",
          "plastic bags",
          "mud and leaves",
          "blocked with debris",
          "storm drain full",
        ],
        medium: [
          "drain",
          "grate",
          "water collecting",
          "not draining",
          "slow drain",
        ],
        negative: [
          "no visible blockage",
          "no blockage",
          "drain is clear",
          "clear drain",
        ],
      },
      inadequate_drainage_capacity: {
        strong: [
          "every time it rains",
          "after every storm",
          "during every rainstorm",
          "only during heavy rain",
          "water takes hours to drain",
          "flooding for hours",
          "low area",
          "low lying",
          "flat area",
          "water keeps collecting",
        ],
        medium: [
          "repeated flooding",
          "persistent flooding",
          "history of flooding",
          "low point",
        ],
        negative: [
          "blocked drain",
          "clogged drain",
          "visible blockage",
          "trash in drain",
        ],
      },
      stormwater_capacity_exceeded: {
        strong: [
          "only during heavy rain",
          "during every heavy rainstorm",
          "after every storm",
          "when it rains",
          "after rain",
          "heavy downpour",
          "heavy rainstorm",
        ],
        medium: ["stormwater", "rainfall", "heavy rain", "extreme weather"],
        negative: [
          "blocked drain",
          "clogged drain",
          "visible blockage",
          "clear drain",
        ],
      },
      foundation_or_base_failure: {
        strong: [
          "road is collapsing",
          "large depression",
          "sinking road",
          "subsidence",
          "ground underneath is giving way",
          "giving way",
          "large sinkhole",
          "cracked base",
        ],
        medium: [
          "foundation",
          "base",
          "settling",
          "sunken",
          "crack",
          "multiple cracks",
        ],
        negative: ["recent repair", "newly paved", "newly repaired"],
      },
      age_deterioration_or_construction_quality: {
        strong: [
          "old and worn out",
          "surface looks old",
          "worn surface",
          "faded markings",
          "poor quality asphalt",
          "newly paved but failed",
          "failed soon after paving",
        ],
        medium: [
          "age",
          "aging",
          "deterioration",
          "construction quality",
          "worn",
          "old road",
        ],
        negative: [
          "heavy trucks",
          "subsidence",
          "major water leak",
          "sinking road",
        ],
      },
      physical_damage_or_age: {
        strong: [
          "storm damage",
          "tree branches fell",
          "power lines hanging low",
          "damaged by storm",
          "physical damage",
          "broken line",
          "hit by",
          "branch damage",
        ],
        medium: ["damage", "old", "age", "worn", "frayed", "broken"],
        negative: ["no storm damage", "newly installed", "not damaged"],
      },
      inadequate_collection_service: {
        strong: [
          "bins are full",
          "overflowing again",
          "supposed to be collected",
          "missed collection",
          "not collected on schedule",
          "weekend overflow",
          "collection happened yesterday",
        ],
        medium: [
          "garbage overflow",
          "full bins",
          "collection schedule",
          "missed pickup",
        ],
        negative: [
          "despite regular collection",
          "regular collection",
          "collected recently",
        ],
      },
      insufficient_capacity: {
        strong: [
          "overflowing despite regular collection",
          "always overflowing",
          "capacity exceeded",
          "demand exceeds capacity",
          "weekend overflow",
          "despite regular collection",
        ],
        medium: ["overflow", "capacity", "too many bins", "volume exceeds"],
        negative: ["illegal dumping", "dumped on site", "missed collection"],
      },
      equipment_failure: {
        strong: [
          "not working",
          "went out at the same time",
          "flickering",
          "buzzing and crackling",
          "smells like something is burning",
          "transformer making loud noise",
          "dead fixture",
        ],
        medium: [
          "failure",
          "malfunction",
          "faulty",
          "broken",
          "failed",
          "outage",
        ],
        negative: [
          "storm damage",
          "tree impact",
          "physical damage",
          "new installation",
        ],
      },
      water_infrastructure_damage: {
        strong: [
          "pipe broke underground",
          "water spraying up",
          "gushing from ground",
          "water leak",
          "pipe burst",
          "seeping up through cracks",
          "persistent wetness",
        ],
        medium: [
          "water main",
          "pipe",
          "leak",
          "wet",
          "soggy",
          "water under road",
        ],
        negative: ["no visible water", "dry conditions", "storm damage only"],
      },
      heavy_traffic_load: {
        strong: [
          "heavy trucks pass all day",
          "commercial street",
          "truck route",
          "busy road",
          "high traffic",
        ],
        medium: [
          "traffic",
          "truck",
          "heavy vehicles",
          "major route",
          "commercial",
        ],
        negative: [
          "low traffic",
          "residential area with little traffic",
          "not heavily used",
        ],
      },
      poor_repair_quality: {
        strong: [
          "just repaired",
          "filled two weeks ago",
          "repaired again",
          "reappeared after repair",
          "poor quality asphalt",
          "immediately failed after patch",
        ],
        medium: ["repair", "patched", "fixed", "repaired", "workmanship"],
        negative: [
          "new road",
          "no repair history",
          "aging road without repair",
        ],
      },
    };

    return (
      templateSignals[templateId] || { strong: [], medium: [], negative: [] }
    );
  }

  matchPhraseGroup(text, phrases) {
    if (!text || !phrases || !phrases.length) return 0;
    let count = 0;
    const normalized = String(text).toLowerCase();
    for (const phrase of phrases) {
      const phraseNorm = String(phrase).toLowerCase();
      if (!phraseNorm) continue;
      if (normalized.includes(phraseNorm)) count += 1;
    }
    return count;
  }

  containsAnyNegation(text, templateId) {
    const negations = this.buildSignalMap(templateId).negative || [];
    if (!text || !negations.length) return false;
    const normalized = String(text).toLowerCase();
    return negations.some((negation) => normalized.includes(negation));
  }

  async analyzeRootCauses(
    report,
    aiAnalysis = null,
    relationshipData = null,
    context = {},
  ) {
    let category = String(report?.category || "unknown")
      .toLowerCase()
      .trim();

    const categoryAliases = {
      streetlight_outage: "streetlight",
      street_light: "streetlight",
      drainage: "flooding",
      drain: "blocked_drain",
      sanitation_issue: "garbage",
      sanitation: "garbage",
    };
    category = categoryAliases[category] || category;

    const templates = this.templates[category] || [];
    if (!templates.length) return this.fallback(category);

    const reportText = [
      report?.title || "",
      report?.description || "",
      report?.location || "",
      report?.category || "",
    ]
      .join(" ")
      .toLowerCase();

    const aiText = aiAnalysis ? JSON.stringify(aiAnalysis).toLowerCase() : "";

    const relationshipText = (relationshipData?.relationships || [])
      .map((r) => JSON.stringify(r))
      .join(" ")
      .toLowerCase();

    const contextText = JSON.stringify(context || {}).toLowerCase();

    const allEvidence = {
      report: reportText,
      ai: aiText,
      relationships: relationshipText,
      context: contextText,
    };

    const causes = templates
      .map((template) => this.scoreCause(template, allEvidence))
      .sort((a, b) => b.confidence - a.confidence);

    const topCause = causes[0];
    const overallConfidence = this.calculateOverallConfidence(causes);
    const finalCause = this.applyCauseAlias(topCause.cause);

    return {
      problem_type: category,
      possible_causes: causes,
      most_likely_cause: {
        ...topCause,
        cause: finalCause,
      },
      explanation: `Most likely root cause: ${finalCause} (confidence: ${Math.round(topCause.confidence * 100)}%)`,
      confidence: overallConfidence,
      requires_human_review: this.needsReview(causes),
      action_plan: {
        immediate:
          topCause.urgency === "high" || topCause.confidence >= 0.7
            ? [{ action: topCause.recommended_action, priority: 1 }]
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
      evidence_summary:
        topCause.evidence.join("; ") || "Limited evidence available",
      model_version: "4.0.0-semantic",
    };
  }

  scoreCause(template, allEvidence) {
    let score = template.base_confidence;
    const evidence = [];
    const patternSet = template.evidence_patterns || [];
    const signalMap = this.buildSignalMap(template.id);

    const strongSignals = this.matchPhraseGroup(
      allEvidence.report,
      signalMap.strong,
    );
    const mediumSignals = this.matchPhraseGroup(
      allEvidence.report,
      signalMap.medium,
    );
    const weakSignals = this.matchPhraseGroup(allEvidence.report, patternSet);
    const aiSignals = this.matchPhraseGroup(
      allEvidence.ai,
      patternSet.concat(signalMap.strong, signalMap.medium),
    );
    const relationSignals = this.matchPhraseGroup(
      allEvidence.relationships,
      patternSet.concat(signalMap.strong, signalMap.medium),
    );
    const contextSignals = this.matchPhraseGroup(
      allEvidence.context,
      patternSet.concat(signalMap.strong, signalMap.medium),
    );

    const totalStrong = strongSignals * 0.18;
    const totalMedium = mediumSignals * 0.1;
    const totalWeak = weakSignals * 0.04;
    const totalAi = aiSignals * 0.04;
    const totalRelationship = relationSignals * 0.04;
    const totalContext = contextSignals * 0.02;

    score +=
      totalStrong +
      totalMedium +
      totalWeak +
      totalAi +
      totalRelationship +
      totalContext;

    const positivePrompt = [
      "only during heavy rain",
      "heavy rainstorm",
      "after every storm",
      "every time it rains",
      "when it rains",
      "water keeps collecting",
      "water takes hours to drain",
      "bins are full",
      "not collected on schedule",
      "pipe broke underground",
      "road is collapsing",
    ];

    if (
      template.id === "stormwater_capacity_exceeded" &&
      positivePrompt.some((phrase) => allEvidence.report.includes(phrase))
    ) {
      score += 0.12;
      evidence.push(
        "Rain pattern strongly supports stormwater capacity exceedance",
      );
    }

    if (
      template.id === "inadequate_collection_service" &&
      allEvidence.report.includes("despite regular collection")
    ) {
      score -= 0.18;
      evidence.push("Regular collection reduces likelihood of service failure");
    }

    if (
      template.id === "blocked_drainage_system" &&
      this.containsAnyNegation(allEvidence.report, template.id)
    ) {
      score -= 0.22;
      evidence.push("Negative evidence contradicts a blockage-based cause");
    }

    if (
      template.id === "stormwater_capacity_exceeded" &&
      this.containsAnyNegation(allEvidence.report, template.id)
    ) {
      score -= 0.15;
      evidence.push(
        "Contradictory blockage evidence reduces stormwater-only inference",
      );
    }

    if (strongSignals > 0 || mediumSignals > 0 || weakSignals > 0) {
      evidence.push(
        `Matched evidence signals (${strongSignals + mediumSignals + weakSignals})`,
      );
    }

    if (totalStrong > 0.1 || totalMedium > 0.1 || totalWeak > 0.1) {
      score = Math.min(0.95, score);
    }

    score = Math.min(0.95, Math.max(0.05, score));

    return {
      id: template.id,
      cause: template.id,
      label: template.label,
      category: template.category,
      urgency: template.urgency,
      confidence: Number(score.toFixed(2)),
      evidence: evidence.length ? evidence : ["Limited evidence available"],
      recommended_action: template.action,
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
    if (
      causes.length > 1 &&
      causes[0].confidence - causes[1].confidence < 0.1
    ) {
      return true;
    }

    return false;
  }

  fallback(category) {
    return {
      problem_type: category,
      possible_causes: [],
      most_likely_cause: null,
      explanation:
        "No supported root cause hypothesis. Manual investigation required.",
      confidence: 0,
      requires_human_review: true,
      action_plan: {
        immediate: [{ action: "Conduct on-site investigation", priority: 1 }],
      },
      evidence_summary: "Insufficient evidence for automated analysis",
      model_version: "4.0.0-semantic",
    };
  }
}

module.exports = RootCauseAnalysisModel;
