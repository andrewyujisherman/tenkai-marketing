import { Hero } from '@/components/landing/Hero'
import { AgentShowcase } from '@/components/landing/AgentShowcase'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { ContentWorkflow } from '@/components/landing/ContentWorkflow'
import { PricingSection } from '@/components/landing/PricingSection'
import { ComparisonSection } from '@/components/landing/ComparisonSection'
import { AboutSection } from '@/components/landing/AboutSection'
import { FAQ } from '@/components/landing/FAQ'
import { Footer } from '@/components/landing/Footer'

export default function MarketingPage() {
  return (
    <>
      <Hero />

      <div className="py-section max-md:py-section-mobile">
        <AgentShowcase />
      </div>

      <div className="section-divider" />

      <div className="py-section max-md:py-section-mobile">
        <HowItWorks />
      </div>

      <div className="section-divider" />

      <div className="py-section max-md:py-section-mobile">
        <ContentWorkflow />
      </div>

      <div className="section-divider" />

      <div className="py-section max-md:py-section-mobile bg-cream">
        <PricingSection />
      </div>

      <div className="py-section max-md:py-section-mobile">
        <ComparisonSection />
      </div>

      <div className="section-divider" />

      <div className="py-section max-md:py-section-mobile">
        <AboutSection />
      </div>

      <div className="section-divider" />

      <div className="py-section max-md:py-section-mobile">
        <FAQ />
      </div>

      <div className="section-divider" />

      <div className="pt-section max-md:pt-section-mobile">
        <Footer />
      </div>
    </>
  )
}
