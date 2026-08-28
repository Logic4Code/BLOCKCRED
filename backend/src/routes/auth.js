const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const USERS_FILE = path.join(__dirname, '../data/users.json');

function loadUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const users = loadUsers();
    const user = users.find(u => u.email === email);

    if (!user)
      return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        ...(user.studentId && { studentId: user.studentId }),
        ...(user.institutionId && { institutionId: user.institutionId }),
        ...(user.shortName && { shortName: user.shortName }),
        ...(user.company && { company: user.company })
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _pw, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// POST /api/auth/register-student — Institution registers a new student
router.post('/register-student', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'institution')
      return res.status(403).json({ error: 'Only institutions can register students' });

    const { name, studentId, email, phone, password } = req.body;
    if (!name || !studentId || !email)
      return res.status(400).json({ error: 'Name, Student ID and Email are required' });

    const users = loadUsers();

    // Check duplicates
    if (users.find(u => u.email === email))
      return res.status(409).json({ error: 'Email already registered' });
    if (users.find(u => u.studentId === studentId))
      return res.status(409).json({ error: 'Student ID already registered' });

    const hashedPassword = await bcrypt.hash(password || 'password', 10);
    const newStudent = {
      id: `stu-${Date.now()}`,
      name,
      studentId,
      role: 'student',
      email,
      password: hashedPassword,
      institutionId: decoded.id,
      phone: phone || ''
    };

    users.push(newStudent);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    const { password: _pw, ...safe } = newStudent;
    res.json({ success: true, student: safe, defaultPassword: password || 'password' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
