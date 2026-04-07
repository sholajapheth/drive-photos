'use client';

import { Menu } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type Item = { id: string; label: string };

type Group = { title: string; items: Item[] };

const groups: Group[] = [
  {
    title: 'Getting Started',
    items: [
      { id: 'folder-setup', label: 'Folder setup & public access' },
      { id: 'installation', label: 'Installation' },
      { id: 'quick-start', label: 'Quick start' },
      { id: 'migration', label: 'Migration guide' },
    ],
  },
  {
    title: 'Packages',
    items: [
      { id: 'pkg-core', label: '@drive-photos/core' },
      { id: 'pkg-react', label: '@drive-photos/react' },
      { id: 'pkg-next', label: '@drive-photos/next' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { id: 'props', label: 'DriveGallery props' },
      { id: 'hook', label: 'useDriveGallery hook' },
      { id: 'create-photos-route', label: 'createPhotosRoute' },
      { id: 'create-photo-proxy', label: 'createPhotoProxyRoute' },
    ],
  },
  {
    title: 'Security',
    items: [
      { id: 'security', label: 'Security model' },
      { id: 'api-key-security', label: 'Google API key checklist' },
    ],
  },
];

export function DocsSidebar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('folder-setup');

  useEffect(() => {
    const ids = groups.flatMap((g) => g.items.map((i) => i.id));
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: '-40% 0px -45% 0px', threshold: [0, 0.1, 0.25] }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const onNav = useCallback((id: string) => {
    setActive(id);
    setOpen(false);
  }, []);

  return (
    <aside className="docs-sidebar">
      <button type="button" className="docs-sidebar-toggle" onClick={() => setOpen((o) => !o)}>
        <span>On this page</span>
        <Menu size={18} />
      </button>
      <nav
        className={open ? 'docs-nav-panel docs-nav-panel--open' : 'docs-nav-panel'}
        aria-label="Documentation sections"
      >
        {groups.map((g) => (
          <div key={g.title}>
            <p className="docs-nav-group-title">{g.title}</p>
            {g.items.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={
                  active === item.id ? 'docs-nav-link docs-nav-link--active' : 'docs-nav-link'
                }
                onClick={() => onNav(item.id)}
              >
                {item.label}
              </a>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
