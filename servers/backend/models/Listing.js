const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    size: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

console.log("Schema 'Listing' created");

module.exports = mongoose.model('Listing', listingSchema);
