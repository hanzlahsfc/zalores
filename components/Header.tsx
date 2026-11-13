"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { useCart } from "./CartProvider";
import SearchModal from "./SearchModal";
import {
  IconArrow,
  IconBag,
  IconClose,
  IconInstagram,
  IconMenu,
  IconPinterest,
  IconSearch,
  IconTikTok,
} from "./Icons";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop/", label: "Shop all" },
  { href: "/shop/?collection=classics", label: "Sunglasses" },
  { href: "/shop/?collection=accessories", label: "Accessories" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
];

export default function Header() {
  const { count, openCart } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const current = (href: string) =>
    href === pathname ? ("page" as const) : undefined;

  return (
    <>
      <div className="announcement-bar" role="region" aria-label="Announcement">
        <Link href="/shop/">
          Free shipping on orders over ${site.freeShippingThreshold}
          <IconArrow />
        </Link>
      </div>

      <div className="section-header">
        <header className="header page-width">
          <button
            className="icon-btn header__menu-toggle"
            aria-label="Menu"
            onClick={() => setMenuOpen(true)}
          >
            <IconMenu />
          </button>

          <Link href="/" className="header__heading">
            {site.name}
          </Link>

          <nav className="header__inline-menu" aria-label="Main">
            {NAV.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="header__menu-item"
                aria-current={current(l.href)}
              >
                <span>{l.label}</span>
              </Link>
            ))}
          </nav>

          <div className="header__icons">
            <button
              className="icon-btn"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <IconSearch />
            </button>
            <button className="icon-btn" aria-label="Cart" onClick={openCart}>
              <IconBag />
              {count > 0 && (
                <span className="cart-count-bubble" aria-hidden="true">
                  {count}
                </span>
              )}
              <span className="visually-hidden">{count} items</span>
            </button>
          </div>
        </header>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}
      <div
        className={`menu-drawer${menuOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="menu-drawer__head">
          <button
            className="icon-btn"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <IconClose />
          </button>
        </div>
        <nav className="menu-drawer__nav">
          {NAV.map((l) => (
            <Link key={l.label} href={l.href} aria-current={current(l.href)}>
              {l.label}
            </Link>
          ))}
          <Link href="/faq/" aria-current={current("/faq/")}>
            FAQ
          </Link>
        </nav>
        <div className="menu-drawer__utility">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <div className="list-social">
            <a href={site.social.instagram} aria-label="Instagram">
              <IconInstagram />
            </a>
            <a href={site.social.tiktok} aria-label="TikTok">
              <IconTikTok />
            </a>
            <a href={site.social.pinterest} aria-label="Pinterest">
              <IconPinterest />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
