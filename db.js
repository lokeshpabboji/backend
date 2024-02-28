const {connect, Schema, model} = require("mongoose");

connect('mongodb+srv://lokeshpabboji:czJHa1K2fF0aLDJb@cluster0.vgxnnam.mongodb.net/Paytm');

const userSchema = new  Schema({
    username : String,
    password : String,
    firstName : String,
    lastName : String
});

const accountSchema = new Schema({
    userId : Schema.Types.ObjectId,
    balance : Number
})

const User = model("user", userSchema);
const Account = model("account", accountSchema);


module.exports = {
    User,
    Account
}