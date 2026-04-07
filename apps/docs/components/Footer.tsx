import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

const year = new Date().getFullYear();

const packages = [
  {
    name: '@sholajapheth/drive-photos-core',
    href: 'https://www.npmjs.com/package/@sholajapheth/drive-photos-core',
  },
  {
    name: '@sholajapheth/drive-photos-react',
    href: 'https://www.npmjs.com/package/@sholajapheth/drive-photos-react',
  },
  {
    name: '@sholajapheth/drive-photos-next',
    href: 'https://www.npmjs.com/package/@sholajapheth/drive-photos-next',
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="site-footer-col">
          <p className="site-footer-brand">drive-photos</p>
          <p className="site-footer-tagline">Google Drive photo folders in your web app.</p>
          <span className="site-footer-license">MIT License</span>
        </div>

        <div className="site-footer-col">
          <p className="site-footer-heading">Links</p>
          <ul className="site-footer-list">
            <li>
              <a
                href="https://www.npmjs.com/package/@sholajapheth/drive-photos-react"
                target="_blank"
                rel="noopener noreferrer"
              >
                npm
              </a>
            </li>
            <li>
              <a href="https://github.com/sholajapheth/drive-photos" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://github.com/sholajapheth/drive-photos/blob/main/packages/react/CHANGELOG.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                Changelog
              </a>
            </li>
            <li>
              <a
                href="https://github.com/sholajapheth/drive-photos/security"
                target="_blank"
                rel="noopener noreferrer"
              >
                Security
              </a>
            </li>
          </ul>
        </div>

        <div className="site-footer-col">
          <p className="site-footer-heading">Packages</p>
          <ul className="site-footer-packages">
            {packages.map((p) => (
              <li key={p.name}>
                <a href={p.href} target="_blank" rel="noopener noreferrer" className="site-footer-pkg">
                  <span>{p.name}</span>
                  <ExternalLink size={14} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="site-footer-bar">
        <p>
          Built with ♥ · <Link href="/">drive-photos</Link> · {year}
        </p>
      </div>
    </footer>
  );
}
