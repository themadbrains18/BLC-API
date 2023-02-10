const mongoose = require('mongoose');
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var Schema = mongoose.Schema;

Schema.Types.Do

const MARKETBUYSELL = new Schema({
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
  user_address: {
    type: String,
    required: false,
    trim: true,
  },
  market_type :{
    type: String,
    required: true,
    trim: true,
  },
  order_type :{
    type: String,
    required: true,
    trim: true,
  },
  limit_usdt: {
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
  volume_usdt :{
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
  amount_token:{
    type: SchemaTypes.Double,
    trim: true,
  },
  status:{
    type : String,
    default :'pending'
  },
  isCanceled:{
    type : Boolean,
    default :false
  }
}, { timestamps: true });

let marketBuySellModel = mongoose.model("buysell", MARKETBUYSELL); //create model/schema using mongoose

module.exports = {
  marketBuySellModel
}
