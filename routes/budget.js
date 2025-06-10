// routes/budget.js
const express = require("express")
const router = express.Router()
const Budget = require("../models/Budget")

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).send('OK')
})

// Get all budget data
router.get("/", async (req, res) => {
  try {
    const budget = await Budget.findOne()
    if (!budget) {
      return res.status(200).json([])
    }
    res.status(200).json(budget.sections)
  } catch (error) {
    console.error("Error fetching budget data:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create or update entire budget data
router.post("/", async (req, res) => {
  try {
    let budget = await Budget.findOne()
    
    if (budget) {
      // Update existing budget
      budget.sections = req.body
    } else {
      // Create new budget
      budget = new Budget({
        sections: req.body
      })
    }

    await budget.save()
    res.status(200).json({
      success: true,
      message: "Budget data saved successfully",
      data: budget.sections
    })
  } catch (error) {
    console.error("Error saving budget data:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Add new section
router.post("/section", async (req, res) => {
  try {
    const { name, id } = req.body
    
    if (!name || !id) {
      return res.status(400).json({ message: "Section name and id are required" })
    }

    let budget = await Budget.findOne()
    if (!budget) {
      budget = new Budget({ sections: [] })
    }

    const newSection = {
      id,
      name,
      items: []
    }

    budget.sections.push(newSection)
    await budget.save()

    res.status(201).json({
      success: true,
      message: "Section added successfully",
      data: budget.sections
    })
  } catch (error) {
    console.error("Error adding section:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Update specific section
router.put("/section/:sectionId", async (req, res) => {
  try {
    const { sectionId } = req.params
    const updatedSection = req.body

    const budget = await Budget.findOne()
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" })
    }

    const sectionIndex = budget.sections.findIndex(s => s.id === sectionId)
    if (sectionIndex === -1) {
      return res.status(404).json({ message: "Section not found" })
    }

    budget.sections[sectionIndex] = updatedSection
    await budget.save()

    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: budget.sections
    })
  } catch (error) {
    console.error("Error updating section:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Delete specific section
router.delete("/section/:sectionId", async (req, res) => {
  try {
    const { sectionId } = req.params

    const budget = await Budget.findOne()
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" })
    }

    budget.sections = budget.sections.filter(s => s.id !== sectionId)
    await budget.save()

    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      data: budget.sections
    })
  } catch (error) {
    console.error("Error deleting section:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Add new item to a section
router.post("/section/:sectionId/item", async (req, res) => {
  try {
    const { sectionId } = req.params
    const newItem = req.body

    if (!newItem.id) {
      return res.status(400).json({ message: "Item id is required" })
    }

    const budget = await Budget.findOne()
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" })
    }

    const section = budget.sections.find(s => s.id === sectionId)
    if (!section) {
      return res.status(404).json({ message: "Section not found" })
    }

    section.items.push(newItem)
    await budget.save()

    res.status(201).json({
      success: true,
      message: "Item added successfully",
      data: budget.sections
    })
  } catch (error) {
    console.error("Error adding item:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Update specific item in a section
router.put("/section/:sectionId/item/:itemId", async (req, res) => {
  try {
    const { sectionId, itemId } = req.params
    console.log("Section ID:", req.params)
    const updatedItem = req.body
    console.log("Updated item:", updatedItem)

    const budget = await Budget.findOne()
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" })
    }

    console.log("Budget found:", budget)

    const section = budget.sections.find(s => s.id === sectionId)
    if (!section) {
      return res.status(404).json({ message: "Section not found" })
    }
    console.log("Section found:", section)
    const itemIndex = section.items.findIndex(i => i._id == itemId)
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" })
    }
    console.log("Item found:", section.items[itemIndex])

    section.items[itemIndex] = updatedItem
    await budget.save()

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: budget.sections
    })
  } catch (error) {
    console.error("Error updating item:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Delete specific item from a section
router.delete("/section/:sectionId/item/:itemId", async (req, res) => {
  try {
    const { sectionId, itemId } = req.params

    const budget = await Budget.findOne()
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" })
    }

    const sectionIndex = budget.sections.findIndex(s => s.id === sectionId)
    if (sectionIndex === -1) {
      return res.status(404).json({ message: "Section not found" })
    }

    budget.sections[sectionIndex].items = budget.sections[sectionIndex].items.filter(
      i => i.id !== itemId
    )
    await budget.save()

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
      data: budget.sections
    })
  } catch (error) {
    console.error("Error deleting item:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router