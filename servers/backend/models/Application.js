// servers/backend/models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'approved', 'rejected'],
        default: 'pending'
    },
    incomeProof: {
        type: Object,
        required: false,
        default: {}
    },
    creditScoreProof: {
        type: Object,
        required: false,
        default: {}
    },

}, { timestamps: true });

console.log("Schema 'Application' created");

module.exports = mongoose.model('Application', applicationSchema);