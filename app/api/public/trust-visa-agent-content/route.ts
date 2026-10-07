import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TrustVisaAgentSection from "@/models/TrustVisaAgentSection";

export async function GET() {
  try {
    await connectDB();
    
    // Find the active trust visa agent section
    const trustVisaAgentSection = await TrustVisaAgentSection.findOne({ status: 'active' });
    
    if (!trustVisaAgentSection) {
      // Return default data if no section found
      return NextResponse.json({
        success: true,
        trustVisaAgentSection: {
          title: "How to choose the best visa agent in India whom you can trust?",
          content: `Before you start your online visa application, it's important to know the basic requirements that can make the process faster and smoother. Preparing in advance not only saves time but also improves your chances of approval when you apply for visa online.

Most countries require a valid passport with at least six months' validity and enough blank pages for visa stamps. You should also keep recent passport-sized photos that meet embassy guidelines. Depending on your purpose of travel, you may need financial proof such as bank statements, travel insurance, or supporting documents like admission letters for students or business invitations for professionals.

To get help from real professionals and save yourself from incompetent specialists, you need to take a responsible approach to choosing a visa agent in India.

Study the average cost in this area in advance, and then find out which services are included in the final price and whether you need all of them. A responsible agency does not throw around unfounded promises, so if the advertisement states 100% visa approval, then think twice about the reliability of such specialists. Very often, this promise means that the company will reimburse all the client's expenses if it is not possible to obtain entry permission.

Consultation first, payment later! Conscientious visa consultancy services, like Visa4, first conduct a personal conversation with the client, find out the nuances of his situation and only then announce the likelihood of obtaining an entry permit.

Of course, today every person can get a visa independently. But if you need to minimize the likelihood of a visa refusal, if you need to reduce the time to collect all the documents, then find the best visa agent in India in advance who has been working in this segment for many years and knows all the intricacies of tourist visa, student visa, and business visa.`,
          highlightedTexts: [
            { text: "apply for visa online", color: "text-blue-600" },
            { text: "valid passport", color: "text-green-600" },
            { text: "financial proof", color: "text-purple-600" },
            { text: "100% visa approval", color: "text-red-600" }
          ],
          imageUrl: "/visa/rocket.png",
          imageAlt: "Rocket Illustration"
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      trustVisaAgentSection
    });
  } catch (error) {
    console.error("Error fetching trust visa agent content:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
