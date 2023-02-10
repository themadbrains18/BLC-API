// import mongoose from 'mongoose'
// import passportLocalMongoose from 'passport-local-mongoose'
const bcrypt = require('bcryptjs') 
const mongoose=require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

var Schema = mongoose.Schema;

const User = new Schema({
    username: {
        type: String,
        required: false,
        trim: true,
        unique: true
    },
    number:{
        type: String,
        required:false,
        trim:true,
        unique: true,
        default : ''
    },
    email:{
        type: String,
        required:false,
        trim:true,
        unique: true,
        default : ''
    },
    dial_code :{
        type: Number,
        required: false,
        trim: true
    },
    passwordHash:{
        type: String,
        required: true,
        trim:true
    },
    bep20Address:{
        type: String,
        required: false,
        trim:true
    },
    bep20Hashkey:{
        type: String,
        required: false,
        trim:true
    },
    trc20Address:{
        type: String,
        required: false,
        trim:true
    },
    trc20Hashkey:{
        type: String,
        required: false,
        trim:true
    },
    TwoFA:{
        type: String,
        required: false,
        trim:true,
        default:'disable'
    },
    kycstatus :{
        type: Boolean,
        default :false,
        required:false
    },
    tradingPassword:{
        type: String,
        required: false,
        trim:true,
        default:''
    },
    statusType :{
        type: String,
        default :'On Hold',
        required:false
    },
    registerType:{
        type: String,
        required: false,
        trim:true,
    },
    role:{
        type: String,
        required: false,
        trim:true,
    },
    secret:{
        type : Object,
        required: false,
        trim:true
    }
    
   
}, { timestamps: true });

User.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.passwordHash);
};

User.virtual("password").set(function (value) {
    this.passwordHash = bcrypt.hashSync(value, 12);
});
// Export Model
User.plugin(passportLocalMongoose);

let userColl = mongoose.model("User", User); //create model/schema using mongoose

module.exports = {
    userColl
}
