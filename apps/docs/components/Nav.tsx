'use client';

import { Check, Grid2x2, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const INSTALL = 'npm install @sholajapheth/drive-photos-react';

type NavItem = { href: string; label: string; external?: boolean };

const links: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/docs', label: 'Docs' },
  { href: '/demo', label: 'Demo' },
  { href: 'https://github.com/sholajapheth/drive-photos', label: 'GitHub', external: true },
];

function NavLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const pathname = usePathname();
  const active = !external && (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const inner = (
    <>
      <span className="nav-link-text">{label}</span>
      {active ? <span className="nav-link-dot" aria-hidden /> : null}
    </>
  );

  if (external) {
    return (
      <a className="nav-link" href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={active ? 'nav-link nav-link--active' : 'nav-link'}>
      {inner}
    </Link>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const copyInstall = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(INSTALL);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <header className="site-nav">
      <div className="site-nav-inner">
        <Link href="/" className="site-nav-brand">
          <Grid2x2 className="site-nav-logo" size={22} strokeWidth={2} aria-hidden />
          <span className="site-nav-title">drive-photos</span>
        </Link>

        <nav className="site-nav-links site-nav-links--desktop" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} external={l.external} />
          ))}
        </nav>

        <div className="site-nav-actions">
          <button
            type="button"
            className="install-copy-btn"
            onClick={copyInstall}
            title={copied ? 'Copied!' : 'Copy install command'}
          >
            {copied ? (
              <Check size={16} strokeWidth={2} aria-hidden />
            ) : (
              <span className="install-copy-text">{INSTALL}</span>
            )}
          </button>

          <button
            type="button"
            className="site-nav-burger"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
            <span className="sr-only">Menu</span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={menuOpen ? 'site-nav-mobile site-nav-mobile--open' : 'site-nav-mobile'}
        aria-hidden={!menuOpen}
      >
        <nav className="site-nav-mobile-inner" aria-label="Mobile">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} external={l.external} />
          ))}
        </nav>
      </div>
    </header>
  );
}
