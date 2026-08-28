import express from 'express';
import { pool } from '../db.js';
import { authenticateToken, requireRole } from '../auth.js';

const router = express.Router();

// Apply admin auth to all routes in this router
router.use(authenticateToken, requireRole(['admin']));

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, role, department_id, phone, is_active, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id
router.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, department_id, is_active } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET role = COALESCE($1, role),
           department_id = $2,
           is_active = COALESCE($3, is_active),
           updated_at = now()
       WHERE id = $4
       RETURNING id, email, full_name, role, department_id, phone, is_active, created_at, updated_at`,
      [role, department_id, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalReports = await pool.query('SELECT COUNT(*) FROM reports');
    const resolvedReports = await pool.query("SELECT COUNT(*) FROM reports WHERE status = 'resolved'");
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const totalDepts = await pool.query('SELECT COUNT(*) FROM departments WHERE is_active = true');

    return res.json({
      total_reports: parseInt(totalReports.rows[0].count),
      resolved_reports: parseInt(resolvedReports.rows[0].count),
      total_users: parseInt(totalUsers.rows[0].count),
      total_departments: parseInt(totalDepts.rows[0].count),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
