"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { useCart } from "./CartProvider";
import SearchModal from "./SearchModal";
import { IconBag, IconClose, IconMenu, IconSearch } from "./Icons";

const NAV = [
  { href: "/shop/", label: "Shop" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
  { href: "/faq/", label: "FAQ" },
];

export default function Header() {
  const { count, openCart } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="announcement">
        <p>
          {site.announcement.split("·").map((seg, i, arr) => (
            <span
              key={i}
              className={i === arr.length - 1 ? "announcement-opt" : undefined}
            >
              {i > 0 ? " · " : ""}
              {seg.trim()}
            </span>
          ))}
        </p>
      </div>
      <header className={`site-header${scrolled ? " scrolled" : ""}`}>
        <div className="header-inner">
          <button
            className="icon-btn menu-btn"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <IconMenu width={22} height={22} />
          </button>

          <nav className="main-nav" aria-label="Primary">
            {NAV.slice(0, 2).map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>

          <Link href="/" className="wordmark" aria-label={`${site.name} home`}>
            {site.name}
          </Link>

          <div className="header-right">
            <nav className="main-nav nav-right" aria-label="Secondary">
              {NAV.slice(2).map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="header-actions">
              <button
                className="icon-btn"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
              >
                <IconSearch width={21} height={21} />
              </button>
              <button className="icon-btn cart-btn" aria-label="Open cart" onClick={openCart}>
                <IconBag width={22} height={22} />
                {count > 0 && <span className="cart-count">{count}</span>}
              </button>
            </div>
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div
        className={`mobile-menu${menuOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mobile-menu-head">
          <span className="wordmark">{site.name}</span>
          <button
            className="icon-btn"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <IconClose width={22} height={22} />
          </button>
        </div>
        <nav>
          {NAV.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}
    </>
  );
}
