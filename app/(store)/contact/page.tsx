import type { Metadata } from "next";
import { site } from "@/lib/site";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about an order, fit, or a return? We answer within one business day.",
};

export default function ContactPage() {
  return (
    <div className="page-width page-width--narrow main-page">
      <h1 className="main-page-title">Contact</h1>
      <div className="contact-details">
        <div>
          <h2>Email</h2>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
        <div>
          <h2>Hours</h2>
          <p>Mon to Sat, 11am to 8pm PKT</p>
        </div>
        <div>
          <h2>Pickup</h2>
          <p>Zalores Studio, DHA Phase 5, Lahore. Ready in 24 hours</p>
        </div>
      </div>
      <ContactForm />
    </div>
  );
}
