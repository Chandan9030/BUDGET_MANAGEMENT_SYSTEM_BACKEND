const mongoose = require("mongoose");

const BudgetItemSchema = new mongoose.Schema({
  id: String,
  srNo: Number,
  category: String,
  employee: String,
  monthlyCost: Number,
  quarterlyCost: Number,
  halfYearlyCost: Number,
  annualCost: Number
});

const BudgetSectionSchema = new mongoose.Schema({
  id: String,
  name: String,
  items: [BudgetItemSchema]
});

const BudgetSchema = new mongoose.Schema({
  sections: [BudgetSectionSchema]
}, { timestamps: true });

module.exports = mongoose.model("Budget", BudgetSchema);
