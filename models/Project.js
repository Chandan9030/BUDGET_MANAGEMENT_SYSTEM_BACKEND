const mongoose = require("mongoose")

const ProjectSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    startDate: Date,
    endDate: Date,
    budget: Number,
    status: String,
    team: [String],
    tasks: [
      {
        id: String,
        name: String,
        description: String,
        status: String,
        assignedTo: String,
        dueDate: Date,
      },
    ],
  },
  { strict: false },
) // Allow additional fields

module.exports = mongoose.model("Project", ProjectSchema)
