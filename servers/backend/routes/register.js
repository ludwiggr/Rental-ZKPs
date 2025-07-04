const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
    console.log("POST request received, register new user", req.body);
    const { username, email, password } = req.body;

    if (!username || !email || !password)
        return res.status(400).json({ error: 'Username, email and password required' });
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ username, email, password: hashedPassword });

        // Create User in Bank System for PoC Developement only via Bank API Service
        try {
            const bank_res = await fetch(`http://bank_api_service:3000/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({id: user._id}),
            });
            if (!bank_res.ok) {
                const err = await bank_res.json();
                throw new Error(err.message || 'Failed to create user in bank system, aborting registration');
            }
        } catch (bank_err) {
            return res.status(500).json({ error: 'Failed to create user in bank system, aborting registration' });
        }
        await user.save();
    } catch (err) {
        return res.status(400).json({ error: `Internal error: ${err}` });
    }
    res.status(201).json({ message: 'User registered successfully' });
});

module.exports = router;