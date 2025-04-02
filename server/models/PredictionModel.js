const mongoose = require('mongoose');

const predictionModelSchema = new mongoose.Schema({
  modelName: {
    type: String,
    required: true,
    unique: true
  },
  modelType: {
    type: String,
    enum: ['price_prediction', 'recommendation'],
    required: true
  },
  modelParameters: {
    type: Object,
    required: true
  },
  accuracy: {
    type: Number,
    required: true
  },
  trainingDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const PredictionModel = mongoose.model('PredictionModel', predictionModelSchema);

module.exports = PredictionModel;
