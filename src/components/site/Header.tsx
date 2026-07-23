export function Header() {
  return (
    <header className="site-header is-scrolled" data-header>
      <a className="brand-mark" href="/#top" aria-label="LAVIDRO Startseite">
        <img src="/assets/lavidro-brand.png" alt="" />
        <span>Lavidro</span>
      </a>
      <nav className="desktop-nav" aria-label="Hauptnavigation">
        <a href="/#module">System</a>
        <a href="/?ziel=produkte">Produkte</a>
        <a href="/#qualitaet">Qualität</a>
        <a href="/#faq">FAQ</a>
        <a href="/aboutLavidro">Über LAVIDRO</a>
      </nav>
      <a className="nav-cta" href="/#warteliste">
        Warteliste
      </a>
    </header>
  );
}
