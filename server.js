const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const depositRoutes = require('./routes/deposits');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/deposits', depositRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));
