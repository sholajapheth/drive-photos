import { getSingletonHighlighter } from 'shiki';
import type { BundledLanguage, BundledTheme } from 'shiki';

const theme: BundledTheme = 'github-dark-dimmed';

const langs: BundledLanguage[] = [
  'tsx',
  'typescript',
  'javascript',
  'jsx',
  'bash',
  'json',
];

let highlighterPromise: ReturnType<typeof getSingletonHighlighter> | null = null;

export function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = getSingletonHighlighter({
      themes: [theme],
      langs,
    });
  }
  return highlighterPromise;
}

export function resolveLang(language: string): BundledLanguage {
  const map: Record<string, BundledLanguage> = {
    ts: 'typescript',
    js: 'javascript',
    shell: 'bash',
    sh: 'bash',
  };
  const key = language.toLowerCase();
  if (key in map) return map[key]!;
  if (langs.includes(key as BundledLanguage)) return key as BundledLanguage;
  return 'tsx';
}

export { theme as shikiTheme };
