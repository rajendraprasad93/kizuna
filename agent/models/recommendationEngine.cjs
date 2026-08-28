/**
 * Kizuna Model 4: Recommendation Engine
 *
 * Input:
 *   report + Model 3 root-cause result + department status
 *
 * Output:
 *   prioritized actionable recommendations, department/resource
 *   feasibility, estimated cost/time, and involved departments.
 *
 * NOTE:
 * Recommendations are decision-support suggestions. They should not
 * automatically authorize physical work or spending.
 */

class RecommendationEngine {
  constructor() {
    this.departmentCapabilities = {
      "Drainage Department": {
        services: [
          "drain_cleaning",
          "drain_repair",
          "cctv_inspection",
          "water_pumping",
        ],
        response_time: {
          emergency: "1-2 hours",
          high: "4-8 hours",
          medium: "24-48 hours",
          low: "3-5 days",
        },
        equipment: [
          "drain_cleaning_truck",
          "cctv_camera",
          "pumping_equipment",
          "inspection_tools",
        ],
        staff: ["field_technicians", "supervisors", "engineers"],
        max_capacity: 10,
      },
      "Roads Department": {
        services: [
          "road_repair",
          "pothole_filling",
          "asphalt_patching",
          "road_resurfacing",
        ],
        response_time: {
          emergency: "2-4 hours",
          high: "6-12 hours",
          medium: "1-2 days",
          low: "3-7 days",
        },
        equipment: [
          "road_repair_truck",
          "compactor",
          "asphalt_paver",
          "excavator",
        ],
        staff: ["road_workers", "engineers", "quality_control"],
        max_capacity: 8,
      },
      "Sanitation Department": {
        services: [
          "waste_collection",
          "garbage_removal",
          "recycling",
          "street_sweeping",
        ],
        response_time: {
          emergency: "2-4 hours",
          high: "8-12 hours",
          medium: "1-2 days",
          low: "2-4 days",
        },
        equipment: [
          "collection_trucks",
          "compactors",
          "sweepers",
          "waste_separation",
        ],
        staff: ["collectors", "drivers", "supervisors"],
        max_capacity: 15,
      },
      "City Planning Department": {
        services: [
          "urban_planning",
          "infrastructure_design",
          "zoning_review",
          "project_management",
        ],
        response_time: {
          emergency: "24-48 hours",
          high: "2-4 days",
          medium: "1-2 weeks",
          low: "1-3 months",
        },
        equipment: ["design_software", "gis_tools", "project_management"],
        staff: ["planners", "architects", "engineers", "project_managers"],
        max_capacity: 5,
      },
      "Environmental Department": {
        services: [
          "environmental_assessment",
          "pollution_control",
          "waste_management",
          "climate_adaptation",
        ],
        response_time: {
          emergency: "12-24 hours",
          high: "2-4 days",
          medium: "1-2 weeks",
          low: "1-2 months",
        },
        equipment: ["monitoring_equipment", "lab_equipment"],
        staff: ["environmental_scientists", "inspectors"],
        max_capacity: 4,
      },
      "Emergency Services": {
        services: [
          "emergency_response",
          "disaster_management",
          "evacuation",
          "public_safety",
        ],
        response_time: {
          emergency: "15-30 minutes",
          high: "1-2 hours",
          medium: "4-8 hours",
          low: "12-24 hours",
        },
        equipment: ["emergency_vehicles", "communication_systems", "first_aid"],
        staff: ["first_responders", "command_staff"],
        max_capacity: 20,
      },
      "General Department": {
        services: ["general_operations", "coordination", "investigation"],
        response_time: {
          emergency: "2-4 hours",
          high: "8-12 hours",
          medium: "24-48 hours",
          low: "3-5 days",
        },
        equipment: ["communication_tools", "vehicles", "inspection_tools"],
        staff: ["general_staff", "coordinators"],
        max_capacity: 10,
      },
      "Electrical Department": {
        services: [
          "electrical_repair",
          "lighting_repair",
          "fault_isolation",
          "safety_inspection",
        ],
        response_time: {
          emergency: "1-2 hours",
          high: "4-8 hours",
          medium: "1-2 days",
          low: "2-5 days",
        },
        equipment: ["electrical_tools", "test_equipment", "safety_barriers"],
        staff: ["electricians", "technicians", "supervisors"],
        max_capacity: 8,
      },
      "Water Department": {
        services: [
          "water_line_repair",
          "pipe_repair",
          "pressure_testing",
          "water_system_inspection",
        ],
        response_time: {
          emergency: "2-4 hours",
          high: "6-12 hours",
          medium: "1-2 days",
          low: "3-7 days",
        },
        equipment: ["pipe_tools", "testing_equipment", "isolation_valves"],
        staff: ["water_operators", "engineers", "technicians"],
        max_capacity: 6,
      },
    };

    this.timeValueMap = {
      "15-30 minutes": 0.25,
      "1-2 hours": 1.5,
      "2-4 hours": 3,
      "4-8 hours": 6,
      "8-12 hours": 10,
      "24-48 hours": 36,
      "1-2 days": 36,
      "2-3 days": 60,
      "2-5 days": 84,
      "1-2 weeks": 168,
      "1-3 months": 1080,
      "3-6 months": 3240,
      "6-12 months": 6480,
    };
    this.costValueMap = { low: 1, medium: 2, high: 3, very_high: 4 };

    this.rootCauseAliases = {
      blocked_drainage: [
        "Blocked Drainage",
        "Blocked Drainage System",
        "Poor Drainage System",
        "blocked_drain",
        "drainage obstruction",
        "Blocked Drain",
        "waste clogged drain",
        "waste-clogged drain",
      ],
      flooding: [
        "Flooding",
        "Localized Flooding",
        "Water Accumulation",
        "Standing Water",
        "Flood Water",
      ],
      road_damage: [
        "Road Damage",
        "Damaged Road",
        "Damaged Carriageway",
        "Road Surface Damage",
        "Water Damage to Asphalt",
        "pothole",
        "Pothole Damage",
      ],
      heavy_vehicle_traffic: [
        "Heavy Vehicle Traffic",
        "Excessive Heavy Vehicle Traffic",
        "Heavy Traffic Load",
        "Road Load",
      ],
      inadequate_waste_collection: [
        "Inadequate Waste Collection",
        "Waste Collection Failure",
        "Garbage Collection Failure",
        "Overflowing Waste",
      ],
      illegal_dumping: [
        "Illegal Dumping",
        "Unauthorized Dumping",
        "Waste Dumping",
      ],
      streetlight_electrical_fault: [
        "Streetlight Electrical Fault",
        "Electrical Fault",
        "Streetlight Fault",
        "Streetlight Failure",
        "Exposed Electrical Wiring",
        "Lighting Electrical Failure",
      ],
      streetlight_structural_damage: [
        "Streetlight Structural Damage",
        "Damaged Streetlight Pole",
        "Leaning Streetlight Pole",
      ],
      water_supply_leak: [
        "Water Leak",
        "Water Supply Leak",
        "Underground Pipe Failure",
        "Water Pipe Leak",
        "water_leak",
        "Pipe Failure",
      ],
    };

    this.rootCauseCanonicalMap = Object.fromEntries(
      Object.entries(this.rootCauseAliases).flatMap(([canonical, aliases]) =>
        [canonical, ...aliases].map((alias) => [
          this.normalizeText(alias),
          canonical,
        ]),
      ),
    );

    this.templates = {
      flooding: {
        "Blocked Drainage System": {
          immediate: [
            this.action(
              "flood_drain_clean",
              "Clean Blocked Drainage",
              "Inspect and clean drainage to remove blockages",
              1,
              "Drainage Department",
              "4-8 hours",
              "low",
              ["drain_cleaning_truck", "cctv_camera"],
              [
                "Inspect drainage",
                "Identify blockage",
                "Clean blockage",
                "Verify water flow",
                "Capture after-repair evidence",
              ],
              "Water flows freely",
            ),
          ],
          short_term: [
            this.action(
              "flood_drain_repair",
              "Repair Damaged Drainage",
              "Repair structural drainage damage",
              2,
              "Drainage Department",
              "2-3 days",
              "medium",
              ["repair_crew", "construction_materials"],
              [
                "Identify damage",
                "Repair/replace damaged section",
                "Test system",
              ],
              "Drainage is structurally functional",
            ),
          ],
          long_term: [
            this.action(
              "flood_infra_upgrade",
              "Upgrade Drainage Infrastructure",
              "Improve capacity for recurring flooding",
              3,
              "City Planning Department",
              "3-6 months",
              "high",
              ["design_team", "construction_contractors"],
              [
                "Feasibility study",
                "Design",
                "Approvals",
                "Implement",
                "Monitor",
              ],
              "Capacity meets requirements",
            ),
          ],
        },
        "Inadequate Drainage Capacity": {
          immediate: [
            this.action(
              "flood_manage_water",
              "Manage Water Flow",
              "Deploy temporary water management measures",
              1,
              "Drainage Department",
              "4-12 hours",
              "low",
              ["pumping_equipment"],
              [
                "Assess water",
                "Deploy pumps",
                "Divert water",
                "Monitor levels",
              ],
              "Water reaches safe level",
            ),
          ],
          short_term: [
            this.action(
              "flood_capacity_study",
              "Drainage Capacity Study",
              "Study required drainage capacity",
              2,
              "City Planning Department",
              "2-4 weeks",
              "medium",
              ["hydrology_study", "gis_analysis"],
              [
                "Collect rainfall data",
                "Analyze basin",
                "Model scenarios",
                "Recommend capacity",
              ],
              "Capacity requirement documented",
            ),
          ],
          long_term: [
            this.action(
              "flood_capacity_upgrade",
              "Upgrade Drainage Capacity",
              "Implement long-term capacity improvements",
              3,
              "City Planning Department",
              "6-12 months",
              "very_high",
              ["design_team", "construction_contractors"],
              [
                "Finalize design",
                "Funding",
                "Procurement",
                "Construction",
                "Testing",
              ],
              "System meets requirements",
            ),
          ],
        },
        "Garbage Blocking Drainage": {
          immediate: [
            this.action(
              "flood_garbage_clean",
              "Remove Waste From Drainage",
              "Remove waste causing drainage blockage",
              1,
              "Sanitation Department",
              "2-4 hours",
              "low",
              ["collection_trucks"],
              [
                "Dispatch crew",
                "Remove waste",
                "Clean area",
                "Verify drainage",
              ],
              "Waste removed and flow restored",
            ),
          ],
          short_term: [
            this.action(
              "flood_waste_prevention",
              "Improve Waste Collection Near Drain",
              "Reduce repeat blockage",
              2,
              "Sanitation Department",
              "2-5 days",
              "low",
              ["collection_trucks"],
              ["Review collection route", "Increase frequency", "Monitor"],
              "Repeat blockage reduced",
            ),
          ],
          long_term: [
            this.action(
              "flood_joint_infra",
              "Improve Drainage and Waste Infrastructure",
              "Coordinate infrastructure improvements",
              3,
              "City Planning Department",
              "3-6 months",
              "high",
              ["design_team"],
              ["Assess site", "Design", "Approve", "Implement"],
              "Recurring blockage reduced",
            ),
          ],
        },
      },
      pothole: {
        "Water Damage to Asphalt": {
          immediate: [
            this.action(
              "pothole_temp",
              "Temporary Pothole Repair",
              "Restore immediate road safety",
              1,
              "Roads Department",
              "2-4 hours",
              "low",
              ["compactor"],
              [
                "Clean pothole",
                "Apply patch",
                "Compact",
                "Set traffic control",
              ],
              "Surface is safe and level",
            ),
          ],
          short_term: [
            this.action(
              "pothole_perm",
              "Permanent Pothole Repair",
              "Perform durable asphalt repair",
              2,
              "Roads Department",
              "1-2 days",
              "medium",
              ["asphalt_paver", "compactor"],
              ["Cut area", "Remove damage", "Place asphalt", "Compact"],
              "Road surface restored",
            ),
          ],
          long_term: [
            this.action(
              "pothole_drain",
              "Fix Underlying Drainage",
              "Prevent water-related recurrence",
              3,
              "Drainage Department",
              "1-2 weeks",
              "high",
              ["inspection_tools"],
              ["Inspect drainage", "Improve water path", "Verify"],
              "No recurring water accumulation",
            ),
          ],
        },
        "Heavy Traffic Load": {
          immediate: [
            this.action(
              "pothole_safety",
              "Secure Damaged Road Area",
              "Reduce immediate traffic risk",
              1,
              "Roads Department",
              "2-4 hours",
              "low",
              ["traffic_control"],
              ["Mark hazard", "Install warning", "Inspect"],
              "Traffic risk controlled",
            ),
          ],
          short_term: [
            this.action(
              "pothole_load",
              "Assess Road Load",
              "Determine load-related damage",
              2,
              "Roads Department",
              "1-2 weeks",
              "medium",
              ["inspection_tools"],
              ["Traffic assessment", "Road assessment", "Document findings"],
              "Load impact documented",
            ),
          ],
          long_term: [
            this.action(
              "pothole_strengthen",
              "Strengthen Road Structure",
              "Improve road for expected loads",
              3,
              "Roads Department",
              "1-3 months",
              "high",
              ["excavator", "asphalt_paver"],
              ["Design", "Procure", "Construct", "Test"],
              "Road meets design load",
            ),
          ],
        },
      },
      garbage: {
        "Inadequate Waste Collection": {
          immediate: [
            this.action(
              "garbage_clean",
              "Emergency Waste Collection",
              "Remove accumulated waste",
              1,
              "Sanitation Department",
              "2-4 hours",
              "low",
              ["collection_trucks"],
              ["Dispatch", "Collect", "Clean", "Verify"],
              "Area free of accumulated waste",
            ),
          ],
          short_term: [
            this.action(
              "garbage_schedule",
              "Optimize Collection Schedule",
              "Adjust collection frequency and routes",
              2,
              "Sanitation Department",
              "2-5 days",
              "low",
              ["routing_software"],
              ["Analyze routes", "Adjust schedule", "Monitor"],
              "Collection occurs consistently",
            ),
          ],
          long_term: [
            this.action(
              "garbage_infra",
              "Improve Waste Infrastructure",
              "Increase collection and processing capacity",
              3,
              "City Planning Department",
              "3-6 months",
              "high",
              ["design_software"],
              ["Assess", "Design", "Procure", "Implement"],
              "Sustained waste-management improvement",
            ),
          ],
        },
        "Illegal Dumping": {
          immediate: [
            this.action(
              "dump_clean",
              "Remove Illegal Dumping",
              "Clear illegally dumped waste",
              1,
              "Sanitation Department",
              "2-4 hours",
              "low",
              ["collection_trucks"],
              ["Secure area", "Collect waste", "Clean"],
              "Waste removed",
            ),
          ],
          short_term: [
            this.action(
              "dump_monitor",
              "Monitor Dumping Location",
              "Discourage repeat dumping",
              2,
              "Sanitation Department",
              "1-2 weeks",
              "medium",
              ["inspection_tools"],
              ["Identify pattern", "Inspect", "Coordinate monitoring"],
              "Repeat dumping reduced",
            ),
          ],
          long_term: [
            this.action(
              "dump_prevention",
              "Improve Dumping Prevention",
              "Use planning and enforcement measures",
              3,
              "General Department",
              "1-3 months",
              "medium",
              ["communication_tools"],
              ["Assess cause", "Plan intervention", "Monitor"],
              "Illegal dumping reduced",
            ),
          ],
        },
      },
      road_damage: {
        "Road Damage": {
          immediate: [
            this.action(
              "road_temp_safety",
              "Install Temporary Safety Measures",
              "Restrict access and protect the damaged area",
              1,
              "Roads Department",
              "2-4 hours",
              "low",
              ["traffic_control"],
              ["Mark hazard", "Limit access", "Inspect"],
              "Vehicle and pedestrian risk reduced",
            ),
          ],
          short_term: [
            this.action(
              "road_repair",
              "Repair Damaged Road Surface",
              "Restore the damaged carriageway for safe use",
              2,
              "Roads Department",
              "1-2 days",
              "medium",
              ["asphalt_paver", "compactor"],
              ["Cut damaged section", "Prepare base", "Lay asphalt", "Compact"],
              "Road is restored and safe",
            ),
          ],
          long_term: [
            this.action(
              "road_investigate_cause",
              "Investigate Drainage and Load Causes",
              "Review drainage and traffic impacts to prevent recurrence",
              3,
              "City Planning Department",
              "1-3 months",
              "high",
              ["inspection_tools", "gis_tools"],
              [
                "Assess drainage",
                "Review traffic loading",
                "Document root cause",
              ],
              "Structural recurrence is reduced",
            ),
          ],
        },
      },
      streetlight: {
        "Streetlight Electrical Fault": {
          immediate: [
            this.action(
              "streetlight_isolate",
              "Isolate Unsafe Electrical Equipment",
              "De-energize damaged streetlight components and protect the site",
              1,
              "Electrical Department",
              "1-2 hours",
              "low",
              ["safety_barriers", "electrical_tools"],
              ["Secure site", "Isolate circuit", "Inspect fault"],
              "Hazard is isolated",
            ),
          ],
          short_term: [
            this.action(
              "streetlight_repair",
              "Repair Electrical Fault",
              "Repair or replace damaged electrical components",
              2,
              "Electrical Department",
              "1-2 days",
              "medium",
              ["electrical_tools"],
              ["Diagnose fault", "Replace damaged parts", "Verify circuit"],
              "Lighting system is restored",
            ),
          ],
          long_term: [
            this.action(
              "streetlight_infra_review",
              "Inspect Nearby Electrical Infrastructure",
              "Review adjacent lighting systems for broader issues",
              3,
              "Electrical Department",
              "2-5 days",
              "high",
              ["test_equipment"],
              [
                "Survey nearby assets",
                "Check for pattern failures",
                "Document risk",
              ],
              "Broader defect risk is assessed",
            ),
          ],
        },
        "Streetlight Structural Damage": {
          immediate: [
            this.action(
              "streetlight_secure",
              "Secure Hazardous Area",
              "Protect the public from a damaged or leaning light pole",
              1,
              "Emergency Services",
              "1-2 hours",
              "low",
              ["safety_barriers"],
              ["Set barriers", "Warn public", "Restrict access"],
              "Public risk is controlled",
            ),
          ],
          short_term: [
            this.action(
              "streetlight_replace",
              "Repair or Replace Damaged Pole",
              "Restore safe streetlight operation",
              2,
              "Electrical Department",
              "1-2 days",
              "medium",
              ["electrical_tools"],
              ["Assess structure", "Repair or replace pole", "Verify safety"],
              "Pole is structurally stable",
            ),
          ],
          long_term: [
            this.action(
              "streetlight_asset_review",
              "Inspect Nearby Poles and Fixtures",
              "Assess similar streetlight assets for structural risk",
              3,
              "Electrical Department",
              "1-2 weeks",
              "high",
              ["inspection_tools"],
              [
                "Inspect similar assets",
                "Record findings",
                "Schedule maintenance",
              ],
              "Streetlight asset risk is reduced",
            ),
          ],
        },
      },
      water_leak: {
        "Water Leak": {
          immediate: [
            this.action(
              "water_isolate",
              "Isolate Affected Water Line",
              "Prevent further leakage and protect public safety",
              1,
              "Water Department",
              "2-4 hours",
              "low",
              ["isolation_valves"],
              ["Inspect supply", "Isolate line", "Protect area"],
              "Leak is contained",
            ),
          ],
          short_term: [
            this.action(
              "water_repair",
              "Repair Leaking Pipe",
              "Repair the faulty water infrastructure",
              2,
              "Water Department",
              "1-2 days",
              "medium",
              ["pipe_tools"],
              ["Excavate area", "Repair pipe", "Test pressure"],
              "Service is restored",
            ),
          ],
          long_term: [
            this.action(
              "water_infra_lifecycle",
              "Inspect Nearby Water Infrastructure",
              "Review adjacent pipework for repeat failures",
              3,
              "Water Department",
              "2-5 days",
              "high",
              ["testing_equipment"],
              ["Survey nearby lines", "Assess risk", "Document findings"],
              "Repeat leak risk is reduced",
            ),
          ],
        },
      },
    };

    this.normalizedTemplates = this.buildNormalizedTemplates();
  }

