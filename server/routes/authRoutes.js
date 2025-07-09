const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Use shared DB pool
const router = express.Router();

// Utility function to generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
    const { username, password, role = 'user' } = req.body; // Default role is 'user'

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password.' });
    }

    try {
        // Check if user already exists
        const [userExists] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const [result] = await pool.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]
        );

        const newUser = { id: result.insertId, username, role };

        res.status(201).json({
            message: 'User created successfully',
            user: newUser,
            token: generateToken(newUser.id, newUser.role)
        });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});


// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password.' });
    }

    try {
        // Check for user
        const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                },
                token: generateToken(user.id, user.role)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials.' });
        }

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;