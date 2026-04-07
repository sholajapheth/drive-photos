import { CopyButton } from '@/components/CopyButton';
import { getHighlighter, resolveLang, shikiTheme } from '@/lib/shiki';

type CodeBlockProps = {
  code: string;
  language: string;
  filename?: string;
  highlight?: number[];
};

export async function CodeBlock({ code, language, filename, highlight = [] }: CodeBlockProps) {
  const highlighter = await getHighlighter();
  const lang = resolveLang(language);
  const lines = highlighter.codeToTokensBase(code, {
    lang,
    theme: shikiTheme,
  });

  const hl = new Set(highlight);

  return (
    <div className="code-block">
      <div className="code-block-bar">
        {filename ? <span className="code-block-filename">{filename}</span> : <span />}
        <span className="code-block-lang">{language}</span>
        <CopyButton text={code} aria-label="Copy code" />
      </div>
      <div className="code-block-scroll">
        <pre className="code-block-pre">
          <code>
            {lines.map((line, i) => {
              const n = i + 1;
              const isHl = hl.has(n);
              return (
                <div key={n} className={isHl ? 'code-line code-line--hl' : 'code-line'}>
                  <span className="code-line-num">{n}</span>
                  <span className="code-line-content">
                    {line.map((t, j) => (
                      <span key={j} style={{ color: t.color }}>
                        {t.content}
                      </span>
                    ))}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
