import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  name: String,
  street: String,
  email: String,
  country: String,
  contact: String,
  state: String,
  whatsapp: String,
  city: String,
  dob: String,
  zip: String
});

export default mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
