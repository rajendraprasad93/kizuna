import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { randomUUID } from "node:crypto";

let model = null;
let geminiAvailable = false;

// Initialize Gemini with error handling
function initializeGemini() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn(
        "⚠️  GEMINI_API_KEY not configured - Gemini analysis will use fallback mode",
      );
      return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const selectedModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    model = genAI.getGenerativeModel({
      model: selectedModel,
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    });

    geminiAvailable = true;
    console.log(`✅ Gemini Service initialized with model: ${selectedModel}`);
  } catch (err) {
    console.warn("⚠️  Gemini initialization failed:", err.message);
    console.warn("📝 System will use fallback mock analysis");
  }
}

initializeGemini();

// Tag mapping for different problem types
const TAG_MAP = {
  flooding: [
    "water_logging",
    "urban_flooding",
    "drainage_issue",
    "water_accumulation",
  ],
  pothole: [
    "road_damage",
    "asphalt_crack",
    "surface_degradation",
    "pavement_failure",
  ],
  garbage: [
    "waste_management",
    "sanitation",
    "cleanliness_issue",
    "waste_accumulation",
  ],
  streetlight_outage: [
    "lighting_issue",
    "electrical",
    "public_safety",
    "visibility_hazard",
  ],
  electrical_hazard: [
    "safety_hazard",
    "electrical_fire_risk",
    "electrical_danger",
  ],
  tree_fall: ["obstruction", "vegetation", "safety_risk", "pathway_blocked"],
  road_damage: ["infrastructure", "transportation_issue", "surface_failure"],
  water_leak: ["water_waste", "infrastructure_failure", "utility_issue"],
};

const DEPARTMENT_MAP = {
  flooding: "drainage",
  pothole: "roads",
  garbage: "sanitation",
  streetlight_outage: "electricity",
  electrical_hazard: "electricity",
  tree_fall: "parks",
  road_damage: "roads",
  water_leak: "drainage",
};

function buildPrompt(description) {
  return `You are an expert urban infrastructure analyst. Analyze the uploaded image and any provided text to extract detailed information about the city problem.

STRICT RULES:
1. NEVER hallucinate - if something isn't visible, set to null or empty array
2. Confidence scores must be realistic (0.7-1.0 for clear items, 0.3-0.7 for uncertain)
3. Emergency classification requires clear evidence of immediate danger
4. Return ONLY valid JSON, no markdown, no explanatory text

Return JSON matching this exact schema:
{
  "problem_type": {
    "primary": "flooding|pothole|garbage|streetlight_outage|electrical_hazard|tree_fall|road_damage|water_leak|other",
    "secondary": [],
    "confidence": 0.0
  },
  "visible_conditions": [
    {
      "condition": "standing_water|blocked_drain|garbage_pile|cracked_road|broken_pavement|fallen_tree|exposed_wire|broken_streetlight",
      "confidence": 0.0,
      "severity": "low|medium|high|emergency",
      "description": ""
    }
  ],
  "severity": {
    "level": "low|medium|high|emergency",
    "score": 0,
    "factors": [],
    "estimated_affected_radius_meters": 0,
    "estimated_affected_people": "",
    "urgency_reason": ""
  },
  "location_context": {
    "environment": "residential|commercial|industrial|park|highway|street|alley|school_zone|hospital_zone",
    "road_type": "main_road|side_road|highway|pedestrian|bike_lane",
    "nearby_landmarks": [],
    "accessibility_issues": null,
    "weather_context": ""
  },
  "infrastructure": {
    "road_condition": "good|fair|poor|damaged",
    "drainage_present": null,
    "drainage_condition": "functional|blocked|damaged|missing",
    "streetlight_present": null,
    "streetlight_condition": "working|broken|missing",
    "sidewalk_condition": "good|damaged|missing",
    "other_infrastructure": []
  },
  "root_cause_indicators": [
    {
      "potential_cause": "",
      "confidence": 0.0,
      "evidence": [],
      "category": "structural|environmental|human|maintenance|natural"
    }
  ],
  "immediate_actions": [
    {
      "action": "",
      "priority": 1,
      "department": "drainage|roads|sanitation|electricity|parks|emergency",
      "estimated_time_hours": 0,
      "resources_needed": [],
      "safety_concerns": []
    }
  ],
  "long_term_actions": [
    {
      "action": "",
      "priority": 1,
      "department": "",
      "estimated_time_weeks": 0,
      "resources_needed": []
    }
  ],
  "additional_context": {
    "objects_detected": [],
    "time_based": "daytime|nighttime|morning|afternoon|evening",
    "weather_visible": "clear|rainy|foggy|snowy",
    "safety_issues": [],
    "special_notes": "",
    "image_quality": "good|moderate|poor"
  },
  "model_pipeline_data": {
    "extraction_confidence": 0.0,
    "requires_human_review": false,
    "recommended_departments": [],
    "suggested_priority": 3,
    "tags": [],
    "keywords": []
  }
}
${description ? `\nUser description: "${description}"` : ""}`;
}

