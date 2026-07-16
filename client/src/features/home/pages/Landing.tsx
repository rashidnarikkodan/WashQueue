import HeroSection from "../components/landingSections/HeroSection"
import FeaturesSection from "../components/landingSections/FeaturesSection"
import HowItWorksSection from "../components/landingSections/HowItWorksSection"
import ProductPreviewSection from "../components/landingSections/ProductPreviewSection"
import TechCapabilitiesSection from "../components/landingSections/TechCapabilitiesSection"
import CTASection from "../components/landingSections/CTASection"

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ProductPreviewSection />
      <TechCapabilitiesSection />
      <CTASection />
    </div>
  )
}
