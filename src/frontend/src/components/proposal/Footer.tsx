export default function Footer() {
  const currentYear = new Date().getFullYear();
  const utmHref = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
    window.location.hostname,
  )}`;

  return (
    <footer data-ocid="section.footer" className="bg-secondary">
      <div className="mx-auto max-w-3xl px-6 py-8 text-center">
        <a
          href={utmHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          © {currentYear}. Built with love using caffeine.ai
        </a>
      </div>
    </footer>
  );
}
