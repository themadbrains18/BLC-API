const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

var Schema = mongoose.Schema;

Schema.Types.Do

const UserAssets = new Schema({
  userID:{
    type: String,
    required: true,
    trim: true,
  },
  accountType: {
    type: String,
    required: true,
    trim: true,
  },
  walletType :{
    type: String,
    required: true,
    trim: true,
  },
  token: {
    type: String,
    required: true,
    trim: true,
  },
  token_id: {
    type: String,
    required: true,
    trim: true,
  },
  network: {
    type: String,
    required: true,
    trim: true,
  },
  balance:{
    type: SchemaTypes.Double,
    required: true,
    trim: true,
  },
}, { timestamps: true });

let UserAssetsModel = mongoose.model("UserAssets", UserAssets); //create model/schema using mongoose

module.exports = {
  UserAssetsModel
}
