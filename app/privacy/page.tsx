import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-warm-muted hover:text-warm-text transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      <h1 className="font-display text-4xl text-warm-text mb-2">Privacy Policy</h1>
      <p className="text-sm text-warm-muted mb-12">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose prose-warm max-w-none space-y-8 text-warm-text">
        <section>
          <h2 className="font-display text-2xl text-warm-text mb-4">1. Information We Collect</h2>
          <p className="text-warm-muted leading-relaxed mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-warm-muted">
            <li>Account information (email address, display name)</li>
            <li>Property reviews and ratings</li>
            <li>Property information you submit</li>
            <li>Communication data when you contact us</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-warm-text mb-4">2. How We Use Your Information</h2>
          <p className="text-warm-muted leading-relaxed">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-warm-muted">
            <li>Provide, maintain, and improve our services</li>
            <li>Process and display property reviews</li>
            <li>Send you service-related communications</li>
            <li>Respond to your inquiries and requests</li>
            <li>Monitor and analyze usage patterns</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-warm-text mb-4">3. Data Storage</h2>
          <p className="text-warm-muted leading-relaxed">
            Your data is stored securely using Supabase, which stores data in the United States. We implement
            appropriate technical and organizational measures to protect your personal information against
            unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-warm-text mb-4">4. Reviewer Anonymity</h2>
          <p className="text-warm-muted leading-relaxed">
            We are committed to protecting reviewer anonymity. Your email address and user ID are never
            displayed publicly or included in API responses. Reviews are displayed as &quot;Anonymous Tenant&quot;
            to protect your privacy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-warm-text mb-4">5. Your Rights</h2>
          <p className="text-warm-muted leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-warm-muted">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Object to processing of your data</li>
            <li>Data portability</li>
          </ul>
          <p className="text-warm-muted leading-relaxed mt-4">
            To exercise these rights, please contact us at support@rentr.app
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-warm-text mb-4">6. Cookies and Tracking</h2>
          <p className="text-warm-muted leading-relaxed">
            We use cookies and similar tracking technologies to track activity on our service and hold certain
            information. You can instruct your browser to refuse all cookies or to indicate when a cookie is
            being sent.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-warm-text mb-4">7. Third-Party Services</h2>
          <p className="text-warm-muted leading-relaxed">
            We use third-party services that may collect information used to identify you:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-warm-muted">
            <li>Supabase (authentication and database)</li>
            <li>Google Places API (property search)</li>
            <li>Mapbox (map display)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-warm-text mb-4">8. Children&apos;s Privacy</h2>
          <p className="text-warm-muted leading-relaxed">
            Our service is not intended for children under 13 years of age. We do not knowingly collect
            personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-warm-text mb-4">9. Changes to This Policy</h2>
          <p className="text-warm-muted leading-relaxed">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting
            the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-warm-text mb-4">10. Contact Us</h2>
          <p className="text-warm-muted leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at support@rentr.app
          </p>
        </section>
      </div>
    </div>
  )
}
