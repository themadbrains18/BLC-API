const mongoose = require('mongoose');
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var Schema = mongoose.Schema;

Schema.Types.Do

const KYC = new Schema({
  userid:{
    type: String,
    required: true,
    trim: true,
  },
  country:{
    type: String,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  email :{
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  doctype: {
    type: String,
    default : '',
    trim: true,
  },
  docnumber:{
    type: String,
    trim: true,
  },
  telegram: {
    type: String,
    trim: true,
  },
  otcfund:{
    type: String,
    trim: true,
  },
  sourcefund:{
    type: String,
    default : '',
    trim: true,
  },
  idfront:{
    type : String,
    trim: true,
  },
  idback:{
    type: String,
    trim: true
  },
  isVerified:{
    type : Boolean,
    default: false
  },
  isDraft:{
    type : Boolean,
    default: false
  }
}, { timestamps: true });

let KycModel = mongoose.model("kyc", KYC); //create model/schema using mongoose

module.exports = {
  KycModel
}
