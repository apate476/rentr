import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <Link href="/" className="text-warm-muted hover:text-warm-text text-sm transition-colors">
          ← Back to Home
        </Link>
      </div>

      <h1 className="font-display text-warm-text mb-2 text-4xl">Terms of Service</h1>
      <p className="text-warm-muted mb-12 text-sm">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="prose prose-warm text-warm-text max-w-none space-y-8">
        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">1. Acceptance of Terms</h2>
          <p className="text-warm-muted leading-relaxed">
            By accessing and using rentr (&quot;the Service&quot;), you accept and agree to be bound
            by the terms and provision of this agreement. If you do not agree to these Terms of
            Service, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">2. Use License</h2>
          <p className="text-warm-muted leading-relaxed">
            Permission is granted to temporarily access the materials on rentr&apos;s website for
            personal, non-commercial transitory viewing only. This is the grant of a license, not a
            transfer of title, and under this license you may not:
          </p>
          <ul className="text-warm-muted list-disc space-y-2 pl-6">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained on rentr&apos;s website</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">3. User Content</h2>
          <p className="text-warm-muted leading-relaxed">
            You are responsible for all content you post on rentr, including reviews, comments, and
            other materials. By posting content, you represent and warrant that:
          </p>
          <ul className="text-warm-muted list-disc space-y-2 pl-6">
            <li>You own or have the right to post the content</li>
            <li>The content is accurate and truthful</li>
            <li>The content does not violate any third-party rights</li>
            <li>The content is not defamatory, obscene, or otherwise illegal</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">4. Review Guidelines</h2>
          <p className="text-warm-muted leading-relaxed">
            Reviews must be based on your personal experience as a tenant. Reviews that are:
          </p>
          <ul className="text-warm-muted list-disc space-y-2 pl-6">
            <li>Fake, fraudulent, or misleading</li>
            <li>Written by property owners or their agents</li>
            <li>Containing personal attacks or hate speech</li>
            <li>Violating any applicable laws</li>
          </ul>
          <p className="text-warm-muted mt-4 leading-relaxed">
            ...may be removed at our discretion. We reserve the right to remove any content that
            violates these guidelines.
          </p>
        </section>

        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">5. DMCA Takedown Procedure</h2>
          <p className="text-warm-muted leading-relaxed">
            If you believe that content on rentr infringes your copyright, please contact us at
            support@rentr.app with:
          </p>
          <ul className="text-warm-muted list-disc space-y-2 pl-6">
            <li>A description of the copyrighted work</li>
            <li>The location of the infringing material</li>
            <li>Your contact information</li>
            <li>A statement of good faith belief</li>
            <li>A statement of accuracy under penalty of perjury</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">6. Section 230 Disclaimer</h2>
          <p className="text-warm-muted leading-relaxed">
            rentr is an interactive computer service as defined by 47 U.S.C. § 230. We are not the
            publisher or speaker of any information provided by users. We are not liable for any
            content posted by users on our platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">7. Limitation of Liability</h2>
          <p className="text-warm-muted leading-relaxed">
            In no event shall rentr or its suppliers be liable for any damages (including, without
            limitation, damages for loss of data or profit, or due to business interruption) arising
            out of the use or inability to use the materials on rentr&apos;s website.
          </p>
        </section>

        <section>
          <h2 className="font-display text-warm-text mb-4 text-2xl">8. Contact Information</h2>
          <p className="text-warm-muted leading-relaxed">
            If you have any questions about these Terms of Service, please contact us at
            support@rentr.app
          </p>
        </section>
      </div>
    </div>
  )
}
