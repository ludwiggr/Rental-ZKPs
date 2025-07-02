const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    income: { type: Number, required: true},
    creditScore: { type: Number, required: true},

});

console.log("Schema 'User' created");

module.exports = mongoose.model('User', userSchema);
