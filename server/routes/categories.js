import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM problem_categories WHERE is_active = true ORDER BY default_priority ASC');
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
