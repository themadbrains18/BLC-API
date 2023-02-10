const mongoose = require('mongoose');
const mongooseDouble = require('mongoose-double');
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var Schema = mongoose.Schema;

Schema.Types.Do

const ADMINHISTORY = new Schema({
  buy_orderid:{
    type: String,
    required: true,
    trim: true,
  },
  sell_orderid:{
    type: String,
    required: true,
    trim: true,
  },
  amount:{
    type: String,
    required: true,
    trim: true,
  }
}, { timestamps: true });

let adminProfitModel = mongoose.model("adminHistory", ADMINHISTORY); //create model/schema using mongoose

module.exports = {
  adminProfitModel
}
