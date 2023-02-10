const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

var Schema = mongoose.Schema;

const Token = new Schema({
  tekenRequest: {
    type: String,
    required: true,
    trim: true,
  },
  status : {
    type : Boolean,
    required : true,
    default : true
  },
  withdraw_wallet :{
    type: String,
    required: true,
    trim: true,
  },
  user_id : {
    type : String,
    required: false,
    trim: true,
  },
  tx_hash : {
    type : String,
    required: false,
    trim: true,
  },
  tx_type : {
    type : String,
    required: false,
    trim: true,
  },
  
  networkName: {
    type: String,
    required: true,
    trim: true,
  },
  requestedAmount : {
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
  fee : {
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
  networkId: {
    type: String,
    required: false,
    trim: true,
  },
  type: {
    type: String,
    required: false,
    trim: true,
  },
  Symbol: {
    type: String,
    required: false,
    trim: true,
  },
  requestObj : {
    type: Object,
    required: false,
    trim: true,
  }
  
}, { timestamps: true });

let withdrwaModel = mongoose.model("withdraw_request", Token); //create model/schema using mongoose

module.exports = {
    withdrwaModel
}
