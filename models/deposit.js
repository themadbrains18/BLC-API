const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const Deposit = new Schema({
  address:{
    type : String,
    required : true,
    trim:true
  },
  coinName: {
    type: String,
    required: true,
    trim: true,
  },
  network: {
    type: String,
    required: true,
    trim: true,
  },
  amount:{
    type: String,
    required : true,
    trim : true
  },
  tx_hash :{
    type : String,
    required : true,
    trim:true
  },
  successful :{
    type : String,
    required : true,
    trim:true
  },
  blockHeight:{
    type : String,
    required : true,
    trim:true
  },
  date:{
    type : String,
    required : true,
    trim : true
  }
}, { timestamps: true });

let DepositModel = mongoose.model("Deposit", Deposit); //create model/schema using mongoose

module.exports = {
  DepositModel
}