  normalizeText(value) {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ");
  }

  buildNormalizedTemplates() {
    return Object.fromEntries(
      Object.entries(this.templates).map(([problemType, causes]) => [
        this.normalizeText(problemType),
        Object.fromEntries(
          Object.entries(causes).map(([causeKey, timeframes]) => [
            this.normalizeText(causeKey),
            timeframes,
          ]),
        ),
      ]),
    );
  }

  canonicalizeRootCause(rootCause) {
    const normalized = this.normalizeText(rootCause);
    if (!normalized) return null;
    return this.rootCauseCanonicalMap[normalized] || null;
  }

  matchCause(problem, rootCause) {
    const normalizedRootCause = this.normalizeText(rootCause);
    const canonicalRootCause = this.canonicalizeRootCause(rootCause);
    if (!normalizedRootCause) return null;

    for (const [causeKey, timeframes] of Object.entries(problem)) {
      const normalizedKey = this.normalizeText(causeKey);
      const canonicalKey = this.canonicalizeRootCause(causeKey);
      if (!normalizedKey) continue;
      if (
        canonicalRootCause &&
        canonicalKey &&
        canonicalRootCause === canonicalKey
      ) {
        return { key: causeKey, timeframes };
      }
      if (
        normalizedRootCause.includes(normalizedKey) ||
        normalizedKey.includes(normalizedRootCause)
      ) {
        return { key: causeKey, timeframes };
      }
    }

    return null;
  }

