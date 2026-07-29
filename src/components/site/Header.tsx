export function Header() {
  return (
    <header className="site-header is-scrolled" data-header>
      <a className="brand-mark" href="/#top" aria-label="LAVIDRO Startseite">
        <img src="/assets/lavidro-wordmark.svg" alt="" />
      </a>
      <nav className="desktop-nav" aria-label="Hauptnavigation">
        <a className="nav-optional" href="/#module">
          System
        </a>
        <a href="/?ziel=produkte">Produkte</a>
        <a className="nav-optional" href="/#qualitaet">
          Qualität
        </a>
        <a href="/#faq">FAQ</a>
        <a href="/aboutLavidro">Über LAVIDRO</a>
      </nav>
      <a className="nav-cta" href="/#warteliste">
        LAVIDRO live erleben
      </a>
    </header>
  );
}
