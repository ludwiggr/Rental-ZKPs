const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const jwt = require('jsonwebtoken');

const {JWT_SECRET, JWT_EXPIRES_IN} = require('../config/config');


// Get all listings of the current user
router.get('/', async (req, res) => {
    console.log("GET request received", req.body);
    let userId;
    try {
        userId = login(req)
    } catch (err) {
        return res.status(401).json({message: 'Authorization failed'});
    }
    const mineOnly = req.query.mine === 'true';
    const query = mineOnly ? {createdBy: userId} : {};

    try {
        const listings = await Listing.find(query);
        res.json({listings});
    } catch (err) {
        res.status(500).json({message: 'Failed to fetch listings'});
    }
});

// Create new Listing
router.post('/', async (req, res) => {
    console.log("POST request received", req.body);

    let userId;
    try {
        userId = login(req)
    } catch (err) {
        return res.status(401).json({message: 'Authorization failed'});
    }

    try {
        const {name, address, size} = req.body;

        if (!name || !address || !size) {
            return res.status(400).json({error: 'Missing required fields'});
        }

        const newListing = new Listing({name, address, size, createdBy: userId});

        const savedListing = await newListing.save();

        res.status(201).json(savedListing);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
});


function login(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error('Missing token');

    const token = authHeader.split(' ')[1];


    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
}


module.exports = router;