const express = require("express");
const router = express.Router();
const ProjectTracking = require("../models/ProjectTracking");
const mongoose = require("mongoose");

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Get all project tracking data
router.get("/", async (req, res) => {
  try {
    console.log("Fetching project tracking data...");
    const projectTracking = await ProjectTracking.findOne();
    
    if (!projectTracking) {
      console.log("No project tracking data found, returning empty array");
      return res.status(200).json([]);
    }
    
    console.log(`Found project tracking data with ${projectTracking.items?.length || 0} items`);
    res.status(200).json(projectTracking.items || []);
  } catch (error) {
    console.error("Error fetching project tracking data:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Server error while fetching data", 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add a single item to project tracking
router.post("/item", async (req, res) => {
  try {
    console.log("Adding new project tracking item:", req.body);
    const newItem = req.body;

    // Validate required fields
    const requiredFields = ['projectWork', 'devName'];
    for (const field of requiredFields) {
      if (!newItem[field]) {
        console.error(`Missing required field '${field}'`);
        return res.status(400).json({ 
          message: `Missing required field '${field}'` 
        });
      }
    }

    // Handle date conversion
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      
      // Handle DD/MM/YYYY format
      if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      }
      
      // Try parsing as ISO string or other formats
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    };

    // Convert date fields if present
    if (newItem.startDate) {
      const parsedDate = parseDate(newItem.startDate);
      if (parsedDate) {
        newItem.startDate = parsedDate;
      }
    }

    if (newItem.endedDate) {
      const parsedDate = parseDate(newItem.endedDate);
      if (parsedDate) {
        newItem.endedDate = parsedDate;
      }
    }

    // Remove temporary ID if present
    if (newItem._id && newItem._id.toString().startsWith('temp_')) {
      delete newItem._id;
    }

    console.log("Processed new item:", newItem);

    // Find existing project tracking or create new one
    let projectTracking = await ProjectTracking.findOne();

    if (!projectTracking) {
      console.log("Creating new project tracking document");
      projectTracking = new ProjectTracking({ items: [newItem] });
    } else {
      console.log("Adding item to existing project tracking");
      projectTracking.items.push(newItem);
    }

    const savedData = await projectTracking.save();
    
    // Get the newly added item (last item in the array)
    const addedItem = savedData.items[savedData.items.length - 1];
    
    console.log("New item added successfully with ID:", addedItem._id);
    
    res.status(201).json({
      message: "Project tracking item added successfully",
      data: addedItem
    });
  } catch (error) {
    console.error("Error adding project tracking item:", error);
    console.error("Error stack:", error.stack);
    
    // Check for specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Data validation failed", 
        error: error.message,
        details: error.errors
      });
    }
    
    res.status(500).json({ 
      message: "Server error while adding item", 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update project tracking item - FIXED VERSION
router.put("/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    const updatedData = req.body;

    console.log(`Updating item with ID: ${itemId}`);
    console.log("Update data:", updatedData);

    // Validate item ID format
    if (!itemId || typeof itemId !== "string") {
      return res.status(400).json({ message: "Invalid item ID format" });
    }

    // Check if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid MongoDB ObjectId format" });
    }

    // Improved date handling
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      
      // If already a Date object, return as-is
      if (dateStr instanceof Date) return dateStr;
      
      // Handle DD/MM/YYYY format
      if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      }
      
      // Try parsing as ISO string or other formats
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    };

    // Handle date conversion with validation
    if (updatedData.startDate !== undefined) {
      if (updatedData.startDate === "" || updatedData.startDate === null) {
        updatedData.startDate = null;
      } else {
        const parsedDate = parseDate(updatedData.startDate);
        if (!parsedDate) {
          return res.status(400).json({ message: "Invalid startDate format. Use DD/MM/YYYY" });
        }
        updatedData.startDate = parsedDate;
      }
    }

    if (updatedData.endedDate !== undefined) {
      if (updatedData.endedDate === "" || updatedData.endedDate === null) {
        updatedData.endedDate = null;
      } else {
        const parsedDate = parseDate(updatedData.endedDate);
        if (!parsedDate) {
          return res.status(400).json({ message: "Invalid endedDate format. Use DD/MM/YYYY" });
        }
        updatedData.endedDate = parsedDate;
      }
    }

    // Convert numeric fields
    const numericFields = ['salary', 'daysInvolved', 'hoursDays', 'perDayAmount', 'investDayAmount', 'perHrsAmount', 'projectCost', 'collectAmount', 'pendingAmount', 'profitForProject'];
    numericFields.forEach(field => {
      if (updatedData[field] !== undefined) {
        const numValue = Number(updatedData[field]);
        updatedData[field] = isNaN(numValue) ? 0 : numValue;
      }
    });

    // Create the update object
    const updateObj = {};
    for (const key in updatedData) {
      if (updatedData.hasOwnProperty(key) && key !== '_id' && key !== 'id') {
        updateObj[`items.$[elem].${key}`] = updatedData[key];
      }
    }

    console.log("Update object:", updateObj);

    // Convert itemId to ObjectId for proper matching
    const objectId = new mongoose.Types.ObjectId(itemId);

    // Perform the update
    const result = await ProjectTracking.updateOne(
      { "items._id": objectId }, // Find document containing the item
      { $set: updateObj },
      {
        arrayFilters: [{ "elem._id": objectId }]
      }
    );

    console.log("Update result:", result);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (result.modifiedCount === 0) {
      return res.status(200).json({ message: "No changes made (data already up to date)" });
    }

    // Fetch the updated item to return it
    const updatedDoc = await ProjectTracking.findOne(
      { "items._id": objectId },
      { "items.$": 1 }
    );

    if (!updatedDoc?.items?.[0]) {
      return res.status(404).json({ message: "Updated item not found" });
    }

    console.log("Item updated successfully");
    res.status(200).json({
      message: "Item updated successfully",
      data: updatedDoc.items[0]
    });

  } catch (error) {
    console.error("Update error:", error);
    console.error("Error stack:", error.stack);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "Invalid data format",
        error: process.env.NODE_ENV === "development" ? error.message : 'Invalid data format'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: "Data validation failed",
        error: process.env.NODE_ENV === "development" ? error.message : 'Data validation failed'
      });
    }
    
    res.status(500).json({
      message: "Failed to update item",
      error: process.env.NODE_ENV === "development" ? error.message : 'Internal server error'
    });
  }
});

