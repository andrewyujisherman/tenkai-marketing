import Link from 'next/link'
import { Footer } from '@/components/landing/Footer'

export const metadata = {
  title: 'Privacy Policy — Tenkai Marketing',
  description: 'How Tenkai Marketing collects, uses, and protects your data.',
}

export default function PrivacyPage() {
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
            <h1 className="font-serif text-4xl text-charcoal mb-3">Privacy Policy</h1>
            <p className="text-sm text-muted-gray">Last updated: March 14, 2026</p>
          </div>

          <div className="prose-legal">
            {/* Intro */}
            <section className="mb-10">
              <p className="text-warm-gray leading-relaxed">
                Tenkai Marketing is operated by Alegius AI (&ldquo;Alegius,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use our platform at tenkai-marketing.vercel.app (the &ldquo;Service&rdquo;). By using the Service, you agree to the practices described in this policy.
              </p>
            </section>

            {/* 1 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                1. Information We Collect
              </h2>
              <h3 className="font-serif text-base text-charcoal mb-2">Information you provide directly</h3>
              <ul className="list-disc list-outside pl-5 space-y-1.5 text-warm-gray text-sm leading-relaxed mb-5">
                <li><strong className="text-charcoal">Account information:</strong> Full name, company name, email address, and password when you register.</li>
                <li><strong className="text-charcoal">Website information:</strong> Your website URL(s) submitted for SEO auditing and analysis.</li>
                <li><strong className="text-charcoal">Payment information:</strong> Billing details processed securely by Stripe. We do not store full card numbers.</li>
                <li><strong className="text-charcoal">Communications:</strong> Messages you send to our support team.</li>
              </ul>
              <h3 className="font-serif text-base text-charcoal mb-2">Information collected automatically</h3>
              <ul className="list-disc list-outside pl-5 space-y-1.5 text-warm-gray text-sm leading-relaxed">
                <li><strong className="text-charcoal">Usage data:</strong> Pages visited, features used, actions taken within the platform, and timestamps.</li>
                <li><strong className="text-charcoal">Device and log data:</strong> IP address, browser type, operating system, and referring URLs.</li>
                <li><strong className="text-charcoal">Cookies and session tokens:</strong> Authentication session cookies required to keep you logged in. See Section 5 for details.</li>
              </ul>
            </section>

            {/* 2 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                2. How We Use Your Information
              </h2>
              <ul className="list-disc list-outside pl-5 space-y-1.5 text-warm-gray text-sm leading-relaxed">
                <li>Provide, operate, and maintain the Service, including generating SEO audits, content, and reports.</li>
                <li>Process payments and manage your subscription.</li>
                <li>Send transactional communications (account confirmations, billing receipts, security alerts).</li>
                <li>Improve and personalize the Service based on aggregated usage patterns.</li>
                <li>Comply with legal obligations and enforce our Terms of Service.</li>
                <li>Respond to your support inquiries.</li>
              </ul>
              <p className="text-warm-gray text-sm leading-relaxed mt-4">
                We do not sell your personal data to third parties. We do not use your data to train AI models beyond what is necessary to deliver the Service to you.
              </p>
            </section>

            {/* 3 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                3. AI Processing Disclosure
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed mb-3">
                Tenkai Marketing uses Google Gemini AI to generate SEO audits, content recommendations, keyword analyses, and reports. When you submit your website URL, website content, or other inputs for analysis, that data is transmitted to Google&rsquo;s Gemini API for processing.
              </p>
              <p className="text-warm-gray text-sm leading-relaxed mb-3">
                By using the Service, you acknowledge and consent to this AI processing. You should not submit content through the Service that contains sensitive personal information, confidential trade secrets, or data you are not authorized to share with third-party AI services.
              </p>
              <p className="text-warm-gray text-sm leading-relaxed">
                Google&rsquo;s use of data submitted via the Gemini API is governed by Google&rsquo;s API Terms of Service and Privacy Policy. Alegius does not control Google&rsquo;s data practices beyond what is specified in our agreement with Google.
              </p>
            </section>

            {/* 4 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                4. Third-Party Services
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed mb-4">
                We use the following third-party services to operate the platform. Each is subject to its own privacy policy:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-tenkai-border">
                      <th className="text-left font-serif font-medium text-charcoal py-2 pr-4">Service</th>
                      <th className="text-left font-serif font-medium text-charcoal py-2 pr-4">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tenkai-border-light">
                    <tr>
                      <td className="py-2.5 pr-4 text-charcoal font-medium">Stripe</td>
                      <td className="py-2.5 text-warm-gray">Payment processing and subscription management</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 text-charcoal font-medium">Supabase</td>
                      <td className="py-2.5 text-warm-gray">Database hosting and user authentication</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 text-charcoal font-medium">Vercel</td>
                      <td className="py-2.5 text-warm-gray">Application hosting and CDN infrastructure</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 text-charcoal font-medium">Google Gemini AI</td>
                      <td className="py-2.5 text-warm-gray">AI content generation and SEO analysis</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 text-charcoal font-medium">Google Analytics</td>
                      <td className="py-2.5 text-warm-gray">Anonymized usage analytics on the marketing site</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 text-charcoal font-medium">Google Search Console API</td>
                      <td className="py-2.5 text-warm-gray">Fetching your site&rsquo;s search performance data when you connect your account</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 text-charcoal font-medium">Google PageSpeed API</td>
                      <td className="py-2.5 text-warm-gray">Technical performance auditing of your website</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 5 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                5. Cookies
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed mb-3">
                We use cookies solely for authentication and session management. Specifically:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-1.5 text-warm-gray text-sm leading-relaxed">
                <li><strong className="text-charcoal">Session cookies:</strong> Set by Supabase Auth to keep you logged in. These expire when you log out or after your session times out.</li>
                <li>We do not use advertising or cross-site tracking cookies.</li>
                <li>Third-party services (e.g., Google Analytics) may set their own cookies per their policies.</li>
              </ul>
              <p className="text-warm-gray text-sm leading-relaxed mt-4">
                You can disable cookies in your browser settings, but doing so will prevent you from logging into the platform.
              </p>
            </section>

            {/* 6 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                6. Data Retention
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed mb-3">
                We retain your data for as long as your account is active or as needed to provide the Service. Specifically:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-1.5 text-warm-gray text-sm leading-relaxed">
                <li>Account data is retained until you request deletion or 90 days after account closure.</li>
                <li>Audit reports and generated content are retained for as long as your subscription is active, plus 30 days after cancellation.</li>
                <li>Payment records are retained as required by applicable law (typically 7 years).</li>
                <li>Logs and anonymized analytics may be retained for up to 24 months for security and improvement purposes.</li>
              </ul>
            </section>

            {/* 7 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                7. Your Rights
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed mb-3">
                Depending on your location, you may have the following rights under GDPR, CCPA, or applicable privacy law:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-1.5 text-warm-gray text-sm leading-relaxed">
                <li><strong className="text-charcoal">Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong className="text-charcoal">Correction:</strong> Request correction of inaccurate or incomplete data.</li>
                <li><strong className="text-charcoal">Deletion:</strong> Request deletion of your personal data. We will honor deletion requests within 30 days, subject to legal retention requirements.</li>
                <li><strong className="text-charcoal">Export:</strong> Request a machine-readable export of your data.</li>
                <li><strong className="text-charcoal">Opt-out:</strong> California residents may opt out of the sale of personal information. We do not sell personal information.</li>
                <li><strong className="text-charcoal">Withdraw consent:</strong> Where processing is based on consent, you may withdraw it at any time.</li>
              </ul>
              <p className="text-warm-gray text-sm leading-relaxed mt-4">
                To exercise any of these rights, contact us at{' '}
                <a href="mailto:support@alegius.com" className="text-torii hover:text-torii-dark">
                  support@alegius.com
                </a>. We will respond within 30 days.
              </p>
            </section>

            {/* 8 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                8. Data Security
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed">
                We use industry-standard security measures including encrypted data transmission (TLS), hashed password storage, and row-level security in our database. No method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security but are committed to protecting your data using commercially reasonable safeguards.
              </p>
            </section>

            {/* 9 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                9. Children&rsquo;s Privacy
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed">
                The Service is not directed to individuals under 16 years of age. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.
              </p>
            </section>

            {/* 10 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                10. Changes to This Policy
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes by email or by posting a notice within the platform at least 14 days before the change takes effect. Continued use of the Service after the effective date constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* 11 */}
            <section className="mb-10">
              <h2 className="font-serif text-xl text-charcoal mb-4 pb-2 border-b border-tenkai-border">
                11. Contact Us
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed">
                For privacy-related questions, data requests, or concerns, contact us at:
              </p>
              <div className="mt-3 p-4 bg-cream rounded-xl border border-tenkai-border text-sm text-warm-gray leading-relaxed">
                <p className="font-medium text-charcoal">Alegius AI</p>
                <p>Tenkai Marketing Privacy Team</p>
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
              <Link href="/terms" className="text-torii hover:text-torii-dark font-medium">
                Terms of Service
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
