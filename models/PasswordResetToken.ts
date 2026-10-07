import mongoose, { Schema, model, models } from "mongoose";

const PasswordResetTokenSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true },
  expires: { type: Date, required: true }
});

export default models.PasswordResetToken || model("PasswordResetToken", PasswordResetTokenSchema);