// Delete item route - IMPROVED VERSION
router.delete("/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    console.log(`Deleting item with ID: ${itemId}`);

    // Validate item ID format
    if (!itemId || typeof itemId !== "string") {
      return res.status(400).json({ message: "Invalid item ID format" });
    }

    // Check if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid MongoDB ObjectId format" });
    }

    // Convert to ObjectId for proper matching
    const objectId = new mongoose.Types.ObjectId(itemId);

    const result = await ProjectTracking.updateOne(
      { "items._id": objectId }, // Find document containing the item
      { $pull: { items: { _id: objectId } } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Item not found or already deleted" });
    }

    console.log("Item deleted successfully");
    res.status(200).json({ 
      message: "Item deleted successfully",
      deletedCount: 1
    });

  } catch (error) {
    console.error("Delete error:", error);
    console.error("Error stack:", error.stack);
    
    res.status(500).json({
      message: "Failed to delete item",
      error: process.env.NODE_ENV === "development" ? error.message : 'Internal server error'
    });
  }
});

// Bulk create or update project tracking data (for compatibility)
// Alternative approach if you need to handle temporary IDs

router.put("/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    const updatedData = req.body;

    console.log(`Received ID: "${itemId}"`);

    // Handle temporary IDs (items not yet saved to database)
    if (itemId.startsWith('temp_') || itemId.startsWith('new_')) {
      return res.status(400).json({ 
        message: "Cannot update temporary item. Save the item first." 
      });
    }

    // Validate real MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      console.error(`Invalid ObjectId: ${itemId}`);
      return res.status(400).json({ 
        message: "Invalid item ID. Item may not be saved to database yet." 
      });
    }

    // Continue with update logic...
    const objectId = new mongoose.Types.ObjectId(itemId);
    
    // Your existing update code here...
    
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      message: "Failed to update item",
      error: process.env.NODE_ENV === "development" ? error.message : 'Internal server error'
    });
  }
});

// Similar approach for DELETE route
router.delete("/:id", async (req, res) => {
  try {
    const itemId = req.params.id;

    console.log(`Received ID for deletion: "${itemId}"`);

    // Handle temporary IDs
    if (itemId.startsWith('temp_') || itemId.startsWith('new_')) {
      return res.status(400).json({ 
        message: "Cannot delete temporary item. Item is not saved to database." 
      });
    }

    // Validate real MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      console.error(`Invalid ObjectId: ${itemId}`);
      return res.status(400).json({ 
        message: "Invalid item ID. Item may not be saved to database yet." 
      });
    }

    // Continue with delete logic...
    const objectId = new mongoose.Types.ObjectId(itemId);
    
    // Your existing delete code here...
    
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      message: "Failed to delete item",
      error: process.env.NODE_ENV === "development" ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;