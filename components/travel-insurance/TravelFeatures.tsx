import { Card } from "@/components/ui/card"
import { Shield, MapPin } from "lucide-react"

export default function TravelFeatures() {
  return (
    <section className=" py-12 md:py-20 bg-gray-50">
      <div className="w-4/5 mx-auto px-4">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-xl md:text-3xl font-bold text-brand-primary mb-4">Why Choose Our Travel Insurance?</h2>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive coverage designed to protect you and your loved ones during your travels.
          </p>
        </div>

        <div className=" w-4/5  bg-red-300 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">99% Claim Settlement</h3>
            <p className="text-sm md:text-base text-gray-600">
              Fast and reliable claim processing with industry-leading settlement ratio.
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Global Coverage</h3>
            <p className="text-sm md:text-base text-gray-600">Protection across multiple countries with comprehensive medical coverage.</p>
          </Card>
        </div>
      </div>
    </section>
  )
}
