const mongoose = require('mongoose');
require('mongoose-double')(mongoose);

var Schema = mongoose.Schema;

Schema.Types.Do

const MEDIA = new Schema({
  userid:{
    type: String,
    required: true,
    trim: true,
  },
  type:{
    type: String,
    required: true,
    trim: true,
  },
  file:{
    type: String,
    required: true,
    trim: true,
  }
}, { timestamps: true });

let mediaModel = mongoose.model("media", MEDIA); //create model/schema using mongoose

module.exports = {
  mediaModel
}
