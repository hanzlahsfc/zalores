import Link from "next/link";
import { site } from "@/lib/site";
import { IconInstagram, IconPinterest, IconTikTok } from "./Icons";
import NewsletterForm from "./NewsletterForm";
import PaymentIcons from "./PaymentIcons";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-newsletter">
        <div>
          <h2 className="footer-news-title">First dibs on new drops.</h2>
          <p className="footer-news-sub">
            10% off your first order when you join. No spam, just frames worth
            seeing.
          </p>
        </div>
        <NewsletterForm />
      </div>

      <div className="footer-grid">
        <div className="footer-brand">
          <span className="wordmark">{site.name}</span>
          <p>{site.description}</p>
          <div className="social-row">
            <a href={site.social.instagram} aria-label="Instagram">
              <IconInstagram width={20} height={20} />
            </a>
            <a href={site.social.tiktok} aria-label="TikTok">
              <IconTikTok width={20} height={20} />
            </a>
            <a href={site.social.pinterest} aria-label="Pinterest">
              <IconPinterest width={20} height={20} />
            </a>
          </div>
        </div>

        <nav className="footer-col" aria-label="Shop">
          <h3>Shop</h3>
          <Link href="/shop/">All sunglasses</Link>
          <Link href="/shop/?collection=classics">The Classics</Link>
          <Link href="/shop/?collection=limited">Limited &amp; Collabs</Link>
          <Link href="/shop/?collection=accessories">Accessories</Link>
        </nav>

        <nav className="footer-col" aria-label="Company">
          <h3>Company</h3>
          <Link href="/about/">About</Link>
          <Link href="/contact/">Contact</Link>
          <Link href="/faq/">FAQ</Link>
        </nav>

        <nav className="footer-col" aria-label="Support">
          <h3>Support</h3>
          <Link href="/policies/shipping-returns/">Shipping &amp; returns</Link>
          <Link href="/policies/privacy/">Privacy</Link>
          <Link href="/policies/terms/">Terms</Link>
        </nav>
      </div>

      <div className="footer-base">
        <span>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </span>
        <PaymentIcons light />
      </div>
    </footer>
  );
}
