import type { Metadata } from "next";
import LegalPage, { Placeholder, Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service | Go-Speed"
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="August 12, 2026">
      <Section heading="1. Agreement to terms">
        <p>
          By booking a kickoff call and using this website, you agree to these Terms of
          Service. If you do not agree, please do not proceed with booking.
        </p>
        <p>
          These services are provided by <strong>Go Tech Solution</strong>
          {" "}("we", "us", "our"), located at <strong>Ahmedabad, Gujarat, India</strong>.
        </p>
      </Section>

      <Section heading="2. The service">
        <p>
          We offer a 30-minute kickoff call to understand your goals, brand, and scope. After
          that call, we design and build a website matching the scope discussed, and deliver a
          draft within 48 hours. Any pages or features beyond what's included in the base package
          may incur additional charges, which will always be agreed with you before any extra work
          begins. Domain registration and ongoing hosting costs, if applicable, are billed
          separately by the relevant registrar/host, not by us.
        </p>
      </Section>

      <Section heading="3. Pricing &amp; billing">
        <p>
          Pricing is discussed and agreed during or after your kickoff call. Any fees are invoiced
          separately and must be settled before the final website is handed over. We will always
          be transparent about costs before any work begins.
        </p>
      </Section>

      <Section heading="4. Refund policy">
        <p>
          We offer a 100% satisfaction guarantee: if, after the kickoff call, you decide we're not
          the right fit, or you're not satisfied with the draft, contact us and we'll make it right.
          To request a refund or discuss a concern, email <a href="mailto:Dhruv@go-techsolution.com">Dhruv@go-techsolution.com</a>.
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
          These terms are governed by the laws of <strong>India</strong>,
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
          Questions about these terms? Email us at <a href="mailto:Dhruv@go-techsolution.com">Dhruv@go-techsolution.com</a>.
        </p>
      </Section>
    </LegalPage>
  );
}
