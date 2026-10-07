// pages/api/admin/visa-country.ts
import connectDB from "@/lib/db";
import VisaCountry from "@/models/VisaCountry";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    const { code, label, flag, price, processingDays } = req.body;
    try {
      const existing = await VisaCountry.findOne({ code });
      if (existing) {
        // Update
        existing.label = label;
        existing.flag = flag;
        existing.price = price;
        existing.processingDays = processingDays;
        await existing.save();
        return res.status(200).json({ message: "Updated successfully" });
      } else {
        // Create new
        await VisaCountry.create({ code, label, flag, price, processingDays });
        return res.status(201).json({ message: "Created successfully" });
      }
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  if (req.method === "GET") {
    const countries = await VisaCountry.find({});
    return res.status(200).json(countries);
  }

  return res.status(405).end(); // Method Not Allowed
}
