import express from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../auth.js";
import { analyzeProblem } from "../services/geminiService.js";
import agent from "../../agent/agenticAI.js";
import {
  canonicalDepartmentName,
  validateReportCoordinates,
} from "../departmentMap.js";

const router = express.Router();

async function getDepartmentStatus() {
  const result = await pool.query(
    `SELECT id, name, is_active FROM departments ORDER BY name ASC`,
  );

  const departmentStatus = {};
  for (const dept of result.rows) {
    departmentStatus[dept.name] = {
      available: dept.is_active !== false,
      load: 0,
    };
  }

  return departmentStatus;
}

// POST /api/reports/analyze — run Gemini on an image before submitting
router.post("/analyze", authenticateToken, async (req, res) => {
  try {
    const { imageBase64, description, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }
    const analysis = await analyzeProblem(
      imageBase64,
      description || "",
      mimeType || "image/jpeg",
    );
    return res.json(analysis);
  } catch (err) {
    console.error("Analyze error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/reports
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { user_id, status, priority, department_id, limit = 100 } = req.query;

    let queryText = `
      SELECT r.*,
             row_to_json(c.*) AS category,
             row_to_json(d.*) AS department,
             row_to_json(u.*) AS profile
      FROM reports r
      LEFT JOIN problem_categories c ON r.category_id = c.id
      LEFT JOIN departments d ON r.department_id = d.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by user if citizen or explicitly asked
    if (user_id) {
      params.push(user_id);
      queryText += ` AND r.user_id = $${params.length}`;
    } else if (req.user.role === "citizen") {
      params.push(req.user.id);
      queryText += ` AND r.user_id = $${params.length}`;
    }

    if (status && status !== "all") {
      params.push(status);
      queryText += ` AND r.status = $${params.length}`;
    }

    if (priority && priority !== "all") {
      params.push(parseInt(priority));
      queryText += ` AND r.priority = $${params.length}`;
    }

    if (department_id) {
      params.push(department_id);
      queryText += ` AND r.department_id = $${params.length}`;
    }

    queryText += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await pool.query(queryText, params);
    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching reports:", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/:id
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const reportRes = await pool.query(
      `SELECT r.*,
              row_to_json(c.*) AS category,
              row_to_json(d.*) AS department,
              row_to_json(u.*) AS profile
       FROM reports r
       LEFT JOIN problem_categories c ON r.category_id = c.id
       LEFT JOIN departments d ON r.department_id = d.id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id],
    );

    if (reportRes.rows.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    const report = reportRes.rows[0];

    // Fetch AI Analysis
    const aiRes = await pool.query(
      "SELECT * FROM ai_analyses WHERE report_id = $1",
      [id],
    );
    report.ai_analysis = aiRes.rows[0] || null;

    // Fetch Actions Taken
    const actionsRes = await pool.query(
      `SELECT a.*, row_to_json(u.*) AS profile
       FROM actions_taken a
       LEFT JOIN users u ON a.performed_by = u.id
       WHERE a.report_id = $1
       ORDER BY a.created_at DESC`,
      [id],
    );
    report.actions_taken = actionsRes.rows;

    return res.json(report);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/reports
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      category_id,
      title,
      description,
      latitude,
      longitude,
      location_address,
      image_urls = [],
      ai_analysis,
      priority = 3,
      department_id,
    } = req.body;

    const coordError = validateReportCoordinates(req.body);
    if (coordError) {
      return res.status(400).json({ error: coordError });
    }

    const insertReport = await pool.query(
      `INSERT INTO reports (
        user_id, category_id, title, description, latitude, longitude,
        location_address, image_urls, priority, department_id, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        req.user.id,
        category_id || null,
        title || "Untitled Report",
        description || "",
        latitude,
        longitude,
        location_address || null,
        JSON.stringify(image_urls),
        priority,
        department_id || null,
        ai_analysis ? "analyzed" : "submitted",
      ],
    );

    const report = insertReport.rows[0];
    let pt = {
      primary: "other",
      confidence: 0.5,
    };
    if (ai_analysis) {
      report.category =
        ai_analysis.problem_type?.primary ||
        ai_analysis.final_problem_type ||
        report.category ||
        "unknown";
      report.severity =
        ai_analysis.severity?.level || report.severity || "medium";
    }

    // Save AI Analysis if provided (from Gemini)
    if (ai_analysis) {
      // Extract Gemini-enriched data
      pt = ai_analysis.problem_type || {
        primary: ai_analysis.final_problem_type,
        confidence: ai_analysis.final_confidence,
      };
      const sev = ai_analysis.severity || {};
      const vc = ai_analysis.visible_conditions || [];
      const rci = ai_analysis.root_cause_indicators || [];
      const ia = ai_analysis.immediate_actions || [];
      const mpd = ai_analysis.model_pipeline_data || {};
      const ac = ai_analysis.additional_context || {};
      const lc = ai_analysis.location_context || {};

      await pool.query(
        `INSERT INTO ai_analyses (
          report_id, detected_problem, problem_confidence, visible_conditions,
          extracted_context, text_confidence, final_problem_type, final_confidence,
          authenticity_score, is_authentic, verification_details, possible_causes,
          recommended_action, action_confidence, alternative_actions, related_incident_count,
          relationship_graph, processing_time_ms
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          report.id,
          pt.primary || "other",
          pt.confidence || 0.5,
          JSON.stringify(vc),
          JSON.stringify({ ...lc, ...ac }),
          pt.confidence || 0.5,
          pt.primary || "other",
          pt.confidence || 0.5,
          mpd.extraction_confidence || 0.5,
          (mpd.extraction_confidence || 0.5) > 0.6,
          JSON.stringify({
            severity_level: sev.level,
            severity_score: sev.score,
            affected_radius: sev.estimated_affected_radius_meters,
            safety_issues: ac.safety_issues || [],
            image_quality: ac.image_quality,
            environment: lc.environment,
          }),
          JSON.stringify(rci),
          ia[0]?.action || "Review by department official",
          ia[0]?.priority ? 1 - ia[0].priority / 5 : 0.8,
          JSON.stringify(ia.slice(1)),
          mpd.suggested_priority || 3,
          JSON.stringify({
            tags: mpd.tags,
            keywords: mpd.keywords,
            departments: mpd.recommended_departments,
          }),
          0,
        ],
      );
    }

    let agentDecision = null;
    try {
      const historicalReports = await pool.query(
        `SELECT * FROM reports WHERE id <> $1 ORDER BY created_at DESC LIMIT 50`,
        [report.id],
      );

      const departmentStatus = await getDepartmentStatus();
      agentDecision = await agent.processReport(
        report,
        ai_analysis || null,
        historicalReports.rows,
        {
          weatherData: req.body.weatherData || null,
          departmentStatus,
        },
      );

      const duplicateTrace = agentDecision?.execution?.trace?.find(
        (step) => step.toolName === "duplicateDetection",
      );
      const duplicateResult = duplicateTrace?.normalized?.raw || null;

      if (
        duplicateResult?.is_duplicate &&
        duplicateResult.all_duplicates?.length
      ) {
        const bestMatch = duplicateResult.all_duplicates[0];
        if (bestMatch?.id) {
          await pool.query(
            `UPDATE reports SET is_duplicate = true, master_report_id = $1, updated_at = now() WHERE id = $2`,
            [bestMatch.id, report.id],
          );
        }
      }

      const routeDepartmentName =
        agentDecision?.decision?.primaryDepartment ||
        agentDecision?.actions?.primary_department?.name ||
        null;

      if (
        routeDepartmentName &&
        department_id == null &&
        !report.department_id
      ) {
        const lookupName = canonicalDepartmentName(routeDepartmentName);
        const deptLookup = await pool.query(
          `SELECT id FROM departments WHERE name = $1 LIMIT 1`,
          [lookupName],
        );

        if (deptLookup.rows[0]?.id) {
          await pool.query(
            `UPDATE reports SET department_id = $1, status = 'analyzed', updated_at = now() WHERE id = $2`,
            [deptLookup.rows[0].id, report.id],
          );
          report.department_id = deptLookup.rows[0].id;
          report.status = "analyzed";
        }
      }

      const aiAnalysisResult = agentDecision?.execution?.trace?.find(
        (step) => step.toolName === "rootCauseAnalysis",
      );
      const recommendationResult = agentDecision?.execution?.trace?.find(
        (step) => step.toolName === "recommendationEngine",
      );

      if (aiAnalysisResult || recommendationResult) {
        const rootCause = aiAnalysisResult?.normalized?.raw || {};
        const recommendation = recommendationResult?.normalized?.raw || {};

        await pool.query(
          `UPDATE ai_analyses
           SET final_problem_type = $1,
               final_confidence = $2,
               possible_causes = $3,
               recommended_action = $4,
               action_confidence = $5,
               related_incident_count = $6,
               relationship_graph = $7,
               updated_at = now()
           WHERE report_id = $8`,
          [
            rootCause.problem_type || pt.primary || "other",
            rootCause.confidence ?? pt.confidence ?? 0.5,
            JSON.stringify(rootCause.possible_causes || []),
            recommendation.recommendations?.[0]?.title ||
              recommendation.recommended_action ||
              "Review by department official",
            recommendation.recommendations?.[0]?.confidence ||
              recommendation.confidence ||
              0.8,
            duplicateResult?.matched_reports || 0,
            JSON.stringify({
              relationships:
                agentDecision?.execution?.trace?.find(
                  (step) => step.toolName === "relationshipDiscovery",
                )?.normalized?.raw || {},
              root_cause: rootCause,
              recommendation: recommendation,
            }),
            report.id,
          ],
        );
      }
    } catch (agentError) {
      console.error("Agent integration error:", agentError.message);
      await pool.query(
        `UPDATE reports SET status = 'analyzed', updated_at = now() WHERE id = $1`,
        [report.id],
      );
    }

    // Create Notification
    await pool.query(
      `INSERT INTO notifications (user_id, report_id, type, title, message)
       VALUES ($1, $2, 'report_created', 'Report Submitted', 'Your report has been received and analyzed by AI.')`,
      [req.user.id, report.id],
    );

    return res.status(201).json({
      ...report,
      agent_decision: agentDecision || null,
    });
  } catch (err) {
    console.error("Create report error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/reports/:id
router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, department_id, assigned_to, title, description } =
      req.body;

    const updates = [];
    const params = [];

    if (status !== undefined) {
      params.push(status);
      updates.push(`status = $${params.length}`);
      if (status === "resolved") {
        updates.push(`resolved_at = now()`);
      }
      if (status === "assigned") {
        updates.push(`assigned_at = now()`);
      }
    }

    if (priority !== undefined) {
      params.push(priority);
      updates.push(`priority = $${params.length}`);
    }

    if (department_id !== undefined) {
      params.push(department_id);
      updates.push(`department_id = $${params.length}`);
    }

    if (assigned_to !== undefined) {
      params.push(assigned_to);
      updates.push(`assigned_to = $${params.length}`);
    }

    if (title !== undefined) {
      params.push(title);
      updates.push(`title = $${params.length}`);
    }

    if (description !== undefined) {
      params.push(description);
      updates.push(`description = $${params.length}`);
    }

    updates.push(`updated_at = now()`);
    params.push(id);

    const queryText = `
      UPDATE reports
      SET ${updates.join(", ")}
      WHERE id = $${params.length}
      RETURNING *
    `;

    const result = await pool.query(queryText, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    const updatedReport = result.rows[0];

    // Notify report owner if status changed
    if (status) {
      await pool.query(
        `INSERT INTO notifications (user_id, report_id, type, title, message)
         VALUES ($1, $2, 'status_updated', 'Status Updated', 'Your report status has changed to ' || $3)`,
        [updatedReport.user_id, updatedReport.id, status],
      );
    }

    return res.json(updatedReport);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
