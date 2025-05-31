const express = require("express");
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/config');

router.post('/', async (req, res) => {
    console.log("Login request");
    console.log(req.body); //ToDo delete
    const { email, password } = req.body;

    console.log(email); //ToDo delete

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({ message: 'Login successful', token, username: user.username });
});

module.exports = router;