function cleanResponse(text) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
}

function generateTags(analysis) {
  const tags = [];
  const primary = analysis.problem_type?.primary || "other";

  // Add category-based tags
  if (TAG_MAP[primary]) {
    tags.push(...TAG_MAP[primary]);
  }

  // Add severity-based tags
  if (analysis.severity?.level === "emergency") {
    tags.push("emergency_response");
  }
  if (analysis.severity?.level === "high") {
    tags.push("high_priority");
  }

  // Add condition-based tags
  (analysis.visible_conditions || []).forEach((cond) => {
    if (cond.condition === "standing_water") tags.push("water_accumulation");
    if (cond.condition === "blocked_drain") tags.push("drainage_blockage");
    if (cond.condition === "garbage_pile") tags.push("waste_accumulation");
    if (cond.condition === "exposed_wire") tags.push("electrical_hazard");
    if (cond.condition === "fallen_tree") tags.push("vegetation_hazard");
  });

  // Remove duplicates
  return [...new Set(tags)];
}

function generateKeywords(analysis) {
  const keywords = new Set();
  const primary = analysis.problem_type?.primary || "other";

  keywords.add(primary);
  keywords.add("city_problem");
  keywords.add("infrastructure");

  if (analysis.severity?.level) {
    keywords.add(`${analysis.severity.level}_severity`);
  }

  if (analysis.location_context?.environment) {
    keywords.add(analysis.location_context.environment);
  }

  // Add condition keywords
  (analysis.visible_conditions || []).forEach((cond) => {
    if (cond.condition) keywords.add(cond.condition);
  });

  // Add department keywords
  const dept = DEPARTMENT_MAP[primary];
  if (dept) keywords.add(dept);

  return Array.from(keywords);
}

function getRecommendedDepartments(analysis) {
  const depts = new Set();
  const primary = analysis.problem_type?.primary || "other";

  // Add primary department
  const primaryDept = DEPARTMENT_MAP[primary];
  if (primaryDept) depts.add(primaryDept);

  // Add departments from immediate actions
  (analysis.immediate_actions || []).forEach((action) => {
    if (action.department) depts.add(action.department);
  });

  return Array.from(depts);
}

function getSuggestedPriority(analysis) {
  // Priority 1: Emergency
  if (analysis.severity?.level === "emergency") return 1;

  // Priority 2: High + safety concerns
  if (
    analysis.severity?.level === "high" ||
    analysis.additional_context?.safety_issues?.length > 0
  )
    return 2;

  // Priority 3: Medium
  if (analysis.severity?.level === "medium") return 3;

  // Priority 4: Low
  return 4;
}

