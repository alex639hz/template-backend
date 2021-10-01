const mongoose = require('mongoose');
const config = require('../../config/config');

const DeploymentSchema = new mongoose.Schema({

  imageId: String

}, { timestamps: true })

DeploymentSchema.methods = {}

module.exports = {
  Deployment: mongoose.model('Deployment', DeploymentSchema),
}
