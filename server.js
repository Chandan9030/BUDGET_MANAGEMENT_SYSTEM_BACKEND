const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const budgetRoutes = require("./routes/budget")
const projectRoutes = require("./routes/project")
const projectTrackingRoutes = require("./routes/projectTracking")
const subscriptionRevenueRoutes = require("./routes/subscriptionRevenue")
const subscriptionModelRoutes = require("./routes/subscriptionModel")
const financialSummaryRoutes = require("./routes/financialSummary")

// Load environment variables
dotenv.config()

// Create Express app
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err))

// Routes
app.use("/api/budget", budgetRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/project-tracking", projectTrackingRoutes)
app.use("/api/subscription-revenue", subscriptionRevenueRoutes)
app.use("/api/subscription-model", subscriptionModelRoutes)
app.use("/api/financial-summary", financialSummaryRoutes)

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: err.message,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
