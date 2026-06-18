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

        {/* 1. Datenschutz auf einen Blick */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">1. Datenschutz auf einen Blick</h2>

          <h3 className="mt-6 font-display text-lg font-semibold">Allgemeine Hinweise</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
            personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
            Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem
            Text aufgeführten Datenschutzerklärung.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">Datenerfassung auf dieser Website</h3>

          <p className="mt-3 font-medium text-foreground/90">
            Wer ist verantwortlich für die Datenerfassung auf dieser Website?
          </p>
          <p className="mt-2 text-foreground/80 leading-relaxed">
            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen
            Kontaktdaten können Sie dem Abschnitt „Hinweis zur verantwortlichen Stelle" in dieser
            Datenschutzerklärung entnehmen.
          </p>

          <p className="mt-4 font-medium text-foreground/90">Wie erfassen wir Ihre Daten?</p>
          <p className="mt-2 text-foreground/80 leading-relaxed">
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei
            kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben. Andere
            Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch
            unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B.
            Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser
            Daten erfolgt automatisch, sobald Sie diese Website betreten.
          </p>

          <p className="mt-4 font-medium text-foreground/90">Wofür nutzen wir Ihre Daten?</p>
          <p className="mt-2 text-foreground/80 leading-relaxed">
            Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu
            gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet
            werden. Sofern über die Website Verträge geschlossen oder angebahnt werden können,
            werden die übermittelten Daten auch für Vertragsangebote, Bestellungen oder sonstige
            Auftragsanfragen verarbeitet.
          </p>

          <p className="mt-4 font-medium text-foreground/90">
            Welche Rechte haben Sie bezüglich Ihrer Daten?
          </p>
          <p className="mt-2 text-foreground/80 leading-relaxed">
            Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und
            Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem
            ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine
            Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung
            jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten
            Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu
            verlangen. Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen
            Aufsichtsbehörde zu. Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können
            Sie sich jederzeit an uns wenden.
          </p>
        </section>

        {/* 2. Hosting */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">2. Hosting</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Wir hosten die Inhalte unserer Website bei folgenden Anbietern:
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">Externes Hosting</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
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

        {/* 3. Allgemeine Hinweise und Pflichtinformationen */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">
            3. Allgemeine Hinweise und Pflichtinformationen
          </h2>

          <h3 className="mt-6 font-display text-lg font-semibold">Datenschutz</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst.
            Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den
            gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung. Wenn Sie
            diese Website benutzen, werden verschiedene personenbezogene Daten erhoben.
            Personenbezogene Daten sind Daten, mit denen Sie persönlich identifiziert werden
            können. Die vorliegende Datenschutzerklärung erläutert, welche Daten wir erheben und
            wofür wir sie nutzen. Sie erläutert auch, wie und zu welchem Zweck das geschieht.
            Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der
            Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz
            der Daten vor dem Zugriff durch Dritte ist nicht möglich.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Hinweis zur verantwortlichen Stelle
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
          </p>
          <address className="mt-4 not-italic text-foreground/80 leading-relaxed">
            Robin Zach<br />
            Jonah Blümel<br />
            Ausblick 1<br />
            33100 Paderborn<br />
            <br />
            E-Mail:{" "}
            <a href="mailto:lavidro@gmx.net" className="underline underline-offset-4">
              lavidro@gmx.net
            </a>
          </address>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            {"\n"}
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">Speicherdauer</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt
            wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die
            Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen
            oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht,
            sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer
            personenbezogenen Daten haben (z. B. steuer- oder handelsrechtliche
            Aufbewahrungsfristen); im letztgenannten Fall erfolgt die Löschung nach Fortfall
            dieser Gründe.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Allgemeine Hinweise zu den Rechtsgrundlagen der Datenverarbeitung auf dieser Website
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Sofern Sie in die Datenverarbeitung eingewilligt haben, verarbeiten wir Ihre
            personenbezogenen Daten auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO bzw. Art. 9
            Abs. 2 lit. a DSGVO, sofern besondere Datenkategorien nach Art. 9 Abs. 1 DSGVO
            verarbeitet werden. Im Falle einer ausdrücklichen Einwilligung in die Übertragung
            personenbezogener Daten in Drittstaaten erfolgt die Datenverarbeitung außerdem auf
            Grundlage von Art. 49 Abs. 1 lit. a DSGVO. Sofern Sie in die Speicherung von Cookies
            oder in den Zugriff auf Informationen in Ihr Endgerät (z. B. via
            Device-Fingerprinting) eingewilligt haben, erfolgt die Datenverarbeitung zusätzlich
            auf Grundlage von § 25 Abs. 1 TDDDG. Die Einwilligung ist jederzeit widerrufbar.
            Sind Ihre Daten zur Vertragserfüllung oder zur Durchführung vorvertraglicher
            Maßnahmen erforderlich, verarbeiten wir Ihre Daten auf Grundlage des Art. 6 Abs. 1
            lit. b DSGVO. Des Weiteren verarbeiten wir Ihre Daten, sofern diese zur Erfüllung
            einer rechtlichen Verpflichtung erforderlich sind, auf Grundlage von Art. 6 Abs. 1
            lit. c DSGVO. Die Datenverarbeitung kann ferner auf Grundlage unseres berechtigten
            Interesses nach Art. 6 Abs. 1 lit. f DSGVO erfolgen. Über die jeweils im Einzelfall
            einschlägigen Rechtsgrundlagen wird in den folgenden Absätzen dieser
            Datenschutzerklärung informiert.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Empfänger von personenbezogenen Daten
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Im Rahmen unserer Geschäftstätigkeit arbeiten wir mit verschiedenen externen Stellen
            zusammen. Dabei ist teilweise auch eine Übermittlung von personenbezogenen Daten an
            diese externen Stellen erforderlich. Wir geben personenbezogene Daten nur dann an
            externe Stellen weiter, wenn dies im Rahmen einer Vertragserfüllung erforderlich
            ist, wenn wir gesetzlich hierzu verpflichtet sind (z. B. Weitergabe von Daten an
            Steuerbehörden), wenn wir ein berechtigtes Interesse nach Art. 6 Abs. 1 lit. f DSGVO
            an der Weitergabe haben oder wenn eine sonstige Rechtsgrundlage die Datenweitergabe
            erlaubt. Beim Einsatz von Auftragsverarbeitern geben wir personenbezogene Daten
            unserer Kunden nur auf Grundlage eines gültigen Vertrags über Auftragsverarbeitung
            weiter. Im Falle einer gemeinsamen Verarbeitung wird ein Vertrag über gemeinsame
            Verarbeitung geschlossen.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Widerruf Ihrer Einwilligung zur Datenverarbeitung
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung
            möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Die
            Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf
            unberührt.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Widerspruchsrecht gegen die Datenerhebung in besonderen Fällen sowie gegen
            Direktwerbung (Art. 21 DSGVO)
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Wenn die Datenverarbeitung auf Grundlage von Art. 6 Abs. 1 lit. e oder f DSGVO
            erfolgt, haben Sie jederzeit das Recht, aus Gründen, die sich aus Ihrer besonderen
            Situation ergeben, gegen die Verarbeitung Ihrer personenbezogenen Daten Widerspruch
            einzulegen; dies gilt auch für ein auf diese Bestimmungen gestütztes Profiling. Die
            jeweilige Rechtsgrundlage, auf der eine Verarbeitung beruht, entnehmen Sie dieser
            Datenschutzerklärung. Wenn Sie Widerspruch einlegen, werden wir Ihre betroffenen
            personenbezogenen Daten nicht mehr verarbeiten, es sei denn, wir können zwingende
            schutzwürdige Gründe für die Verarbeitung nachweisen, die Ihre Interessen, Rechte
            und Freiheiten überwiegen oder die Verarbeitung dient der Geltendmachung, Ausübung
            oder Verteidigung von Rechtsansprüchen (Widerspruch nach Art. 21 Abs. 1 DSGVO).
            Werden Ihre personenbezogenen Daten verarbeitet, um Direktwerbung zu betreiben, so
            haben Sie das Recht, jederzeit Widerspruch gegen die Verarbeitung Sie betreffender
            personenbezogener Daten zum Zwecke derartiger Werbung einzulegen; dies gilt auch für
            das Profiling, soweit es mit solcher Direktwerbung in Verbindung steht. Wenn Sie
            widersprechen, werden Ihre personenbezogenen Daten anschließend nicht mehr zum
            Zwecke der Direktwerbung verwendet (Widerspruch nach Art. 21 Abs. 2 DSGVO).
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Beschwerderecht bei der zuständigen Aufsichtsbehörde
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei
            einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat ihres gewöhnlichen
            Aufenthalts, ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes zu. Das
            Beschwerderecht besteht unbeschadet anderweitiger verwaltungsrechtlicher oder
            gerichtlicher Rechtsbehelfe. Für uns zuständig ist:
          </p>
          <address className="mt-4 not-italic text-foreground/80 leading-relaxed">
            Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen<br />
            Kavalleriestr. 2–4<br />
            40213 Düsseldorf
          </address>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Recht auf Datenübertragbarkeit
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in
            Erfüllung eines Vertrags automatisiert verarbeiten, an sich oder an einen Dritten in
            einem gängigen, maschinenlesbaren Format aushändigen zu lassen. Sofern Sie die
            direkte Übertragung der Daten an einen anderen Verantwortlichen verlangen, erfolgt
            dies nur, soweit es technisch machbar ist.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Auskunft, Berichtigung und Löschung
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf
            unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren
            Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf
            Berichtigung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema
            personenbezogene Daten können Sie sich jederzeit an uns wenden.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Recht auf Einschränkung der Verarbeitung
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen
            Daten zu verlangen. Hierzu können Sie sich jederzeit an uns wenden. Das Recht auf
            Einschränkung der Verarbeitung besteht in folgenden Fällen: Wenn Sie die Richtigkeit
            Ihrer bei uns gespeicherten personenbezogenen Daten bestreiten, benötigen wir in der
            Regel Zeit, um dies zu überprüfen. Für die Dauer der Prüfung haben Sie das Recht,
            die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Wenn
            die Verarbeitung Ihrer personenbezogenen Daten unrechtmäßig geschah/geschieht,
            können Sie statt der Löschung die Einschränkung der Datenverarbeitung verlangen.
            Wenn wir Ihre personenbezogenen Daten nicht mehr benötigen, Sie sie jedoch zur
            Ausübung, Verteidigung oder Geltendmachung von Rechtsansprüchen benötigen, haben Sie
            das Recht, statt der Löschung die Einschränkung der Verarbeitung Ihrer
            personenbezogenen Daten zu verlangen. Wenn Sie einen Widerspruch nach Art. 21 Abs. 1
            DSGVO eingelegt haben, muss eine Abwägung zwischen Ihren und unseren Interessen
            vorgenommen werden. Solange noch nicht feststeht, wessen Interessen überwiegen,
            haben Sie das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen
            Daten zu verlangen. Wenn Sie die Verarbeitung Ihrer personenbezogenen Daten
            eingeschränkt haben, dürfen diese Daten – von ihrer Speicherung abgesehen – nur mit
            Ihrer Einwilligung oder zur Geltendmachung, Ausübung oder Verteidigung von
            Rechtsansprüchen oder zum Schutz der Rechte einer anderen natürlichen oder
            juristischen Person oder aus Gründen eines wichtigen öffentlichen Interesses der
            Europäischen Union oder eines Mitgliedstaats verarbeitet werden.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">SSL- bzw. TLS-Verschlüsselung</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung
            vertraulicher Inhalte, wie zum Beispiel Bestellungen oder Anfragen, die Sie an uns
            als Seitenbetreiber senden, eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte
            Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von „http://" auf
            „https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile. Wenn die SSL-
            bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an uns
            übermitteln, nicht von Dritten mitgelesen werden.
          </p>
        </section>

        {/* 4. Datenerfassung auf dieser Website */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">4. Datenerfassung auf dieser Website</h2>

          <h3 className="mt-6 font-display text-lg font-semibold">Kontaktformular</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus
            dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks
            Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
            Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Die Verarbeitung dieser
            Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit
            der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher
            Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf
            unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten
            Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung (Art. 6 Abs. 1
            lit. a DSGVO) sofern diese abgefragt wurde; die Einwilligung ist jederzeit
            widerrufbar. Die von Ihnen im Kontaktformular eingegebenen Daten verbleiben bei
            uns, bis Sie uns zur Löschung auffordern, Ihre Einwilligung zur Speicherung
            widerrufen oder der Zweck für die Datenspeicherung entfällt (z. B. nach
            abgeschlossener Bearbeitung Ihrer Anfrage). Zwingende gesetzliche Bestimmungen –
            insbesondere Aufbewahrungsfristen – bleiben unberührt.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">Warteliste</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Wenn Sie sich in unsere Warteliste eintragen, verarbeiten wir folgende Daten:
          </p>
          <ul className="mt-3 list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
            <li>Name (optional)</li>
            <li>E-Mail-Adresse</li>
            <li>Optionale Angabe zum „Pain Point"</li>
            <li>Einwilligungsstatus</li>
            <li>Zeitpunkt der Eintragung</li>
          </ul>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Zweck der Verarbeitung ist die Information über den Produktstart von Lavidro sowie
            die Anbahnung einer Geschäftsbeziehung. Rechtsgrundlage ist Ihre Einwilligung
            (Art. 6 Abs. 1 lit. a DSGVO) sowie Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche
            Maßnahmen). Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft per
            E-Mail an{" "}
            <a href="mailto:lavidro@gmx.net" className="underline underline-offset-4">
              lavidro@gmx.net
            </a>{" "}
            widerrufen. Wir speichern die Daten bis zum Widerruf bzw. bis sie für den genannten
            Zweck nicht mehr erforderlich sind.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Datenbank und Backend (Lovable Cloud)
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Für die Speicherung der über die Formulare übermittelten Daten nutzen wir
            „Lovable Cloud", ein Backend-Service auf Basis von <strong>Supabase</strong>
            {" "}(Supabase, Inc., 970 Toa Payoh North #07-04, Singapore). Die Daten werden in
            einer verschlüsselten Datenbank in der Europäischen Union gespeichert. Mit dem
            Anbieter besteht ein Vertrag zur Auftragsverarbeitung gemäß Art. 28 DSGVO.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">Schriftarten (Google Fonts)</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Zur einheitlichen Darstellung von Schriftarten verwenden wir „Google Fonts"
            (Anbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland).
            Beim Aufruf der Website lädt Ihr Browser die benötigten Schriftarten von einem
            Google-Server. Dadurch erhält Google Kenntnis darüber, dass über Ihre IP-Adresse
            unsere Website aufgerufen wurde.
          </p>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer
            einheitlichen und ansprechenden Darstellung unseres Online-Angebots). Eine
            Übermittlung in die USA durch das Mutterunternehmen Google LLC kann nicht
            ausgeschlossen werden; diese erfolgt auf Grundlage von Standardvertragsklauseln und
            der Zertifizierung nach dem EU-US Data Privacy Framework. Weitere Informationen
            unter{" "}
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

        {/* 5. Aktualität */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">5. Aktualität dieser Erklärung</h2>
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
