const mongoose = require('mongoose');
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var Schema = mongoose.Schema;

Schema.Types.Do

const MARKETHISTORY = new Schema({
  buyer_orderid:{
    type: String,
    required: true,
    trim: true,
  },
  seller_orderid:{
    type: String,
    required: true,
    trim: true,
  },
  buyer_userid:{
    type: String,
    required: true,
    trim: true,
  },
  seller_userid:{
    type: String,
    required: true,
    trim: true,
  },
  token:{
    type: String,
    required: true,
    trim: true,
  },
  market_type :{
    type: String,
    required: true,
    trim: true,
  },
  buyer_limit: {
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
  seller_limit: {
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
  buyer_usdt_amount :{
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
  seller_paying_usdt_amount :{
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
  seller_pending_usdt_amount :{
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
  buyer_token_amount:{
    type: SchemaTypes.Double,
    trim: true,
  },
  seller_token_amount:{
    type: SchemaTypes.Double,
    trim: true,
  },
  seller_total_token:{
    type: SchemaTypes.Double,
    trim: true,
  }
}, { timestamps: true });

let marketHistoryModel = mongoose.model("markethistory", MARKETHISTORY); //create model/schema using mongoose

module.exports = {
  marketHistoryModel
}
