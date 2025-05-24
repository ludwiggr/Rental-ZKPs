const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');

// GET all items
router.get('/', async (req, res) => {
    console.log("GET request received")
    const listings = await Listing.find();
    res.json(listings);
});

router.post('/', async (req, res) => {
    console.log("POST request received", req.body);
    try {
        const { name, address, size } = req.body;

        if (!name || !address || !size) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newListing = new Listing({ name, address, size });

        const savedListing = await newListing.save();

        res.status(201).json(savedListing);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;