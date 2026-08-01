import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    fullName: {type: String, required: true},
    password: {type: String, required: true, minlength: 6},
    profilePic: {type: String, default: ""},
    address: {type: String, default: ""},
    phone: {type: String, default: ""},
    state: {type: String, default: "Karnataka"},
    district: {type: String, default: "BENGALURU URBAN"},
    taluk: {type: String, default: "Bengaluru North"},
    pincode: {type: String, default: "560001"},
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;
