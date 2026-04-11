type PackageBadgeProps = {
  label: string;
  href?: string;
  variant?: 'default' | 'accent';
};

export function PackageBadge({ label, href, variant = 'default' }: PackageBadgeProps) {
  const className = variant === 'accent' ? 'package-badge package-badge--accent' : 'package-badge';
  if (href) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }
  return <span className={className}>{label}</span>;
}
