import jwt from "jsonwebtoken";

export const generateToken = (userId)=>{
    const token = jwt.sign({userId}, process.env.JWT_SECRET || "dev_jwt_secret_key_12345", { expiresIn: "7d" });
    return token;
}