  action(
    id,
    title,
    description,
    priority,
    department,
    time,
    cost,
    resources,
    steps,
    successCriteria,
  ) {
    return {
      id,
      title,
      description,
      priority,
      department,
      estimatedTime: time,
      estimatedCost: cost,
      resources,
      steps,
      successCriteria,
    };
  }

  async generateRecommendations(
    report,
    rootCauseAnalysis,
    departmentStatus = {},
  ) {
    try {
      const problemType = this.normalizeText(report?.category || "unknown");
      const rawRootCause =
        rootCauseAnalysis?.most_likely_cause?.cause || "Unknown";
      const canonicalRootCause = this.canonicalizeRootCause(rawRootCause);
      const rootCause = canonicalRootCause || rawRootCause;
      const severity = String(
        report?.severity || rootCauseAnalysis?.severity || "medium",
      ).toLowerCase();

      let recs = [];
      const problem =
        this.normalizedTemplates[problemType] || this.templates[problemType];
      if (problem) {
        const matched = this.matchCause(problem, rawRootCause);
        if (matched) {
          for (const timeframe of ["immediate", "short_term", "long_term"]) {
            for (const r of matched.timeframes[timeframe] || []) {
              recs.push(this.process(r, timeframe, severity, departmentStatus));
            }
          }
        }
      }

      if (!recs.length)
        recs = [
          this.process(
            this.action(
              "generic_investigation",
              "Conduct Site Investigation",
              "Collect evidence before selecting an intervention",
              1,
              "General Department",
              "4-8 hours",
              "low",
              ["inspection_tools"],
              [
                "Visit site",
                "Document condition",
                "Collect evidence",
                "Review findings",
              ],
              "Problem is sufficiently understood",
            ),
            "immediate",
            severity,
            departmentStatus,
          ),
        ];

      recs.sort(
        (a, b) =>
          a.actual_priority - b.actual_priority ||
          b.feasibility - a.feasibility,
      );
      const feasibility = this.calculateFeasibility(recs);

      return {
        problem_type: problemType,
        root_cause: rootCause,
        root_cause_confidence:
          rootCauseAnalysis?.most_likely_cause?.confidence ?? null,
        recommendations: recs,
        summary: this.summary(recs),
        feasibility_score: feasibility.score,
        feasibility_notes: feasibility.notes,
        total_actions: recs.length,
        recommended_action: recs[0]?.title || "Manual investigation required",
        estimated_total_cost: this.totalCost(recs),
        estimated_total_time: this.totalTime(recs),
        departments_involved: this.departments(recs),
        timestamp: new Date().toISOString(),
        model_version: "4.0.0",
      };
    } catch (e) {
      return {
        problem_type: "unknown",
        root_cause: "unknown",
        recommendations: [],
        summary: `Recommendation generation failed: ${e.message}`,
        feasibility_score: 0,
        error: e.message,
        model_version: "4.0.0",
      };
    }
  }

