const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
    console.log("New registration request");
    console.log(req.body);
    const { username, email, password } = req.body;

    if (!username || !email || !password)
        return res.status(400).json({ error: 'Username, email and password required' });
    console.log("all fields completed");
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ username, email, password: hashedPassword });
        await user.save();
    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: `Internal error: ${err}` });
    }

    console.log("User saved");
    res.status(201).json({ message: 'User registered successfully' });
});

module.exports = router;