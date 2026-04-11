const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/setup — crea el primer admin (solo si no existe ninguno)
router.post('/setup', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Ya existe un administrador' });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener mínimo 6 caracteres' });
    }

    const user = await User.create({ username, password, role: 'admin' });

    res.status(201).json({
      message: 'Admin creado exitosamente',
      token: generateToken(user._id),
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/me — verificar token actual
router.get('/me', protect, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role,
    },
  });
});

// PUT /api/auth/password — cambiar contraseña
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener mínimo 6 caracteres' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
