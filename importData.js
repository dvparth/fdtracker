require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Deposit = require('./models/Deposit');

const MONGO_URI = process.env.MONGO_URI;
const dataPath = path.join(__dirname, '../Data/Data.json');

async function importData() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const rawData = fs.readFileSync(dataPath);
  const jsonData = JSON.parse(rawData);
  const deposits = jsonData.FD;
  await Deposit.deleteMany({}); // Clear existing data
  await Deposit.insertMany(deposits);
  console.log('Data imported successfully');
  mongoose.disconnect();
}

importData().catch(err => {
  console.error('Import failed:', err);
  mongoose.disconnect();
});
