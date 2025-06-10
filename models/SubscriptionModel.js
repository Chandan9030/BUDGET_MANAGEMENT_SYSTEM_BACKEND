const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  revenueSource: String,
  subscriptionsAvailed: Number,
  projectedMonthlyRevenue: Number,
  projectedAnnualRevenue: Number,
  subscribed: Number,
  profit: Number
});

const subscriptionModelSchema = new mongoose.Schema({
  items: [itemSchema]
});

module.exports = mongoose.model("SubscriptionModel", subscriptionModelSchema);
