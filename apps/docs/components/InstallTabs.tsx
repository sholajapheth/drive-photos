'use client';

import { CopyButton } from '@/components/CopyButton';
import { useState } from 'react';

const PKG = '@sholajapheth/drive-photos-react';

const commands = {
  npm: `npm install ${PKG}`,
  yarn: `yarn add ${PKG}`,
  pnpm: `pnpm add ${PKG}`,
} as const;

type Manager = keyof typeof commands;

export function InstallTabs() {
  const [tab, setTab] = useState<Manager>('npm');

  return (
    <div>
      <div className="install-tabs" role="tablist">
        {(['npm', 'yarn', 'pnpm'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? 'install-tab install-tab--active' : 'install-tab'}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="install-tab-panel">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            background: 'var(--code-bg)',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--text-muted)',
          }}
        >
          <span style={{ flex: 1, overflow: 'auto' }}>{commands[tab]}</span>
          <CopyButton text={commands[tab]} />
        </div>
      </div>
    </div>
  );
}