function getEnhancedMockAnalysis(description = "") {
  // Detect problem type from description with better accuracy
  const lower = description.toLowerCase();
  let problemType = "other";
  let confidence = 0.65;
  let conditions = [];
  let severity = "medium";
  let severityScore = 55;
  let actions = [];

  // Enhanced detection with multiple keywords
  if (
    /water|flood|drain|puddle|rain|wet|submerge|overflow|standing|pool/.test(
      lower,
    )
  ) {
    problemType = "flooding";
    confidence = 0.85;
    conditions = ["standing_water"];
    severity = /urgent|emergency|deep|dangerous/.test(lower)
      ? "high"
      : "medium";
    severityScore = severity === "high" ? 78 : 62;
    actions = [
      {
        action: "Clear storm drain and remove water accumulation",
        priority: 1,
        department: "drainage",
        estimated_time_hours: 6,
        resources_needed: [
          "Drainage crew",
          "Pump equipment",
          "Safety barriers",
        ],
        safety_concerns: ["Electrical hazards", "Traffic safety"],
      },
    ];
  } else if (
    /pothole|crack|road|pavement|asphalt|rough|damage|broken|surface|hole/.test(
      lower,
    )
  ) {
    problemType = "pothole";
    confidence = 0.82;
    conditions = ["cracked_road", "broken_pavement"];
    severity = /large|deep|dangerous|urgent/.test(lower) ? "high" : "medium";
    severityScore = severity === "high" ? 72 : 58;
    actions = [
      {
        action: "Repair road surface with cold mix asphalt",
        priority: 2,
        department: "roads",
        estimated_time_hours: 8,
        resources_needed: ["Road crew", "Asphalt", "Traffic cones"],
        safety_concerns: ["Traffic hazards", "Vehicle damage risk"],
      },
    ];
  } else if (
    /garbage|trash|waste|dump|litter|rubbish|smell|dirty|pile/.test(lower)
  ) {
    problemType = "garbage";
    confidence = 0.8;
    conditions = ["garbage_pile"];
    severity = /large|huge|smell|urgent|health/.test(lower) ? "high" : "medium";
    severityScore = severity === "high" ? 70 : 52;
    actions = [
      {
        action: "Emergency waste collection and area cleanup",
        priority: 1,
        department: "sanitation",
        estimated_time_hours: 4,
        resources_needed: [
          "Sanitation crew",
          "Collection truck",
          "Cleaning supplies",
        ],
        safety_concerns: ["Health hazards", "Pest infestation"],
      },
    ];
  } else if (
    /light|dark|electricity|wire|electrical|lamp|street.*light|broken.*light/.test(
      lower,
    )
  ) {
    problemType = "streetlight_outage";
    confidence = 0.75;
    conditions = ["broken_streetlight"];
    severity = /dark|night|dangerous|crime/.test(lower) ? "high" : "medium";
    severityScore = severity === "high" ? 68 : 50;
    actions = [
      {
        action: "Repair or replace streetlight",
        priority: 2,
        department: "electricity",
        estimated_time_hours: 3,
        resources_needed: [
          "Electrical crew",
          "Replacement bulb/fixture",
          "Lift equipment",
        ],
        safety_concerns: ["Electrical safety", "Public safety at night"],
      },
    ];
  }

  const defaults = getDefaultAnalysis();

  const mock = {
    ...defaults,
    problem_type: { primary: problemType, secondary: [], confidence },
    severity: {
      level: severity,
      score: severityScore,
      factors: [
        "infrastructure_issue",
        problemType === "flooding" ? "safety_risk" : "maintenance_required",
      ],
      estimated_affected_radius_meters: severity === "high" ? 200 : 100,
      estimated_affected_people:
        severity === "high" ? "100-200 daily" : "50-100 daily",
      urgency_reason: `${problemType} ${severity === "high" ? "with high priority" : "requiring attention"} detected from citizen report`,
    },
    visible_conditions: conditions.map((cond) => ({
      condition: cond,
      confidence: confidence - 0.05,
      severity,
      description:
        description.substring(0, 100) || `${problemType} observed in the area`,
    })),
    location_context: {
      environment: /commercial|business|shop|store/.test(lower)
        ? "commercial"
        : /residential|home|apartment|house/.test(lower)
          ? "residential"
          : "street",
      road_type: /highway|freeway/.test(lower)
        ? "highway"
        : /main.*road|main.*street/.test(lower)
          ? "main_road"
          : "side_road",
      nearby_landmarks: [],
      accessibility_issues: /wheelchair|disabled|accessibility/.test(lower)
        ? "Accessibility affected"
        : null,
      weather_context: /rain|storm|wet/.test(lower)
        ? "rainy"
        : /sun|dry|hot/.test(lower)
          ? "clear"
          : "",
    },
    root_cause_indicators: [
      {
        potential_cause:
          problemType === "flooding"
            ? "Blocked drainage system or inadequate capacity"
            : problemType === "pothole"
              ? "Water infiltration and heavy traffic wear"
              : problemType === "garbage"
                ? "Irregular collection or illegal dumping"
                : "Infrastructure maintenance needed",
        confidence: confidence - 0.1,
        evidence: ["Citizen report observation", "Text-based analysis"],
        category: "maintenance",
      },
    ],
    immediate_actions:
      actions.length > 0
        ? actions
        : [
            {
              action: `Inspect and address ${problemType}`,
              priority: 2,
              department: DEPARTMENT_MAP[problemType] || "roads",
              estimated_time_hours: 12,
              resources_needed: ["Inspection team", "Standard equipment"],
              safety_concerns: [],
            },
          ],
    additional_context: {
      objects_detected: [],
      time_based: "daytime",
      weather_visible: /rain|storm/.test(lower) ? "rainy" : "clear",
      safety_issues: severity === "high" ? ["Public safety concern"] : [],
      special_notes:
        "⚠️ MOCK ANALYSIS MODE: Real Gemini Vision API unavailable. Analysis based on text description only. Confidence scores are estimated. Visual details cannot be assessed without image analysis. Please verify details and update report as needed.",
      image_quality: "moderate",
    },
    model_pipeline_data: {
      extraction_confidence: confidence,
      requires_human_review: true,
      suggested_priority: confidence > 0.8 ? 2 : 3,
      recommended_departments: [],
      tags: [],
      keywords: [],
    },
  };

  return enrichAnalysis(mock);
}

