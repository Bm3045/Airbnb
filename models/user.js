const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require('passport');
const LocalStrategy = require('passport-local');

const userSchema =new Schema({
    email:{
        type:String,
        required:true
    }
});
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User", userSchema);