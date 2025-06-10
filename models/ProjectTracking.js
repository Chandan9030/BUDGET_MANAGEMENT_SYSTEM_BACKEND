const mongoose = require("mongoose")

const ProjectTrackingSchema = new mongoose.Schema(
  {
    id: String,
    slNo: Number,
    projectWork: String,
    uiUx: String,
    devName: String,
    docStatus: String,
    startDate: Date,
    endedDate: Date,
    resources: String,
    salary: Number,
    daysInvolved: Number,
    hoursDays: Number,
    perDayAmount: Number,
    investDayAmount: Number,
    perHrsAmount: Number,
    projectCost: Number,
    collectAmount: Number,
    pendingAmount: Number,
    profitForProject: Number,
  },
  { strict: false },
) // Allow additional fields

module.exports = mongoose.model(
  "ProjectTracking",
  mongoose.Schema({
    items: [ProjectTrackingSchema],
  }),
)
