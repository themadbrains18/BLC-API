const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const Transfer = new Schema({
  userid:{
    type: String,
    required: true,
    trim: true,
  },
  senderAccount:{
    type : String,
    required : true,
    trim:true
  },
  recieverAccount: {
    type: String,
    required: true,
    trim: true,
  },
  coinName: {
    type: String,
    required: true,
    trim: true,
  },
  amount:{
    type: String,
    required : true,
    trim : true
  }
}, { timestamps: true });

let TransferModel = mongoose.model("Transfer", Transfer); //create model/schema using mongoose

module.exports = {
  TransferModel
}
