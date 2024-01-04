const mongoose = require("mongoose");

const userData = new mongoose.Schema({
    name: {type:String, required:true},
    mobile: {type:Number, required:true},
    email: {type:String, required:true},
    amount: {type:Number, required:true},
    trees: {type:Number, required:true}
})

const User = mongoose.model("TreeData",userData);
module.exports = User;