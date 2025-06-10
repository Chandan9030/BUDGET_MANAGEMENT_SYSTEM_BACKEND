// routes/project.js
const express = require("express")
const router = express.Router()
const Project = require("../models/Project")

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).send('OK')
})

// Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find()
    res.status(200).json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create a new project
router.post("/", async (req, res) => {
  try {
    const project = new Project(req.body)
    await project.save()
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project
    })
  } catch (error) {
    console.error("Error creating project:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get a specific project by ID
router.get("/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }
    res.status(200).json(project)
  } catch (error) {
    console.error("Error fetching project:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Update a project
router.put("/:projectId", async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      req.body,
      { new: true }
    )
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }
    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project
    })
  } catch (error) {
    console.error("Error updating project:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Delete a project
router.delete("/:projectId", async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }
    res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting project:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Task-related routes
// Get all tasks for a project
router.get("/:projectId/tasks", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }
    res.status(200).json(project.tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Add a new task to a project
router.post("/:projectId/tasks", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    const newTask = req.body
    if (!newTask.id) {
      return res.status(400).json({ message: "Task id is required" })
    }

    project.tasks.push(newTask)
    await project.save()

    res.status(201).json({
      success: true,
      message: "Task added successfully",
      data: project.tasks
    })
  } catch (error) {
    console.error("Error adding task:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Update a specific task in a project
router.put("/:projectId/tasks/:taskId", async (req, res) => {
  try {
    const { projectId, taskId } = req.params
    const updatedTask = req.body

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    const taskIndex = project.tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" })
    }

    project.tasks[taskIndex] = updatedTask
    await project.save()

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: project.tasks
    })
  } catch (error) {
    console.error("Error updating task:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Delete a specific task from a project
router.delete("/:projectId/tasks/:taskId", async (req, res) => {
  try {
    const { projectId, taskId } = req.params

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    project.tasks = project.tasks.filter(t => t.id !== taskId)
    await project.save()

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: project.tasks
    })
  } catch (error) {
    console.error("Error deleting task:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Team-related routes
// Get all team members for a project
router.get("/:projectId/team", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }
    res.status(200).json(project.team)
  } catch (error) {
    console.error("Error fetching team members:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Add a team member to a project
router.post("/:projectId/team", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    const { memberId } = req.body
    if (!memberId) {
      return res.status(400).json({ message: "Member ID is required" })
    }

    if (!project.team.includes(memberId)) {
      project.team.push(memberId)
      await project.save()
    }

    res.status(201).json({
      success: true,
      message: "Team member added successfully",
      data: project.team
    })
  } catch (error) {
    console.error("Error adding team member:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Remove a team member from a project
router.delete("/:projectId/team/:memberId", async (req, res) => {
  try {
    const { projectId, memberId } = req.params

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    project.team = project.team.filter(member => member !== memberId)
    
    // Also remove the member from any tasks they're assigned to
    project.tasks = project.tasks.map(task => {
      if (task.assignedTo === memberId) {
        return { ...task, assignedTo: "" }
      }
      return task
    })

    await project.save()

    res.status(200).json({
      success: true,
      message: "Team member removed successfully",
      data: project.team
    })
  } catch (error) {
    console.error("Error removing team member:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router