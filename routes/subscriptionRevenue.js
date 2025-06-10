// routes/subscriptionRevenue.js
const express = require("express")
const router = express.Router()
const SubscriptionRevenue = require("../models/SubscriptionRevenue")

// Get all subscription revenue items
router.get("/", async (req, res) => {
  try {
    const items = await SubscriptionRevenue.find()
    res.json(items)
  } catch (err) {
    console.error("Error fetching subscription revenue:", err)
    res.status(500).json({ error: err.message })
  }
})

// Create new subscription revenue item
router.post("/", async (req, res) => {
  try {
    const newItem = new SubscriptionRevenue({
      ...req.body,
      // Auto-calculate annual revenue if not provided
      projectedAnnualRevenue: req.body.projectedAnnualRevenue || (req.body.projectedMonthlyRevenue * 12)
    })
    
    const savedItem = await newItem.save()
    res.status(201).json(savedItem)
  } catch (err) {
    console.error("Error creating subscription revenue item:", err)
    res.status(400).json({ error: err.message })
  }
})

// Update subscription revenue item
router.put("/:id", async (req, res) => {
  try {
    const updates = { ...req.body }
    
    // Auto-calculate annual revenue if monthly revenue is updated
    if (updates.projectedMonthlyRevenue !== undefined) {
      updates.projectedAnnualRevenue = updates.projectedMonthlyRevenue * 12
    }
    
    const updatedItem = await SubscriptionRevenue.findOneAndUpdate(
      { id: req.params.id }, // Use custom id field instead of MongoDB _id
      updates,
      { new: true, runValidators: true }
    )
    
    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found" })
    }
    
    res.json(updatedItem)
  } catch (err) {
    console.error("Error updating subscription revenue item:", err)
    res.status(400).json({ error: err.message })
  }
})

// Delete subscription revenue item
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await SubscriptionRevenue.findOneAndDelete({ id: req.params.id })
    
    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found" })
    }
    
    res.json({ message: "Item deleted successfully", id: req.params.id })
  } catch (err) {
    console.error("Error deleting subscription revenue item:", err)
    res.status(500).json({ error: err.message })
  }
})

// Bulk operations - replace all items
router.post("/bulk", async (req, res) => {
  try {
    const { items } = req.body
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Items must be an array" })
    }
    
    // Clear existing items and insert new ones
    await SubscriptionRevenue.deleteMany({})
    
    const processedItems = items.map(item => ({
      ...item,
      projectedAnnualRevenue: item.projectedAnnualRevenue || (item.projectedMonthlyRevenue * 12)
    }))
    
    const newItems = await SubscriptionRevenue.insertMany(processedItems)
    res.json(newItems)
  } catch (err) {
    console.error("Error in bulk operation:", err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
