const express = require('express');
const router = express.Router();


const User = require('../models/User');


// Route to create a user and assign random value for credit score and income
router.post('/', async (req, res) => {
    try {
        console.log(req.body);
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Zufällige Werte generieren
        const income = Math.floor(Math.random() * 50000) + 20000; // 20.000 - 70.000
        const creditScore = Math.floor(Math.random() * 400) + 300; // 300 - 700

        const user = new User({ id, income, creditScore });
        await user.save();

        console.log("User created:", user);

        res.status(201).json({ user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
