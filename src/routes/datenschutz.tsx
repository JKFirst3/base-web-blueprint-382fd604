import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({
    meta: [
      { title: "Datenschutz — Lavidro" },
      { name: "description", content: "Datenschutzerklärung von Lavidro." },
      { property: "og:title", content: "Datenschutz — Lavidro" },
      { property: "og:description", content: "Datenschutzerklärung von Lavidro." },
      { property: "og:url", content: "https://lavidro.com/datenschutz" },
    ],
    links: [{ rel: "canonical", href: "https://lavidro.com/datenschutz" }],
  }),
  component: DatenschutzPage,
});

function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight">Datenschutzerklärung</h1>
        <p className="mt-4 text-sm text-foreground/60">Stand: Juni 2026</p>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">1. Verantwortlicher</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der
            Datenschutz-Grundverordnung (DSGVO) sind:
          </p>
          <address className="mt-4 not-italic text-foreground/80 leading-relaxed">
            Robin Zach<br />
            Jonah Blümel<br />
            Ausblick 1<br />
            33100 Paderborn<br />
            E-Mail:{" "}
            <a href="mailto:lavidro@gmx.net" className="underline underline-offset-4">
              lavidro@gmx.net
            </a>
          </address>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">2. Allgemeines zur Datenverarbeitung</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies
            zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen
            erforderlich ist. Die Verarbeitung erfolgt auf Grundlage der gesetzlichen Vorgaben der
            DSGVO und des Bundesdatenschutzgesetzes (BDSG).
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">3. Hosting und Bereitstellung der Website</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Die Website wird über die Plattform <strong>Lovable</strong> bereitgestellt
            (Lovable AB, Stockholm, Schweden). Die technische Auslieferung erfolgt über das
            Content-Delivery-Network von <strong>Cloudflare, Inc.</strong> (101 Townsend St,
            San Francisco, CA 94107, USA). Beim Aufruf der Website werden technisch notwendige
            Verbindungsdaten verarbeitet, insbesondere die IP-Adresse, Zeitpunkt der Anfrage,
            aufgerufene URL, Browsertyp und Betriebssystem.
          </p>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer
            sicheren und performanten Bereitstellung der Website). Eine Übermittlung in die USA
            erfolgt auf Grundlage von Standardvertragsklauseln (Art. 46 DSGVO) sowie der
            Zertifizierung von Cloudflare nach dem EU-US Data Privacy Framework.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">4. Datenbank und Backend (Lovable Cloud / Supabase)</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Für die Speicherung der über die Formulare übermittelten Daten nutzen wir
            „Lovable Cloud", ein Backend-Service auf Basis von <strong>Supabase</strong>
            (Supabase, Inc., 970 Toa Payoh North #07-04, Singapore). Die Daten werden in einer
            verschlüsselten Datenbank in der Europäischen Union gespeichert. Mit dem Anbieter
            besteht ein Vertrag zur Auftragsverarbeitung gemäß Art. 28 DSGVO.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">5. Warteliste</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Wenn du dich in unsere Warteliste einträgst, verarbeiten wir folgende Daten:
          </p>
          <ul className="mt-3 list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
            <li>Name (optional)</li>
            <li>E-Mail-Adresse</li>
            <li>Optionale Angabe zum „Pain Point"</li>
            <li>Einwilligungsstatus</li>
            <li>Zeitpunkt der Eintragung</li>
          </ul>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Zweck der Verarbeitung ist die Information über den Produktstart von Lavidro sowie die
            Anbahnung einer Geschäftsbeziehung. Rechtsgrundlage ist deine Einwilligung
            (Art. 6 Abs. 1 lit. a DSGVO) sowie Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche
            Maßnahmen). Du kannst deine Einwilligung jederzeit mit Wirkung für die Zukunft per
            E-Mail an{" "}
            <a href="mailto:lavidro@gmx.net" className="underline underline-offset-4">
              lavidro@gmx.net
            </a>{" "}
            widerrufen. Wir speichern die Daten bis zum Widerruf bzw. bis sie für den genannten
            Zweck nicht mehr erforderlich sind.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">6. Kontaktformular</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Wenn du uns über das Kontaktformular Nachrichten zukommen lässt, verarbeiten wir
            folgende Daten:
          </p>
          <ul className="mt-3 list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
            <li>Name</li>
            <li>E-Mail-Adresse</li>
            <li>Betreff (optional)</li>
            <li>Nachrichtentext</li>
            <li>Zeitpunkt der Übermittlung</li>
          </ul>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Diese Daten werden ausschließlich zur Bearbeitung deiner Anfrage verwendet.
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Anbahnung bzw. Erfüllung eines
            Vertrags) bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung
            von Anfragen). Die Daten werden gelöscht, sobald sie für den Zweck ihrer Erhebung
            nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten
            entgegenstehen.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">7. Schriftarten (Google Fonts)</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Zur einheitlichen Darstellung von Schriftarten verwenden wir „Google Fonts"
            (Anbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland).
            Beim Aufruf der Website lädt dein Browser die benötigten Schriftarten von einem
            Google-Server. Dadurch erhält Google Kenntnis darüber, dass über deine IP-Adresse
            unsere Website aufgerufen wurde.
          </p>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer
            einheitlichen und ansprechenden Darstellung unseres Online-Angebots). Eine
            Übermittlung in die USA durch das Mutterunternehmen Google LLC kann nicht
            ausgeschlossen werden; diese erfolgt auf Grundlage von Standardvertragsklauseln und
            der Zertifizierung nach dem EU-US Data Privacy Framework. Weitere Informationen unter{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              policies.google.com/privacy
            </a>
            .
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">8. SSL-/TLS-Verschlüsselung</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Diese Website nutzt zum Schutz der Übertragung vertraulicher Inhalte eine
            SSL-/TLS-Verschlüsselung. Du erkennst eine verschlüsselte Verbindung an dem
            „https://" in der Adresszeile deines Browsers.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">9. Deine Rechte</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Dir stehen nach der DSGVO folgende Rechte zu:
          </p>
          <ul className="mt-3 list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
            <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
            <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
            <li>Recht auf Löschung (Art. 17 DSGVO)</li>
            <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
            <li>Recht auf Widerruf einer erteilten Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
          </ul>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Zur Ausübung deiner Rechte genügt eine formlose E-Mail an{" "}
            <a href="mailto:lavidro@gmx.net" className="underline underline-offset-4">
              lavidro@gmx.net
            </a>
            .
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">10. Beschwerderecht bei der Aufsichtsbehörde</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung
            deiner personenbezogenen Daten zu beschweren. Für uns zuständig ist:
          </p>
          <address className="mt-4 not-italic text-foreground/80 leading-relaxed">
            Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen<br />
            Kavalleriestr. 2–4<br />
            40213 Düsseldorf
          </address>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">11. Aktualität dieser Erklärung</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den
            aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen
            in der Datenschutzerklärung umzusetzen.
          </p>
        </section>

        <Link to="/" className="mt-12 inline-block text-sm underline underline-offset-4">
          ← Zurück zur Startseite
        </Link>
      </main>
      <Footer />
    </div>
  );
}
