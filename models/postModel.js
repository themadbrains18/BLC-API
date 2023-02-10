const mongoose = require('mongoose');
const mongooseDouble = require('mongoose-double');
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var Schema = mongoose.Schema;

Schema.Types.Do

const POST = new Schema({
  userid:{
    type: String,
    required: true,
    trim: true,
  },
  token:{
    type: String,
    required: true,
    trim: true,
  },
  currency: {
    type: String,
    required: true,
    trim: true,
  },
  price :{
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
  quantity: {
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
  total_qty:{
    type: SchemaTypes.Double,
    required: false,
    trim: true,
  },
  min_limit: {
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
  max_limit: {
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
  p_method:{
    type: String,
    required: true,
    trim: true,
  },
  isComplete:{
    type : Boolean,
    required : true,
    default :false
  },
  type:{
    type: String,
    required: true,
    trim: true,
  },
  payment_time:{
    type: String,
    required: true,
    trim: true,
  },
  remarks:{
    type: String,
    required: false,
    trim: true,
  },
  auto_reply:{
    type: String,
    required: false,
    trim: true,
  }
}, { timestamps: true });

let postModel = mongoose.model("user_post", POST); //create model/schema using mongoose

module.exports = {
  postModel
}
