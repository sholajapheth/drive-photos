'use client';

import { Check, Copy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type CopyButtonProps = {
  text: string;
  className?: string;
  'aria-label'?: string;
};

export function CopyButton({ text, className, 'aria-label': ariaLabel }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [text]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      className={['copy-btn', copied ? 'copy-btn--success' : '', className].filter(Boolean).join(' ')}
      onClick={onCopy}
      title={copied ? 'Copied!' : 'Copy'}
      aria-label={ariaLabel ?? (copied ? 'Copied' : 'Copy')}
    >
      {copied ? (
        <Check className="copy-btn-icon" size={16} strokeWidth={2} aria-hidden />
      ) : (
        <Copy className="copy-btn-icon" size={16} strokeWidth={2} aria-hidden />
      )}
    </button>
  );
}
