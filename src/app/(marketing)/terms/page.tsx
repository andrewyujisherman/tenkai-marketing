import Link from 'next/link'
import { Footer } from '@/components/landing/Footer'

export const metadata = {
  title: 'Terms of Service — Tenkai Marketing',
  description: 'Terms governing your use of the Tenkai Marketing platform.',
}

export default function TermsPage() {
  return (
    <>
      <div className="min-h-screen bg-ivory pt-24 pb-16">
        <div className="w-full max-w-3xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
              <span className="text-torii font-serif text-2xl font-semibold">天界</span>
              <span className="font-serif text-xl text-charcoal">Tenkai</span>
            </Link>
            <h1 className="font-serif text-4xl text-charcoal mb-3">Terms of Service</h1>
            <p className="text-sm text-muted-gray">Last updated: March 14, 2026</p>
          </div>

          <div className="prose-legal">
            {/* Intro */}
            <section className="mb-10">
              <p className="text-warm-gray leading-relaxed">
                These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;Customer,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and Alegius AI (&ldquo;Alegius,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), the operator of Tenkai Marketing at tenkai.alegius.com (the &ldquo;Service&rdquo;). By creating an account or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
              </p>
            </section>

            {/* 1 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                1. Service Description
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed mb-3">
                Tenkai Marketing is an AI-powered SEO and content marketing platform. The Service includes:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-1.5 text-warm-gray text-sm leading-relaxed">
                <li>Automated SEO audits and technical health analysis of your website.</li>
                <li>AI-generated content recommendations, blog drafts, and SEO briefs.</li>
                <li>Backlink monitoring and link-building opportunity identification.</li>
                <li>Local SEO optimization tools.</li>
                <li>Integration with Google Search Console and Google Analytics for performance reporting.</li>
                <li>Periodic reports and competitive intelligence summaries.</li>
              </ul>
              <p className="text-warm-gray text-sm leading-relaxed mt-4">
                Features available to you depend on your subscription tier. We reserve the right to modify, add, or remove features at any time with reasonable notice.
              </p>
            </section>

            {/* 2 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                2. Account Registration
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed mb-3">
                To use the Service, you must create an account and provide accurate, complete information. You are responsible for:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-1.5 text-warm-gray text-sm leading-relaxed">
                <li>Maintaining the confidentiality of your account credentials.</li>
                <li>All activity that occurs under your account.</li>
                <li>Notifying us immediately at <a href="mailto:support@alegius.com" className="text-torii hover:text-torii-dark">support@alegius.com</a> of any unauthorized use.</li>
              </ul>
              <p className="text-warm-gray text-sm leading-relaxed mt-4">
                You must be at least 18 years of age and have the legal authority to enter into these Terms on behalf of yourself or the organization you represent.
              </p>
            </section>

            {/* 3 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                3. Acceptable Use
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed mb-3">You agree not to:</p>
              <ul className="list-disc list-outside pl-5 space-y-1.5 text-warm-gray text-sm leading-relaxed">
                <li>Use the Service for any unlawful purpose or in violation of any applicable law or regulation.</li>
                <li>Submit websites or content that violate third-party intellectual property rights.</li>
                <li>Attempt to reverse engineer, decompile, or extract the source code of the platform.</li>
                <li>Use automated means to scrape, access, or abuse the Service beyond normal use.</li>
                <li>Resell, sublicense, or otherwise provide Service access to third parties without written authorization from Alegius.</li>
                <li>Interfere with the integrity, performance, or security of the Service or its underlying infrastructure.</li>
                <li>Use the Service to generate content intended to deceive, defraud, or harm others.</li>
              </ul>
              <p className="text-warm-gray text-sm leading-relaxed mt-4">
                Alegius reserves the right to suspend or terminate accounts that violate these restrictions, without refund.
              </p>
            </section>

            {/* 4 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                4. Payment Terms and Subscriptions
              </h2>
              <h3 className="font-serif text-base text-charcoal mb-2">Subscription plans</h3>
              <p className="text-warm-gray text-sm leading-relaxed mb-4">
                The Service is offered on a monthly subscription basis with three tiers: Starter, Growth, and Pro. Pricing for each tier is listed on our pricing page and may be updated from time to time.
              </p>
              <h3 className="font-serif text-base text-charcoal mb-2">Billing</h3>
              <ul className="list-disc list-outside pl-5 space-y-1.5 text-warm-gray text-sm leading-relaxed mb-4">
                <li>Subscriptions are billed monthly in advance on your billing date.</li>
                <li>Payment is processed by Stripe. By subscribing, you authorize Stripe to charge your payment method on a recurring basis.</li>
                <li>Failed payments may result in service interruption. We will attempt to notify you before suspending access.</li>
              </ul>
              <h3 className="font-serif text-base text-charcoal mb-2">Cancellation</h3>
              <p className="text-warm-gray text-sm leading-relaxed mb-4">
                You may cancel your subscription at any time through your account settings. Upon cancellation, your subscription remains active through the end of the current billing period. No further charges will be made after cancellation.
              </p>
              <h3 className="font-serif text-base text-charcoal mb-2">Refund policy</h3>
              <p className="text-warm-gray text-sm leading-relaxed">
                All subscription fees are non-refundable. We do not issue refunds or credits for partial months or unused time in a billing period. In exceptional circumstances (e.g., extended platform outage caused by Alegius), we may issue pro-rated credits at our sole discretion. To request a credit, contact <a href="mailto:support@alegius.com" className="text-torii hover:text-torii-dark">support@alegius.com</a>.
              </p>
            </section>

            {/* 5 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                5. AI-Generated Content Disclaimer
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed mb-3">
                The Service uses artificial intelligence, including Google Gemini AI, to generate SEO audits, content drafts, keyword analyses, and other outputs (&ldquo;AI Outputs&rdquo;). You acknowledge and agree that:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-1.5 text-warm-gray text-sm leading-relaxed">
                <li>AI Outputs are provided for informational and assistive purposes only. They are not professional legal, financial, or business advice.</li>
                <li>AI Outputs may contain errors, inaccuracies, or outdated information. You are solely responsible for reviewing, editing, and validating any AI Output before publishing or relying on it.</li>
                <li>Alegius makes no warranties regarding the accuracy, completeness, or fitness for purpose of AI Outputs.</li>
                <li>You are responsible for ensuring that content you publish complies with all applicable laws and does not infringe third-party rights.</li>
              </ul>
            </section>

            {/* 6 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                6. Intellectual Property
              </h2>
              <h3 className="font-serif text-base text-charcoal mb-2">Your data and content</h3>
              <p className="text-warm-gray text-sm leading-relaxed mb-4">
                You retain all ownership rights to data, websites, and content you submit to the Service (&ldquo;Customer Data&rdquo;). You grant Alegius a limited, non-exclusive license to access and process Customer Data solely to provide the Service to you.
              </p>
              <h3 className="font-serif text-base text-charcoal mb-2">Our platform</h3>
              <p className="text-warm-gray text-sm leading-relaxed mb-4">
                Alegius and its licensors own all rights to the Service, including the software, algorithms, user interface, brand assets, and documentation. These Terms do not grant you any rights to the Tenkai or Alegius brand, trademarks, or underlying technology.
              </p>
              <h3 className="font-serif text-base text-charcoal mb-2">AI Outputs</h3>
              <p className="text-warm-gray text-sm leading-relaxed">
                AI Outputs generated from your Customer Data are assigned to you. Alegius does not claim ownership over content generated specifically from your inputs.
              </p>
            </section>

            {/* 7 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                7. Disclaimer of Warranties
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed">
                THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. YOUR USE OF THE SERVICE IS AT YOUR OWN RISK.
              </p>
            </section>

            {/* 8 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                8. Limitation of Liability
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed mb-3">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ALEGIUS AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST REVENUE, LOSS OF DATA, OR BUSINESS INTERRUPTION, ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.
              </p>
              <p className="text-warm-gray text-sm leading-relaxed">
                IN NO EVENT SHALL ALEGIUS&rsquo;S TOTAL LIABILITY TO YOU EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO ALEGIUS IN THE THREE (3) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS ($100).
              </p>
            </section>

            {/* 9 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                9. Indemnification
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed">
                You agree to indemnify, defend, and hold harmless Alegius and its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising from: (a) your use of the Service in violation of these Terms; (b) Customer Data you submit; (c) your violation of any applicable law or third-party rights; or (d) content you publish based on AI Outputs.
              </p>
            </section>

            {/* 10 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                10. Termination
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed mb-3">
                Either party may terminate the relationship at any time. You may cancel your account through account settings. Alegius may suspend or terminate your access immediately, without notice, if:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-1.5 text-warm-gray text-sm leading-relaxed">
                <li>You materially breach these Terms.</li>
                <li>We are required to do so by law.</li>
                <li>We reasonably believe continued access poses a security or legal risk.</li>
              </ul>
              <p className="text-warm-gray text-sm leading-relaxed mt-4">
                Upon termination, your right to use the Service ceases immediately. Sections 5, 6, 7, 8, 9, 11, and 12 survive termination.
              </p>
            </section>

            {/* 11 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                11. Governing Law and Dispute Resolution
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed mb-3">
                These Terms are governed by the laws of the State of California, United States, without regard to its conflict-of-law provisions. You agree to submit to the exclusive jurisdiction of the state and federal courts located in California for resolution of any disputes arising from these Terms or your use of the Service.
              </p>
              <p className="text-warm-gray text-sm leading-relaxed">
                Before initiating any formal legal action, both parties agree to attempt good-faith resolution by contacting <a href="mailto:support@alegius.com" className="text-torii hover:text-torii-dark">support@alegius.com</a>.
              </p>
            </section>

            {/* 12 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                12. Modifications to These Terms
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed">
                We may update these Terms at any time. We will provide at least 14 days&rsquo; notice of material changes via email or a notice within the platform. Your continued use of the Service after the effective date of revised Terms constitutes your acceptance. If you do not agree to the updated Terms, you must cancel your subscription before the effective date.
              </p>
            </section>

            {/* 13 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                13. Miscellaneous
              </h2>
              <ul className="list-disc list-outside pl-5 space-y-1.5 text-warm-gray text-sm leading-relaxed">
                <li><strong className="text-charcoal">Entire agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Alegius regarding the Service.</li>
                <li><strong className="text-charcoal">Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in full force.</li>
                <li><strong className="text-charcoal">Waiver:</strong> Failure to enforce any provision is not a waiver of our rights to enforce it later.</li>
                <li><strong className="text-charcoal">Assignment:</strong> You may not assign these Terms without our prior written consent. We may assign them in connection with a merger or acquisition.</li>
              </ul>
            </section>

            {/* 14 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                14. Contact Us
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed">
                Questions about these Terms? Contact us at:
              </p>
              <div className="mt-3 p-4 bg-cream rounded-xl border border-tenkai-border text-sm text-warm-gray leading-relaxed">
                <p className="font-medium text-charcoal">Alegius AI</p>
                <p>Tenkai Marketing Legal Team</p>
                <p>
                  Email:{' '}
                  <a href="mailto:support@alegius.com" className="text-torii hover:text-torii-dark">
                    support@alegius.com
                  </a>
                </p>
              </div>
            </section>

            {/* Cross-link */}
            <div className="mt-12 pt-6 border-t border-tenkai-border text-sm text-warm-gray">
              Also read our{' '}
              <Link href="/privacy" className="text-torii hover:text-torii-dark font-medium">
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>
      </div>

      <div className="pt-section max-md:pt-section-mobile">
        <Footer />
      </div>
    </>
  )
}
