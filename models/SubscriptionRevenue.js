// models/SubscriptionRevenue.js
const mongoose = require("mongoose")

const SubscriptionRevenueSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    revenueSource: {
      type: String,
      required: true,
      default: "New Revenue Source"
    },
    subscriptionsAvailed: {
      type: Number,
      default: 0,
      min: 0
    },
    projectedMonthlyRevenue: {
      type: Number,
      default: 0,
      min: 0
    },
    projectedAnnualRevenue: {
      type: Number,
      default: 0,
      min: 0
    },
    subscribed: {
      type: Number,
      default: 0,
      min: 0
    },
    profit: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

// Index for better query performance
SubscriptionRevenueSchema.index({ id: 1 })

// Pre-save middleware to auto-calculate annual revenue
SubscriptionRevenueSchema.pre('save', function(next) {
  if (this.projectedMonthlyRevenue !== undefined && !this.projectedAnnualRevenue) {
    this.projectedAnnualRevenue = this.projectedMonthlyRevenue * 12
  }
  next()
})

module.exports = mongoose.model("SubscriptionRevenue", SubscriptionRevenueSchema)