  process(rec, timeframe, severity, status) {
    let p = rec.priority;
    if (severity === "emergency") p = Math.max(1, p - 0.5);
    else if (severity === "high") p = Math.max(1, p - 0.25);

    const ds = status[rec.department] || { available: true, load: 0 };
    const cap = this.departmentCapabilities[rec.department];
    const resourceAvailable = this.resourcesAvailable(rec.resources, cap);
    let f = 1;
    if (ds.available === false) f -= 0.3;
    if (!resourceAvailable) f -= 0.2;
    if ((ds.load || 0) > 0.8) f -= 0.2;
    else if ((ds.load || 0) > 0.5) f -= 0.1;
    if (p <= 1) f += 0.1;
    f = Math.max(0, Math.min(1, Number(f.toFixed(2))));

    return {
      ...rec,
      timeframe,
      actual_priority: Number(p.toFixed(2)),
      department_available: ds.available !== false,
      capacity_load: ds.load || 0,
      resources_available: resourceAvailable,
      feasibility: f,
      human_readable: `[${rec.department}] ${rec.title} (${rec.estimatedTime})`,
      department_capabilities: cap
        ? {
            available_services: cap.services,
            equipment: cap.equipment,
            response_time:
              cap.response_time[
                timeframe === "immediate" ? severity : "medium"
              ] || "3-5 days",
          }
        : null,
      resource_requirements: {
        equipment: rec.resources,
        staff: cap?.staff || [],
        estimated_people: this.staff(timeframe),
      },
    };
  }

