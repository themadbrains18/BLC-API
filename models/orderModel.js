const mongoose = require('mongoose');
const mongooseDouble = require('mongoose-double');
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var Schema = mongoose.Schema;

Schema.Types.Do

const ORDER = new Schema({
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
  currency: {
    type: String,
    required: true,
    trim: true,
  },
  order_amount :{
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
  quantity: {
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
  spend_amount :{
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
  receive_amount: {
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
  spend_currency :{
    type: String,
    required: true,
    trim: true,
  },
  receive_currency: {
    type: String,
    required: true,
    trim: true,
  },
  price :{
    type: String,
    required: true,
    trim: true
  },
  token :{
    type: String,
    required: true,
    trim: true,
  },
  p_method:{
    type: String,
    trim: true,
  },
  isComplete:{
    type : Boolean,
    default :false
  },
  isCanceled:{
    type : Boolean,
    default :false
  },
  inProcess:{
    type : Boolean,
    default :true
  },
  isReleased:{
    type : Boolean,
    default :false
  },
  type :{
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

let orderModel = mongoose.model("order", ORDER); //create model/schema using mongoose

module.exports = {
  orderModel
}