function getDefaultAnalysis() {
  return {
    problem_type: { primary: "other", secondary: [], confidence: 0.0 },
    visible_conditions: [],
    severity: {
      level: "low",
      score: 0,
      factors: [],
      estimated_affected_radius_meters: 0,
      estimated_affected_people: "",
      urgency_reason: "",
    },
    location_context: {
      environment: "street",
      road_type: "main_road",
      nearby_landmarks: [],
      accessibility_issues: null,
      weather_context: "",
    },
    infrastructure: {
      road_condition: "good",
      drainage_present: null,
      drainage_condition: null,
      streetlight_present: null,
      streetlight_condition: null,
      sidewalk_condition: "good",
      other_infrastructure: [],
    },
    root_cause_indicators: [],
    immediate_actions: [],
    long_term_actions: [],
    additional_context: {
      objects_detected: [],
      time_based: "daytime",
      weather_visible: "clear",
      safety_issues: [],
      special_notes: "",
      image_quality: "moderate",
    },
    model_pipeline_data: {
      extraction_confidence: 0.0,
      requires_human_review: true,
      recommended_departments: [],
      suggested_priority: 3,
      tags: [],
      keywords: [],
    },
  };
}

export async function analyzeProblem(
  imageBase64,
  description = "",
  mimeType = "image/jpeg",
) {
  try {
    // If Gemini is not available, use fallback
    if (!geminiAvailable || !model) {
      console.warn("⚠️  Gemini not available, using enhanced mock analysis");
      return getEnhancedMockAnalysis(description);
    }

    const prompt = buildPrompt(description);
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType } },
    ]);

    const text = result.response.text();
    const cleaned = cleanResponse(text);
    const analysis = JSON.parse(cleaned);

    // Merge with defaults for any missing fields
    const defaults = getDefaultAnalysis();
    const merged = {
      ...defaults,
      ...analysis,
      problem_type: {
        ...defaults.problem_type,
        ...(analysis.problem_type || {}),
      },
      severity: { ...defaults.severity, ...(analysis.severity || {}) },
      location_context: {
        ...defaults.location_context,
        ...(analysis.location_context || {}),
      },
      infrastructure: {
        ...defaults.infrastructure,
        ...(analysis.infrastructure || {}),
      },
      additional_context: {
        ...defaults.additional_context,
        ...(analysis.additional_context || {}),
      },
      model_pipeline_data: {
        ...defaults.model_pipeline_data,
        ...(analysis.model_pipeline_data || {}),
      },
    };

    // Enrich with generated data
    return enrichAnalysis(merged);
  } catch (err) {
    console.error("❌ Gemini analysis failed:", err.message);
    console.warn("📝 Falling back to mock analysis");
    return getEnhancedMockAnalysis(description);
  }
}

function enrichAnalysis(analysis) {
  // Generate tags and keywords
  const tags = generateTags(analysis);
  const keywords = generateKeywords(analysis);
  const recommendedDepts = getRecommendedDepartments(analysis);
  const suggestedPriority = getSuggestedPriority(analysis);

  // Generate report category ID for model pipeline
  const reportCategoryId = randomUUID();

  // Update model_pipeline_data
  analysis.model_pipeline_data = {
    ...analysis.model_pipeline_data,
    extraction_confidence: analysis.problem_type?.confidence || 0.5,
    recommended_departments: recommendedDepts,
    suggested_priority: suggestedPriority,
    tags,
    keywords,
    report_category_id: reportCategoryId,
  };

  return analysis;
}
