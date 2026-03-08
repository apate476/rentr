import Link from 'next/link'

const POLICY_REVISION_DATE = new Date('2024-01-01')

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <Link href="/" className="text-warm-muted hover:text-warm-text text-sm transition-colors">
          ← Back to Home
        </Link>
      </div>

      <h1 className="font-display text-warm-text mb-2 text-4xl">Privacy Policy</h1>
      <p className="text-warm-muted mb-12 text-sm">
        Last updated: {POLICY_REVISION_DATE.toLocaleDateString()}
      </p>

      <div className="prose prose-warm text-warm-text max-w-none space-y-8">
        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">1. Information We Collect</h2>
          <p className="text-warm-muted mb-4 leading-relaxed">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="text-warm-muted list-disc space-y-2 pl-6">
            <li>Account information (email address, display name)</li>
            <li>Property reviews and ratings</li>
            <li>Property information you submit</li>
            <li>Communication data when you contact us</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">
            2. How We Use Your Information
          </h2>
          <p className="text-warm-muted leading-relaxed">We use the information we collect to:</p>
          <ul className="text-warm-muted list-disc space-y-2 pl-6">
            <li>Provide, maintain, and improve our services</li>
            <li>Process and display property reviews</li>
            <li>Send you service-related communications</li>
            <li>Respond to your inquiries and requests</li>
            <li>Monitor and analyze usage patterns</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">3. Data Storage</h2>
          <p className="text-warm-muted leading-relaxed">
            Your data is stored securely using Supabase, which stores data in the United States. We
            implement appropriate technical and organizational measures to protect your personal
            information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">4. Reviewer Anonymity</h2>
          <p className="text-warm-muted leading-relaxed">
            We are committed to protecting reviewer anonymity. Your email address and user ID are
            never displayed publicly or included in API responses. Reviews are displayed as
            &quot;Anonymous Tenant&quot; to protect your privacy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">5. Your Rights</h2>
          <p className="text-warm-muted mb-4 leading-relaxed">You have the right to:</p>
          <ul className="text-warm-muted list-disc space-y-2 pl-6">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Object to processing of your data</li>
            <li>Data portability</li>
          </ul>
          <p className="text-warm-muted mt-4 leading-relaxed">
            To exercise these rights, please contact us at support@rentr.app
          </p>
        </section>

        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">6. Cookies and Tracking</h2>
          <p className="text-warm-muted leading-relaxed">
            We use cookies and similar tracking technologies to track activity on our service and
            hold certain information. You can instruct your browser to refuse all cookies or to
            indicate when a cookie is being sent.
          </p>
        </section>

        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">7. Third-Party Services</h2>
          <p className="text-warm-muted leading-relaxed">
            We use third-party services that may collect information used to identify you:
          </p>
          <ul className="text-warm-muted list-disc space-y-2 pl-6">
            <li>Supabase (authentication and database)</li>
            <li>Google Places API (property search)</li>
            <li>Mapbox (map display)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">8. Children&apos;s Privacy</h2>
          <p className="text-warm-muted leading-relaxed">
            Our service is not intended for children under 13 years of age. We do not knowingly
            collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">9. Changes to This Policy</h2>
          <p className="text-warm-muted leading-relaxed">
            We may update our Privacy Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page and updating the &quot;Last updated&quot;
            date.
          </p>
        </section>

        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">10. Contact Us</h2>
          <p className="text-warm-muted leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at
            support@rentr.app
          </p>
        </section>
      </div>
    </div>
  )
}
