const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  srNo: { type: Number, required: true, unique: true },
  bank: { type: String, required: true },
  branch: { type: String },
  person: { type: String, required: true },
  verified: { type: Boolean, default: false },
  accountNo: { type: String, required: true },
  term: { type: String },
  interest: { type: Number },
  principal: { type: Number, required: true },
  valueDate: { type: Date },
  maturityDate: { type: Date },
  beforeTds: { type: Number },
  afterTds: { type: Number },
  interestAmt: { type: Number },
  tds: { type: Number },
  tdsPercent: { type: Number },
  status: { type: String },
  fromParth: { type: Boolean },
  poType: { type: String },
  autoRenew: { type: Boolean },
  rise: { type: Number },
  online: { type: Boolean },
  td5ReInvestment: { type: String },
  salarySavings: { type: Boolean },
  specialNote: { type: String },
  groupId: { type: String },
  parentGroupId: [{ type: String }]
});

module.exports = mongoose.model('Deposit', depositSchema);
