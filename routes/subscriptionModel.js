const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const SubscriptionModel = require("../models/SubscriptionModel");

// Get all subscription model items
router.get("/", async (req, res) => {
  try {
    const items = await SubscriptionModel.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Error fetching subscription models:", err);
    res.status(500).json({ 
      error: "Failed to fetch subscription models",
      details: err.message 
    });
  }
});

// Create new subscription model item
router.post("/", async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      // Auto-calculate annual revenue if not provided
      projectedAnnualRevenue: req.body.projectedAnnualRevenue || 
        (req.body.projectedMonthlyRevenue ? req.body.projectedMonthlyRevenue * 12 : 0)
    };

    const newItem = new SubscriptionModel(itemData);
    const savedItem = await newItem.save();
    
    res.status(201).json(savedItem);
  } catch (err) {
    console.error("Error creating subscription model item:", err);
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: "Subscription model with this ID already exists" 
      });
    }
    
    res.status(400).json({ 
      error: "Failed to create subscription model",
      details: err.message 
    });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const itemId =  new mongoose.Types.ObjectId(req.params.id); // convert to ObjectId
    const updates = { ...req.body };

    // Auto-calculate annual revenue if only monthly is provided
    if (updates.projectedMonthlyRevenue && !updates.projectedAnnualRevenue) {
      updates.projectedAnnualRevenue = updates.projectedMonthlyRevenue * 12;
    }

    const updatedDoc = await SubscriptionModel.findOneAndUpdate(
      { "items.id": itemId },
      {
        $set: {
          "items.$[elem].revenueSource": updates.revenueSource,
          "items.$[elem].subscriptionsAvailed": updates.subscriptionsAvailed,
          "items.$[elem].projectedMonthlyRevenue": updates.projectedMonthlyRevenue,
          "items.$[elem].projectedAnnualRevenue": updates.projectedAnnualRevenue,
          "items.$[elem].subscribed": updates.subscribed,
          "items.$[elem].profit": updates.profit
        }
      },
      {
        arrayFilters: [{ "elem.id": itemId }],
        new: true,
        runValidators: true
      }
    );

    if (!updatedDoc) {
      return res.status(404).json({ error: "Subscription item not found", id: req.params.id });
    }

    res.json(updatedDoc);
  } catch (err) {
    console.error("Error updating subscription item:", err);
    res.status(400).json({ error: "Failed to update item", details: err.message });
  }
});



// Delete a subscription model item by custom id
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await SubscriptionModel.findOneAndDelete({ 
      id: req.params.id 
    });

    if (!deletedItem) {
      return res.status(404).json({ 
        error: "Subscription model not found",
        id: req.params.id 
      });
    }

    res.json({ 
      message: "Subscription model deleted successfully", 
      id: req.params.id 
    });
  } catch (err) {
    console.error("Error deleting subscription model item:", err);
    res.status(500).json({ 
      error: "Failed to delete subscription model",
      details: err.message 
    });
  }
});

// Bulk operation - replace all models
router.post("/bulk", async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ 
        error: "Request body must contain an 'items' array" 
      });
    }

    // Validate each item has required fields
    const validatedItems = items.map(item => ({
      ...item,
      // Ensure all required fields have defaults
      id: item.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
      solpType: item.solpType || "Online",
      revenueSource: item.revenueSource || "New Plan",
      subscriptionsAvailed: item.subscriptionsAvailed || 0,
      projectedMonthlyRevenue: item.projectedMonthlyRevenue || 0,
      projectedAnnualRevenue: item.projectedAnnualRevenue || 
        (item.projectedMonthlyRevenue ? item.projectedMonthlyRevenue * 12 : 0),
      subscribed: item.subscribed || 0,
      profit: item.profit || 0,
      getSubscriptionDate: item.getSubscriptionDate || Date.now()
    }));

    // Delete all existing documents
    await SubscriptionModel.deleteMany({});

    // Insert all new items
    const savedItems = await SubscriptionModel.insertMany(validatedItems);
    
    res.json({
      message: "Bulk operation completed successfully",
      count: savedItems.length,
      items: savedItems
    });
  } catch (err) {
    console.error("Error in bulk operation:", err);
    res.status(500).json({ 
      error: "Bulk operation failed",
      details: err.message 
    });
  }
});

// Get single item by custom id
router.get("/:id", async (req, res) => {
  try {
    const item = await SubscriptionModel.findOne({ id: req.params.id });
    
    if (!item) {
      return res.status(404).json({ 
        error: "Subscription model not found",
        id: req.params.id 
      });
    }
    
    res.json(item);
  } catch (err) {
    console.error("Error fetching subscription model:", err);
    res.status(500).json({ 
      error: "Failed to fetch subscription model",
      details: err.message 
    });
  }
});

module.exports = router;