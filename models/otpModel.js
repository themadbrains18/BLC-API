const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

var Schema = mongoose.Schema;

Schema.Types.Do

const UserOtp = new Schema({
  username:{
    type: String,
    required: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

let UserOtpModel = mongoose.model("UserOtp", UserOtp); //create model/schema using mongoose

module.exports = {
  UserOtpModel
}
