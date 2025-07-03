const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    size: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
    price: { type: Number, required: true },
    type: {
        type: String,
        enum: ['flat', 'house', 'studio', 'apartment'], // add more if needed
        required: true
    },
    incomeRequirement: { type: Number, required: false, default: undefined },
    creditScoreRequirement: { type: Number, required: false, default: undefined },
});

console.log("Schema 'Listing' created");

module.exports = mongoose.model('Listing', listingSchema);
