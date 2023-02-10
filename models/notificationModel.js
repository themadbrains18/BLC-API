const mongoose = require('mongoose');
const mongooseDouble = require('mongoose-double');
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var Schema = mongoose.Schema;

Schema.Types.Do

const NOTIFICATION = new Schema({
  sender:{
    type: String,
    required: true,
    trim: true,
  },
  receiver:{
    type: String,
    required: true,
    trim: true,
  },
  type:{
    type: String,
    required: true,
    trim: true,
  },
  orderid: {
    type: String,
    required: false,
    trim: true,
  },
  status: {
    type: String,
    required: false,
    trim: true,
    default : 'active'
  },
  message: {
    type: String,
    required: false,
    trim: true,
  },
}, { timestamps: true });

let notificationModel = mongoose.model("notification", NOTIFICATION); //create model/schema using mongoose

module.exports = {
  notificationModel
}
