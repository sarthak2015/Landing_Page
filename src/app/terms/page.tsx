import type { Metadata } from "next";
import LegalPage, { Placeholder, Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service | Go-Speed"
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="[DATE — fill in on publish]">
      <Section heading="1. Agreement to terms">
        <p>
          By paying the $99 kickoff fee and using this website, you agree to these Terms of
          Service. If you do not agree, please do not proceed with payment.
        </p>
        <p>
          These services are provided by <Placeholder>[LEGAL BUSINESS NAME]</Placeholder>
          {" "}("we", "us", "our"), located at <Placeholder>[BUSINESS ADDRESS]</Placeholder>.
        </p>
      </Section>

      <Section heading="2. The service">
        <p>
          For a flat fee of $99, we lock a build slot and schedule a 30-minute kickoff call. After
          that call, we design and build a website matching the scope discussed, and deliver a
          draft within 48 hours of the call. Any pages or features beyond what's included in the
          base package may incur additional charges, which will always be agreed with you before
          any extra work begins.
        </p>
      </Section>

      <Section heading="3. Payment">
        <p>
          Payment is processed securely via Stripe at the time you submit the project
          questionnaire. The $99 fee reserves your build slot and covers the kickoff call and
          initial build. Domain registration and ongoing hosting costs, if applicable, are billed
          separately by the relevant registrar/host, not by us.
        </p>
      </Section>

      <Section heading="4. Refund policy">
        <p>
          We offer a 100% money-back guarantee: if, after the kickoff call, you decide we're not
          the right fit, or you're not satisfied with the draft, contact us and we'll issue a full
          refund of your $99 payment. To request a refund, email <Placeholder>[SUPPORT EMAIL]</Placeholder>.
        </p>
      </Section>

      <Section heading="5. Your responsibilities">
        <ul>
          <li>Provide accurate contact and project information</li>
          <li>Attend your scheduled kickoff call, or reschedule with reasonable notice</li>
          <li>Provide any content, logos, or brand assets needed to complete the build in a timely manner</li>
        </ul>
      </Section>

      <Section heading="6. Intellectual property">
        <p>
          Once your website is delivered and paid for in full, ownership of the final website
          design and code transfers to you. We retain the right to showcase completed work in our
          own portfolio and marketing materials unless you request otherwise in writing.
        </p>
      </Section>

      <Section heading="7. Limitation of liability">
        <p>
          The service is provided "as is." To the fullest extent permitted by law, we are not
          liable for indirect, incidental, or consequential damages arising from use of the
          website we build or this site itself. Our total liability for any claim is limited to
          the amount you paid us ($99).
        </p>
      </Section>

      <Section heading="8. Governing law">
        <p>
          These terms are governed by the laws of <Placeholder>[JURISDICTION]</Placeholder>,
          without regard to conflict-of-law principles.
        </p>
      </Section>

      <Section heading="9. Changes to these terms">
        <p>
          We may update these terms from time to time. Continued use of the site after changes
          means you accept the updated terms.
        </p>
      </Section>

      <Section heading="10. Contact us">
        <p>
          Questions about these terms? Email us at <Placeholder>[SUPPORT EMAIL]</Placeholder>.
        </p>
      </Section>
    </LegalPage>
  );
}
