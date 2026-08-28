import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../auth.js';

const router = express.Router();

// POST /api/actions
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { report_id, action_type, description, after_image_urls = [], cost, duration_minutes, notes } = req.body;

    if (!report_id || !action_type) {
      return res.status(400).json({ error: 'report_id and action_type are required' });
    }

    const result = await pool.query(
      `INSERT INTO actions_taken (
        report_id, action_type, description, performed_by, after_image_urls, cost, duration_minutes, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        report_id,
        action_type,
        description || null,
        req.user.id,
        JSON.stringify(after_image_urls),
        cost || null,
        duration_minutes || null,
        notes || null,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
