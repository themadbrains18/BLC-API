const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

var Schema = mongoose.Schema;

const payment = new Schema({
    payment_method: {
        type: String,
        required: true,
        trim: true,
    },
    icon: {
        type: String,
        required: false,
        trim: true,
    },
    region: {
        type: String,
        required: true,
        trim: true,
    },
    fields: {
        type: Object,
        required: true,
        trim: true,
    }

}, { timestamps: true });

let paymentModel = mongoose.model("payment_methods", payment); //create model/schema using mongoose

module.exports = {
    paymentModel
}
