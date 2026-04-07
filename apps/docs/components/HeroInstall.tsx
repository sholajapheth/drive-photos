'use client';

import { CopyButton } from '@/components/CopyButton';

const INSTALL = 'npm install @sholajapheth/drive-photos-react';

export function HeroInstall() {
  return (
    <div className="fade-up delay-4 hero-install">
      <span>$ {INSTALL}</span>
      <CopyButton text={INSTALL} aria-label="Copy install command" />
    </div>
  );
}
