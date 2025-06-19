const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const jwt = require('jsonwebtoken');

const {JWT_SECRET, JWT_EXPIRES_IN} = require('../config/config');


router.get('/', async (req, res) => {
    console.log("GET request received", req.body);
    let userId;
    try {
        userId = check_authorization(req)
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
        userId = check_authorization(req)
    } catch (err) {
        return res.status(401).json({message: 'Authorization failed'});
    }

    try {
        const {name, address, size, price, type} = req.body;

        if (!name || !address || !size || !price || !type) {
            return res.status(400).json({error: 'Missing required fields'});
        }

        const newListing = new Listing({name, address, size, createdBy: userId, price, type});

        const savedListing = await newListing.save();

        res.status(201).json(savedListing);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
});

router.get('/:id', async (req, res) => {

    try {
        check_authorization(req)
    } catch (err) {
        return res.status(401).json({message: 'Authorization failed'});
    }
    try {
        const listing = await Listing.findById(req.params.id).populate('applicants', 'email username');
        if (!listing) return res.status(404).json({ message: 'Listing not found' });

        res.json({ listing });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', async (req, res) => {
    let userId;
    try {
        userId = check_authorization(req)
    } catch (err) {
        return res.status(401).json({message: 'Authorization failed'});
    }
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Make sure the current user is the creator
        if (listing.createdBy.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this listing' });
        }

        await Listing.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Listing deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/apply', async (req, res) => {
    let userId;

    console.log("Application received");

    try {
        userId = check_authorization(req)
    } catch (err) {
        return res.status(401).json({message: 'Authorization failed'});
    }



    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }


        // Check if user already applied
        if (listing.applicants.includes(userId)) {
            return res.status(400).json({ message: 'User already applied to this listing' });
        }

        // Add user to applicants
        listing.applicants.push(userId);
        await listing.save();

        res.status(200).json({ message: 'Successfully applied to the listing' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


function check_authorization(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error('Missing token');

    const token = authHeader.split(' ')[1];


    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
}



module.exports = router;