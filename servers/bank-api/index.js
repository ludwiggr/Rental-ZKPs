const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

app.use(express.json());

app.use(cors({
    origin: '*',
    credentials: false
}));

// Connect to MongoDB
mongoose.connect('mongodb://root:example@bank_database_service:27017/db?authSource=admin')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));
// Routes
app.use('/bank/proofs', require('./routes/proof'));
app.use('/user', require('./routes/user'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});