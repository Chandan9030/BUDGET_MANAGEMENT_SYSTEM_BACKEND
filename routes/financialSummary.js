const express = require("express")
const router = express.Router()
const FinancialSummary = require("../models/FinancialSummary")

// Get all financial summary data
router.get("/", async (req, res) => {
  try {
    const financialSummary = await FinancialSummary.findOne()
    if (!financialSummary) {
      return res.status(200).json([])
    }
    res.status(200).json(financialSummary.items)
  } catch (error) {
    console.error("Error fetching financial summary data:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create or update financial summary data
router.post("/", async (req, res) => {
  try {
    const items = req.body

    // Validate input
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid data format. Expected an array of items." })
    }

    // Find existing financial summary or create new one
    let financialSummary = await FinancialSummary.findOne()

    if (financialSummary) {
      financialSummary.items = items
    } else {
      financialSummary = new FinancialSummary({ items })
    }

    await financialSummary.save()
    res.status(200).json({ message: "Financial summary data saved successfully", data: financialSummary.items })
  } catch (error) {
    console.error("Error saving financial summary data:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
