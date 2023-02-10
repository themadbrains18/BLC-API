const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

var Schema = mongoose.Schema;

const Token = new Schema({
  coinName: {
    type: String,
    required: true,
    trim: true,
  },
  status : {
    type : Boolean,
    required : false,
    default : true
  },
  fullName :{
    type: String,
    required: true,
    trim: true,
  },
  minimum_withdraw : {
    type : SchemaTypes.Double,
    required: true,
    trim: true,
  },
  confirmations: {
    type: Number,
    required: true,
    trim: true,
  },
  decimals: {
    type: Number,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: false,
    trim: true,
  },
  tokenType:{
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: false,
    trim: true,
  },
  networkId: {
    type: String,
    required: false,
    trim: true,
  },
  networks : {
    type : Array,
    required: true,
  }
}, { timestamps: true });

let TokenModel = mongoose.model("Token", Token); //create model/schema using mongoose

module.exports = {
  TokenModel
}
