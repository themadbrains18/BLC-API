const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

var Schema = mongoose.Schema;

const payment = new Schema({
    user_id: {
        type: String,
        required: true,
        trim: true,
    },
    pmid : {
        type: String,
        required: true,
        trim: true,
    },
    status : {
        type: Boolean,
        required: true,
        trim: true,
        default: true
    },
    pm_name : {
        type: String,
        required: true,
        trim: true,
    },
    pmObject: {
        type: Object,
        required: true,
        trim: true,
    }

}, { timestamps: true });

let userPaymentModel = mongoose.model("users_payment_methods", payment); //create model/schema using mongoose

module.exports = {
    userPaymentModel
}
