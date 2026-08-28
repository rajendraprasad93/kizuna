import express from 'express';
import { pool } from '../db.js';
import { authenticateToken, requireRole } from '../auth.js';

const router = express.Router();

// GET /api/departments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments WHERE is_active = true ORDER BY name ASC');
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/departments (admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, description, contact_email, contact_phone, address } = req.body;
    const result = await pool.query(
      `INSERT INTO departments (name, description, contact_email, contact_phone, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description, contact_email, contact_phone, address]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
