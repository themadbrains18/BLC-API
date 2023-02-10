const mongoose = require('mongoose');
const mongooseDouble = require('mongoose-double');
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var Schema = mongoose.Schema;

Schema.Types.Do

const CHAT = new Schema({
  buy_userid:{
    type: String,
    required: true,
    trim: true,
  },
  sell_userid:{
    type: String,
    required: true,
    trim: true,
  },
  postid:{
    type: String,
    required: true,
    trim: true,
  },
  orderid: {
    type: String,
    required: true,
    trim: true,
  },
  chat:{
    type: Array,
    requried: true,
    trim: true
  }
}, { timestamps: true });

let chatModel = mongoose.model("chat", CHAT); //create model/schema using mongoose

module.exports = {
  chatModel
}
