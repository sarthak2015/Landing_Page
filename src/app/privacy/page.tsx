import type { Metadata } from "next";
import LegalPage, { Placeholder, Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Go-Speed"
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="[DATE — fill in on publish]">
      <Section heading="1. Who we are">
        <p>
          Go-Speed ("we", "us", "our") operates the website at{" "}
          <strong>speed.go-techsolution.com</strong>. This policy explains what
          information we collect from visitors and customers, why we collect it, and how it's
          used and protected.
        </p>
        <p>
          Legal business name: <Placeholder>[LEGAL BUSINESS NAME]</Placeholder>
          <br />
          Business address: <Placeholder>[BUSINESS ADDRESS]</Placeholder>
          <br />
          Contact email: <Placeholder>[SUPPORT EMAIL]</Placeholder>
        </p>
      </Section>

      <Section heading="2. Information we collect">
        <p>When you fill out our project questionnaire or book a call, we collect:</p>
        <ul>
          <li>Name, business name, email address, and phone number</li>
          <li>Project details you provide (website type, pages, features, domain/logo status, notes)</li>
          <li>Payment confirmation details from Stripe (we never see or store your full card number)</li>
          <li>Scheduling details when you book a kickoff call via Calendly</li>
        </ul>
      </Section>

      <Section heading="3. How we use your information">
        <ul>
          <li>To process your $99 payment and confirm your build slot</li>
          <li>To schedule and prepare for your kickoff call</li>
          <li>To design and build the website you requested</li>
          <li>To send receipts, confirmations, and project-related communication</li>
        </ul>
        <p>We do not sell your personal information to third parties.</p>
      </Section>

      <Section heading="4. Third-party services we use">
        <p>To operate this site, we share limited data with:</p>
        <ul>
          <li><strong>Stripe</strong> — payment processing. Card details go directly to Stripe; we never store them.</li>
          <li><strong>Supabase</strong> — secure database storage for your submitted project details.</li>
          <li><strong>Calendly</strong> — scheduling your kickoff call (name and email are shared to book the slot).</li>
        </ul>
        <p>Each of these providers has its own privacy policy governing how they handle data.</p>
      </Section>

      <Section heading="5. Data retention">
        <p>
          We retain your project and payment records for as long as needed to deliver your
          website and to comply with applicable tax, accounting, and legal obligations. You can
          request deletion of your data at any time by contacting <Placeholder>[SUPPORT EMAIL]</Placeholder>.
        </p>
      </Section>

      <Section heading="6. Your rights">
        <p>
          Depending on where you live, you may have the right to access, correct, or delete the
          personal information we hold about you, or to object to certain uses of it. To exercise
          these rights, contact us at <Placeholder>[SUPPORT EMAIL]</Placeholder>.
        </p>
      </Section>

      <Section heading="7. Changes to this policy">
        <p>
          We may update this policy from time to time. The "Last updated" date at the top of this
          page reflects the most recent version.
        </p>
      </Section>

      <Section heading="8. Contact us">
        <p>
          Questions about this policy or your data? Email us at <Placeholder>[SUPPORT EMAIL]</Placeholder>.
        </p>
      </Section>
    </LegalPage>
  );
}
