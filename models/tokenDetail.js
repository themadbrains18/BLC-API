const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const TokenNetwork = new Schema({
  networkName: {
    type: String,
    required: true,
    trim: true,
  },
  confirmations: {
    type: Number,
    required: true,
    trim: true,
  },
  Network: {
    type: String,
    required: true,
    trim: true,
  },
  type:{
    type: String,
    required: true,
    trim: true,
  },
  contractAddress: {
    type: String,
    required: false,
    trim: true,
  }
}, { timestamps: true });

let TokenNetworkModel = mongoose.model("TokenNetwork", TokenNetwork); //create model/schema using mongoose

module.exports = {
  TokenNetworkModel
}
