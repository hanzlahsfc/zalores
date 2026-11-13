import Link from "next/link";
import { site } from "@/lib/site";
import { IconCaret, IconInstagram, IconPinterest, IconTikTok } from "./Icons";
import NewsletterForm from "./NewsletterForm";
import PaymentIcons from "./PaymentIcons";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="page-width">
        <div className="footer__blocks">
          <div>
            <h2 className="footer-block__heading">Shop</h2>
            <ul className="footer-block__links">
              <li><Link href="/shop/">Shop all</Link></li>
              <li><Link href="/shop/?collection=classics">The Classics</Link></li>
              <li><Link href="/shop/?collection=limited">Limited &amp; Collabs</Link></li>
              <li><Link href="/shop/?collection=accessories">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="footer-block__heading">Info</h2>
            <ul className="footer-block__links">
              <li><Link href="/about/">About us</Link></li>
              <li><Link href="/contact/">Contact</Link></li>
              <li><Link href="/faq/">FAQ</Link></li>
              <li><Link href="/policies/shipping-returns/">Shipping &amp; returns</Link></li>
            </ul>
          </div>
          <div className="footer-block--text">
            <h2 className="footer-block__heading">Our mission</h2>
            <p className="footer-block__text">
              Metal frames assembled by hand and fitted with real mineral-glass
              lenses. Fewer, better pairs, built to be repaired rather than
              replaced.
            </p>
          </div>
          <div className="footer-block--newsletter">
            <h2 className="footer-block__heading">Subscribe to our emails</h2>
            <p className="footer-block__text" style={{ marginBottom: 16 }}>
              Be the first to know about new collections and exclusive offers.
            </p>
            <NewsletterForm />
            <div className="list-social">
              <a href={site.social.instagram} aria-label="Instagram"><IconInstagram /></a>
              <a href={site.social.tiktok} aria-label="TikTok"><IconTikTok /></a>
              <a href={site.social.pinterest} aria-label="Pinterest"><IconPinterest /></a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer__content-bottom">
        <div className="page-width">
          <div className="footer__bottom-row">
            <div>
              <span className="localization-label">Country/region</span>
              <button className="localization-button" type="button">
                United States | USD $ <IconCaret />
              </button>
            </div>
            <PaymentIcons />
          </div>
          <div className="footer__copyright">
            <span>© {new Date().getFullYear()}, {site.name}</span>
            <Link href="/policies/shipping-returns/">Refund policy</Link>
            <Link href="/policies/privacy/">Privacy policy</Link>
            <Link href="/policies/terms/">Terms of service</Link>
            <Link href="/contact/">Contact information</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
