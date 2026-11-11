import type { Metadata } from "next";
import { site } from "@/lib/site";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about an order, fit, or a return? We answer within one business day.",
};

export default function ContactPage() {
  return (
    <div className="page-wrap page-narrow">
      <header className="page-head">
        <span className="eyebrow">Talk to us</span>
        <h1>Contact</h1>
        <p className="page-sub">
          Real humans, one business day. Order question? Include your order
          number for the fastest answer.
        </p>
      </header>

      <div className="contact-grid">
        <ContactForm />
        <aside className="contact-side">
          <div className="contact-block">
            <h3>Email</h3>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
          <div className="contact-block">
            <h3>Hours</h3>
            <p>Mon–Fri, 9am–6pm ET</p>
          </div>
          <div className="contact-block">
            <h3>Returns</h3>
            <p>
              Start a return any time within 30 days — details in{" "}
              <a href="/policies/shipping-returns/">Shipping &amp; returns</a>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
