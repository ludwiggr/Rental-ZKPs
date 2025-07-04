const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const Application = require('../models/Application');
const jwt = require('jsonwebtoken');



const {JWT_SECRET, JWT_EXPIRES_IN} = require('../config/config');


// Get all Listings
router.get('/', async (req, res) => {
    console.log("GET request received, request all listings", req.body);
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
    console.log("POST request received, create new listing", req.body);

    let userId;
    try {
        userId = check_authorization(req)
    } catch (err) {
        return res.status(401).json({message: 'Authorization failed'});
    }

    try {
        const {name, address, size, price, type,  incomeRequirement, creditScoreRequirement} = req.body;

        if (!name || !address || !size || !price || !type ) {
            return res.status(400).json({error: 'Missing required fields'});
        }

        const newListingData = {
            name,
            address,
            size,
            createdBy: userId,
            price,
            type
        };
        if (incomeRequirement !== undefined) {
            newListingData.incomeRequirement = incomeRequirement;
        }
        if (creditScoreRequirement !== undefined) {
            newListingData.creditScoreRequirement = creditScoreRequirement;
        }

        const newListing = new Listing(newListingData);

        const savedListing = await newListing.save();

        res.status(201).json(savedListing);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
});

// Get a specific Listing by ID
router.get('/:id', async (req, res) => {
    console.log("GET request received, get specifc listing", req.params.id);
    try {
        check_authorization(req)
    } catch (err) {
        return res.status(401).json({message: 'Authorization failed'});
    }
    try {
        const listing = await Listing.findById(req.params.id)
            .populate({
                path: 'applications',
                select: 'userId status incomeProof creditScoreProof'
            });

        if (!listing) return res.status(404).json({ message: 'Listing not found' });

        res.json({ listing });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a Listing by ID
router.delete('/:id', async (req, res) => {
    console.log("DELETE request received, delete listing", req.params.id);
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

// Apply to a Listing
router.post('/:id/apply', async (req, res) => {
    console.log("POST request received", req.body);
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

        // Prüfe, ob der User schon eine Bewerbung für dieses Listing hat
        const existingApplication = await Application.findOne({ userId, _id: { $in: listing.applications } });
        if (existingApplication) {
            return res.status(400).json({ message: 'User already applied to this listing' });
        }

        // Erstelle neue Application
        const { incomeProof, creditScoreProof } = req.body;
        const application = new Application({
            userId,
            incomeProof: incomeProof || {},
            creditScoreProof: creditScoreProof || {},
        });
        await application.save();

        // Füge Application zum Listing hinzu
        listing.applications.push(application._id);
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