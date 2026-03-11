'use client'

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

const faqs = [
  {
    q: 'How does Tenkai pricing work?',
    a: 'Pick a plan — Starter ($150/mo), Growth ($275/mo), or Pro ($500/mo). Pay monthly, cancel anytime. No setup fees, no hidden costs. Every plan includes your full AI team and dashboard access.',
  },
  {
    q: 'Is the content actually good quality?',
    a: 'Every article goes through a 6-step workflow including EEAT compliance checks, internal review, and your final approval. Nothing publishes without your sign-off. Our content is researched, original, and optimized for both search engines and human readers.',
  },
  {
    q: "What is EEAT and why does it matter?",
    a: "EEAT stands for Experience, Expertise, Authoritativeness, and Trust — Google's framework for evaluating content quality. Our AI team is trained to produce content that demonstrates real expertise and trustworthiness, which is critical for ranking well in modern search.",
  },
  {
    q: 'Can Google detect that content is AI-generated?',
    a: "Google has stated that AI-generated content is acceptable as long as it's helpful, original, and satisfies EEAT guidelines. Our content is crafted to be genuinely useful — not generic AI filler. We focus on quality and accuracy, not just volume.",
  },
  {
    q: 'How does the AI team actually work?',
    a: 'Your Tenkai team consists of six specialized AI agents — Haruki (Strategy), Sakura (Writing), Kenji (Technical Audits), Yumi (Google Business Profile), Takeshi (Rank Monitoring), and Aiko (Reporting). They work continuously, coordinated through your dashboard where you can see their activity and approve their work.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes — all plans are month-to-month with no contracts. Cancel from your dashboard at any time. We also offer a 14-day money-back guarantee if you\'re not satisfied.',
  },
  {
    q: 'How fast is onboarding?',
    a: 'You can be up and running in under 5 minutes. Enter your URL for a free audit, pick a plan, and your Tenkai team starts working immediately. Your first strategy recommendations typically arrive within 24 hours.',
  },
  {
    q: 'When will I see results?',
    a: 'SEO is a long game — expect to see meaningful ranking improvements in 3–6 months. However, you\'ll see technical fixes and content production starting in the first week. Your dashboard shows real-time progress so you always know what\'s happening.',
  },
]

export function FAQ() {
  return (
    <section>
      <div className="w-full max-w-container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl sm:text-4xl font-serif text-charcoal mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-warm-gray">
            Everything you need to know
          </p>
        </div>

        {/* Accordion */}
        <div className="max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '100ms' }}>
          <Accordion>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={i}>
                <AccordionTrigger className="text-base font-serif text-charcoal py-5 text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-warm-gray leading-relaxed pb-4">
                    {faq.a}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
