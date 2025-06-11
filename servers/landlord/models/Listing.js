const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    name: String,
    address: String,
    size: String,
    createdAt: { type: Date, default: Date.now },
});

console.log("Schema created");

module.exports = mongoose.model('Listing', listingSchema);