  resourcesAvailable(resources, cap) {
    if (!resources?.length) return true;
    if (!cap) return false;
    return resources.every((r) =>
      cap.equipment.some(
        (x) =>
          x.toLowerCase().includes(r.toLowerCase()) ||
          r.toLowerCase().includes(x.toLowerCase()),
      ),
    );
  }

  staff(timeframe) {
    return timeframe === "immediate" ? 3 : timeframe === "short_term" ? 2 : 1;
  }

  calculateFeasibility(rs) {
    if (!rs.length) return { score: 0, notes: "No recommendations available" };
    const avg = rs.reduce((s, r) => s + r.feasibility, 0) / rs.length;
    const feasible = rs.filter((r) => r.feasibility > 0.5).length / rs.length;
    const score = Number((avg * 0.7 + feasible * 0.3).toFixed(2));
    const notes =
      score > 0.8
        ? "Recommendations are generally feasible with current resources"
        : score > 0.5
          ? "Some recommendations may require additional resources"
          : "Significant resource constraints identified";
    return { score, notes };
  }

  totalCost(rs) {
    const n = rs.reduce(
      (s, r) => s + (this.costValueMap[r.estimatedCost] || 1),
      0,
    );
    return {
      numeric: n,
      level: n <= 2 ? "low" : n <= 4 ? "medium" : n <= 6 ? "high" : "very_high",
    };
  }

  totalTime(rs) {
    const h = rs.reduce(
      (s, r) => s + (this.timeValueMap[r.estimatedTime] || 24),
      0,
    );
    return {
      hours: h,
      days: Number((h / 24).toFixed(1)),
      weeks: Number((h / 168).toFixed(1)),
      months: Number((h / 720).toFixed(1)),
    };
  }

  departments(rs) {
    const m = {};
    for (const r of rs) {
      if (!m[r.department])
        m[r.department] = {
          department: r.department,
          action_count: 0,
          actions: [],
        };
      m[r.department].action_count++;
      m[r.department].actions.push(r.title);
    }
    return Object.values(m);
  }

  summary(rs) {
    if (!rs.length) return "No recommendations available.";
    return `${rs.length} recommendation(s) generated. Highest priority: ${rs[0].title} — ${rs[0].department} — ${rs[0].estimatedTime}.`;
  }
}

module.exports = RecommendationEngine;
