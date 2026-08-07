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
    trustScore: {type: Number, default: 50, min: 0, max: 100},
    trustBadge: {type: String, default: "Active Citizen"},
    badges: [{type: String}],
    contributionCount: {type: Number, default: 0},
    resolvedCount: {type: Number, default: 0},
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;
