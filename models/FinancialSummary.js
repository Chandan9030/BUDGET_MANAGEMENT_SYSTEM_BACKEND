const mongoose = require("mongoose")

const FinancialSummarySchema = new mongoose.Schema(
  {
    id: String,
    slNo: Number,
    item: String,
    value: Number,
    description: String,
  },
  { strict: false },
)

module.exports = mongoose.model(
  "FinancialSummary",
  mongoose.Schema({
    items: [FinancialSummarySchema],
  }),
)
