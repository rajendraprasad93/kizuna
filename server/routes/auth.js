import express from 'express';
import { pool } from '../db.js';
import { hashPassword, comparePassword, generateToken, authenticateToken } from '../auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, role = 'citizen', phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    // Check if user already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await hashPassword(password);
    const validRole = ['citizen', 'department', 'admin'].includes(role) ? role : 'citizen';

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, department_id, phone, is_active, created_at, updated_at`,
      [email.toLowerCase().trim(), passwordHash, full_name.trim(), validRole, phone || null]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    return res.status(201).json({ user, token });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(
      `SELECT id, email, password_hash, full_name, role, department_id, phone, is_active, created_at, updated_at
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const match = await comparePassword(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account has been deactivated' });
    }

    delete user.password_hash;
    const token = generateToken(user);

    return res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, role, department_id, phone, is_active, created_at, updated_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/profile
router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    const result = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           updated_at = now()
       WHERE id = $3
       RETURNING id, email, full_name, role, department_id, phone, is_active, created_at, updated_at`,
      [full_name, phone, req.user.id]
    );

    return res.json({ user: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
