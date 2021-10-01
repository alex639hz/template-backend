const mongoose = require('mongoose');
const config = require('../../config/config');

// const imageDbConnection = mongoose.createConnection(config.mongoUris[0], {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useUnifiedTopology: true,
//   autoIndex: true,
//   useFindAndModify: false
// });


const ImageSchema = new mongoose.Schema({

  name: {
    type: String,
    unique: true,
    required: 'id field is required',
  },

  repository: {
    type: String,
    // unique: true,
    required: 'repository field is required',
  },

  version: {
    type: String,
    required: 'version field is required',

  },

  metadata: {}

}, { timestamps: true })

ImageSchema.methods = {}

module.exports = {
  Image: mongoose.model('Image', ImageSchema),
}
