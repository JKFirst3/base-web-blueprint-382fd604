import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({
    meta: [
      { title: "Datenschutz — Lavidro" },
      { name: "description", content: "Datenschutzerklärung von Lavidro: Welche Daten wir bei Anfragen, Vorbestellungen und der Nutzungsanalyse verarbeiten und welche Rechte du hast." },
      { property: "og:title", content: "Datenschutz — Lavidro" },
      { property: "og:description", content: "Datenschutzerklärung von Lavidro: Welche Daten wir bei Anfragen, Vorbestellungen und der Nutzungsanalyse verarbeiten und welche Rechte du hast." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://lavidro.com/datenschutz" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://lavidro.com/datenschutz" }],
  }),
  component: DatenschutzPage,
});

function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight">Datenschutzerklärung</h1>
        <p className="mt-4 text-sm text-foreground/60">Stand: September 2026</p>

        {/* 1. Datenschutz auf einen Blick */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">1. Datenschutz auf einen Blick</h2>

          <h3 className="mt-6 font-display text-lg font-semibold">Allgemeine Hinweise</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
            personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
            Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text
            aufgeführten Datenschutzerklärung.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Datenerfassung auf dieser Website
          </h3>

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
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann
            es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben. Andere Daten
            werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere
            IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser,
            Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt
            automatisch, sobald Sie diese Website betreten.
          </p>

          <p className="mt-4 font-medium text-foreground/90">Wofür nutzen wir Ihre Daten?</p>
          <p className="mt-2 text-foreground/80 leading-relaxed">
            Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu
            gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
            Sofern über die Website Verträge geschlossen oder angebahnt werden können, werden die
            übermittelten Daten auch für Vertragsangebote, Bestellungen oder sonstige
            Auftragsanfragen verarbeitet.
          </p>

          <p className="mt-4 font-medium text-foreground/90">
            Welche Rechte haben Sie bezüglich Ihrer Daten?
          </p>
          <p className="mt-2 text-foreground/80 leading-relaxed">
            Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck
            Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht,
            die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur
            Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft
            widerrufen. Außerdem haben Sie das Recht, unter bestimmten Umständen die Einschränkung
            der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Des Weiteren steht Ihnen
            ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu. Hierzu sowie zu weiteren
            Fragen zum Thema Datenschutz können Sie sich jederzeit an uns wenden.
          </p>
        </section>

        {/* 2. Hosting */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">2. Hosting</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Wir hosten die Inhalte unserer Website bei folgenden Anbietern:
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Hosting über Lovable Cloud (AWS)
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Unsere Website wird über die Plattform <strong>Lovable</strong> bereitgestellt
            (Anbieter: Lovable Labs AB, Regeringsgatan 25, 111 53 Stockholm, Schweden). Die
            physische Speicherung der Website-Inhalte erfolgt auf der von Lovable genutzten
            Cloud-Infrastruktur von <strong>Amazon Web Services (AWS)</strong> an einem
            Serverstandort innerhalb der Europäischen Union.
          </p>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Beim Aufruf der Website werden technisch notwendige Verbindungsdaten (insbesondere Ihre
            IP-Adresse, Zeitpunkt der Anfrage, aufgerufene URL, Browsertyp und Betriebssystem)
            verarbeitet, um die Website stabil und sicher bereitzustellen.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Content Delivery Network (Cloudflare)
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Zur schnellen und sicheren Auslieferung der Website-Inhalte (insbesondere zur
            Performance-Optimierung und zum Schutz vor DDoS-Angriffen) nutzen wir das Content
            Delivery Network (CDN) von <strong>Cloudflare, Inc.</strong> (101 Townsend St, San
            Francisco, CA 94107, USA). Alle Anfragen an unsere Website werden über die Server von
            Cloudflare geleitet. Hierbei werden Verbindungsdaten (IP-Adresse) verarbeitet.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Rechtsgrundlage und Auftragsverarbeitung
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Die Datenverarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
            Interesse an einer technisch fehlerfreien, schnellen und sicheren Bereitstellung unserer
            Website). Wir nutzen diese Dienste auf Grundlage eines Vertrags über
            Auftragsverarbeitung (Art. 28 DSGVO) mit der Lovable Labs AB, welche wiederum
            entsprechende vertragliche Vereinbarungen (einschließlich EU-Standardvertragsklauseln
            für eventuelle US-Transfers der Subprozessoren wie Cloudflare oder AWS) abgeschlossen
            hat.
          </p>
        </section>

        {/* 3. Allgemeine Hinweise und Pflichtinformationen */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">
            3. Allgemeine Hinweise und Pflichtinformationen
          </h2>

          <h3 className="mt-6 font-display text-lg font-semibold">Datenschutz</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir
            behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen
            Datenschutzvorschriften sowie dieser Datenschutzerklärung. Wenn Sie diese Website
            benutzen, werden verschiedene personenbezogene Daten erhoben. Personenbezogene Daten
            sind Daten, mit denen Sie persönlich identifiziert werden können. Die vorliegende
            Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir sie nutzen. Sie
            erläutert auch, wie und zu welchem Zweck das geschieht. Wir weisen darauf hin, dass die
            Datenübertragung im Internet (z. B. bei der Kommunikation per E-Mail) Sicherheitslücken
            aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht
            möglich.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Hinweis zur verantwortlichen Stelle
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
          </p>
          <address className="mt-4 not-italic text-foreground/80 leading-relaxed">
            Factory33 Ecosystem GmbH
            <br />
            Ausblick 1
            <br />
            33100 Paderborn
            <br />
            <br />
            E-Mail:{" "}
            <a href="mailto:lavidro@gmx.net" className="underline underline-offset-4">
              lavidro@gmx.net
            </a>
          </address>

          <h3 className="mt-6 font-display text-lg font-semibold">Speicherdauer</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt
            wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die
            Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder
            eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern
            wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer
            personenbezogenen Daten haben (z. B. steuer- oder handelsrechtliche
            Aufbewahrungsfristen); im letztgenannten Fall erfolgt die Löschung nach Fortfall dieser
            Gründe.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Allgemeine Hinweise zu den Rechtsgrundlagen der Datenverarbeitung auf dieser Website
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Sofern Sie in die Datenverarbeitung eingewilligt haben, verarbeiten wir Ihre
            personenbezogenen Daten auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO bzw. Art. 9 Abs. 2
            lit. a DSGVO, sofern besondere Datenkategorien nach Art. 9 Abs. 1 DSGVO verarbeitet
            werden. Im Falle einer ausdrücklichen Einwilligung in die Übertragung personenbezogener
            Daten in Drittstaaten erfolgt die Datenverarbeitung außerdem auf Grundlage von Art. 49
            Abs. 1 lit. a DSGVO. Sofern Sie in die Speicherung von Cookies oder in den Zugriff auf
            Informationen in Ihr Endgerät (z. B. via Device-Fingerprinting) eingewilligt haben,
            erfolgt die Datenverarbeitung zusätzlich auf Grundlage von § 25 Abs. 1 TDDDG. Die
            Einwilligung ist jederzeit widerrufbar. Sind Ihre Daten zur Vertragserfüllung oder zur
            Durchführung vorvertraglicher Maßnahmen erforderlich, verarbeiten wir Ihre Daten auf
            Grundlage des Art. 6 Abs. 1 lit. b DSGVO. Des Weiteren verarbeiten wir Ihre Daten,
            sofern diese zur Erfüllung einer rechtlichen Verpflichtung erforderlich sind, auf
            Grundlage von Art. 6 Abs. 1 lit. c DSGVO. Die Datenverarbeitung kann ferner auf
            Grundlage unseres berechtigten Interesses nach Art. 6 Abs. 1 lit. f DSGVO erfolgen. Über
            die jeweils im Einzelfall einschlägigen Rechtsgrundlagen wird in den folgenden Absätzen
            dieser Datenschutzerklärung informiert.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Empfänger von personenbezogenen Daten
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Im Rahmen unserer Geschäftstätigkeit arbeiten wir mit verschiedenen externen Stellen
            zusammen. Dabei ist teilweise auch eine Übermittlung von personenbezogenen Daten an
            diese externen Stellen erforderlich. Wir geben personenbezogene Daten nur dann an
            externe Stellen weiter, wenn dies im Rahmen einer Vertragserfüllung erforderlich ist,
            wenn wir gesetzlich hierzu verpflichtet sind (z. B. Weitergabe von Daten an
            Steuerbehörden), wenn wir ein berechtigtes Interesse nach Art. 6 Abs. 1 lit. f DSGVO an
            der Weitergabe haben oder wenn eine sonstige Rechtsgrundlage die Datenweitergabe
            erlaubt. Beim Einsatz von Auftragsverarbeitern geben wir personenbezogene Daten unserer
            Kunden nur auf Grundlage eines gültigen Vertrags über Auftragsverarbeitung weiter. Im
            Falle einer gemeinsamen Verarbeitung wird ein Vertrag über gemeinsame Verarbeitung
            geschlossen.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Widerruf Ihrer Einwilligung zur Datenverarbeitung
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich.
            Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit
            der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Widerspruchsrecht gegen die Datenerhebung in besonderen Fällen sowie gegen Direktwerbung
            (Art. 21 DSGVO)
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Wenn die Datenverarbeitung auf Grundlage von Art. 6 Abs. 1 lit. e oder f DSGVO erfolgt,
            haben Sie jederzeit das Recht, aus Gründen, die sich aus Ihrer besonderen Situation
            ergeben, gegen die Verarbeitung Ihrer personenbezogenen Daten Widerspruch einzulegen;
            dies gilt auch für ein auf diese Bestimmungen gestütztes Profiling. Die jeweilige
            Rechtsgrundlage, auf der eine Verarbeitung beruht, entnehmen Sie dieser
            Datenschutzerklärung. Wenn Sie Widerspruch einlegen, werden wir Ihre betroffenen
            personenbezogenen Daten nicht mehr verarbeiten, es sei denn, wir können zwingende
            schutzwürdige Gründe für die Verarbeitung nachweisen, die Ihre Interessen, Rechte und
            Freiheiten überwiegen oder die Verarbeitung dient der Geltendmachung, Ausübung oder
            Verteidigung von Rechtsansprüchen (Widerspruch nach Art. 21 Abs. 1 DSGVO). Werden Ihre
            personenbezogenen Daten verarbeitet, um Direktwerbung zu betreiben, so haben Sie das
            Recht, jederzeit Widerspruch gegen die Verarbeitung Sie betreffender personenbezogener
            Daten zum Zwecke derartiger Werbung einzulegen; dies gilt auch für das Profiling, soweit
            es mit solcher Direktwerbung in Verbindung steht. Wenn Sie widersprechen, werden Ihre
            personenbezogenen Daten anschließend nicht mehr zum Zwecke der Direktwerbung verwendet
            (Widerspruch nach Art. 21 Abs. 2 DSGVO).
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
            Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen
            <br />
            Kavalleriestr. 2–4
            <br />
            40213 Düsseldorf
          </address>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Recht auf Datenübertragbarkeit
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung
            eines Vertrags automatisiert verarbeiten, an sich oder an einen Dritten in einem
            gängigen, maschinenlesbaren Format aushändigen zu lassen. Sofern Sie die direkte
            Übertragung der Daten an einen anderen Verantwortlichen verlangen, erfolgt dies nur,
            soweit es technisch machbar ist.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Auskunft, Berichtigung und Löschung
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf
            unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft
            und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung
            oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene
            Daten können Sie sich jederzeit an uns wenden.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Recht auf Einschränkung der Verarbeitung
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu
            verlangen. Hierzu können Sie sich jederzeit an uns wenden. Das Recht auf Einschränkung
            der Verarbeitung besteht in folgenden Fällen: Wenn Sie die Richtigkeit Ihrer bei uns
            gespeicherten personenbezogenen Daten bestreiten, benötigen wir in der Regel Zeit, um
            dies zu überprüfen. Für die Dauer der Prüfung haben Sie das Recht, die Einschränkung der
            Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Wenn die Verarbeitung Ihrer
            personenbezogenen Daten unrechtmäßig geschah/geschieht, können Sie statt der Löschung
            die Einschränkung der Datenverarbeitung verlangen. Wenn wir Ihre personenbezogenen Daten
            nicht mehr benötigen, Sie sie jedoch zur Ausübung, Verteidigung oder Geltendmachung von
            Rechtsansprüchen benötigen, haben Sie das Recht, statt der Löschung die Einschränkung
            der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Wenn Sie einen Widerspruch
            nach Art. 21 Abs. 1 DSGVO eingelegt haben, muss eine Abwägung zwischen Ihren und unseren
            Interessen vorgenommen werden. Solange noch nicht feststeht, wessen Interessen
            überwiegen, haben Sie das Recht, die Einschränkung der Verarbeitung Ihrer
            personenbezogenen Daten zu verlangen. Wenn Sie die Verarbeitung Ihrer personenbezogenen
            Daten eingeschränkt haben, dürfen diese Daten – von ihrer Speicherung abgesehen – nur
            mit Ihrer Einwilligung oder zur Geltendmachung, Ausübung oder Verteidigung von
            Rechtsansprüchen oder zum Schutz der Rechte einer anderen natürlichen oder juristischen
            Person oder aus Gründen eines wichtigen öffentlichen Interesses der Europäischen Union
            oder eines Mitgliedstaats verarbeitet werden.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">SSL- bzw. TLS-Verschlüsselung</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher
            Inhalte, wie zum Beispiel Bestellungen oder Anfragen, die Sie an uns als Seitenbetreiber
            senden, eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie
            daran, dass die Adresszeile des Browsers von „http://" auf „https://" wechselt und an
            dem Schloss-Symbol in Ihrer Browserzeile. Wenn die SSL- bzw. TLS-Verschlüsselung
            aktiviert ist, können die Daten, die Sie an uns übermitteln, nicht von Dritten
            mitgelesen werden.
          </p>
        </section>

        {/* 4. Datenerfassung auf dieser Website */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">4. Datenerfassung auf dieser Website</h2>

          <h3 className="mt-6 font-display text-lg font-semibold">Kontaktformular</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem
            Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung
            der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben
            wir nicht ohne Ihre Einwilligung weiter. Die Verarbeitung dieser Daten erfolgt auf
            Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines
            Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich
            ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse
            an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f
            DSGVO) oder auf Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sofern diese abgefragt
            wurde; die Einwilligung ist jederzeit widerrufbar. Die von Ihnen im Kontaktformular
            eingegebenen Daten verbleiben bei uns, bis Sie uns zur Löschung auffordern, Ihre
            Einwilligung zur Speicherung widerrufen oder der Zweck für die Datenspeicherung entfällt
            (z. B. nach abgeschlossener Bearbeitung Ihrer Anfrage). Zwingende gesetzliche
            Bestimmungen – insbesondere Aufbewahrungsfristen – bleiben unberührt.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Anmeldung zu „Lavidro live erleben“
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Wenn Sie sich für „Lavidro live erleben“ anmelden, verarbeiten wir folgende Daten:
          </p>
          <ul className="mt-3 list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
            <li>Name (optional)</li>
            <li>E-Mail-Adresse</li>
            <li>Gewünschte Kontaktart</li>
            <li>Telefonnummer und gewünschtes Zeitfenster (jeweils optional)</li>
            <li>Optionale Angabe zur persönlichen Herausforderung im Wäschealltag</li>
            <li>Einwilligungsstatus</li>
            <li>Zeitpunkt der Eintragung</li>
          </ul>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Zweck der Verarbeitung ist die Information über den Produktstart von Lavidro sowie die
            Anbahnung einer Geschäftsbeziehung. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1
            lit. a DSGVO). Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft per
            E-Mail an{" "}
            <a href="mailto:lavidro@gmx.net" className="underline underline-offset-4">
              lavidro@gmx.net
            </a>{" "}
            widerrufen. Wir speichern die Daten bis zum Widerruf bzw. bis sie für den genannten
            Zweck nicht mehr erforderlich sind.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">Unverbindliche Vorbestellungen</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Wenn Sie ein Lavidro System unverbindlich vorbestellen, verarbeiten wir Ihren Namen, Ihre
            E-Mail-Adresse, die ausgewählte Lösung und Ausstattungsvariante, die gewählte Zahlungsart,
            die zum Zeitpunkt der Anfrage angezeigte Preisindikation, den Einwilligungsstatus sowie
            den Zeitpunkt und die Quelle der Anfrage. Die Vorbestellung ist unverbindlich und führt
            weder zu einem Kaufvertrag noch zu einer Zahlungspflicht. Die angezeigten Preise sind
            vorläufig und können sich bis zu einem späteren verbindlichen Angebot ändern.
          </p>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Die Verarbeitung erfolgt zur Bearbeitung Ihrer Anfrage und zur Anbahnung eines möglichen
            Vertragsverhältnisses auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO sowie, soweit eine
            Einwilligung abgefragt wird, auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO. Die Daten
            verbleiben bei uns, bis die Anfrage abgeschlossen ist, Sie Ihre Einwilligung widerrufen
            oder Sie uns zur Löschung auffordern, sofern keine gesetzlichen Aufbewahrungspflichten
            entgegenstehen.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">Bestätigungs-E-Mails</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Nach einer Anmeldung oder unverbindlichen Vorbestellung senden wir eine Bestätigungs-E-Mail
            mit einer Zusammenfassung der übermittelten Angaben. Hierfür verarbeiten wir insbesondere
            Ihre E-Mail-Adresse, Ihren Namen und die jeweiligen Anfrage- oder Produktdaten. Der Versand
            dient der Bearbeitung Ihrer Anfrage beziehungsweise der Durchführung vorvertraglicher
            Maßnahmen gemäß Art. 6 Abs. 1 lit. b DSGVO. Versandstatus und technische Protokolldaten
            werden zur Gewährleistung eines sicheren und zuverlässigen Versands auf Grundlage unseres
            berechtigten Interesses gemäß Art. 6 Abs. 1 lit. f DSGVO gespeichert.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">Anfrage per E-Mail</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Wenn Sie uns per E-Mail kontaktieren, wird Ihre Anfrage inklusive aller daraus
            hervorgehenden personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres
            Anliegens bei uns gespeichert und verarbeitet. Diese Daten geben wir nicht ohne Ihre
            Einwilligung weiter. Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs.
            1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder
            zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen
            beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung
            der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung
            (Art. 6 Abs. 1 lit. a DSGVO) sofern diese abgefragt wurde; die Einwilligung ist
            jederzeit widerrufbar. Die von Ihnen an uns per Kontaktanfragen übersandten Daten
            verbleiben bei uns, bis Sie uns zur Löschung auffordern, Ihre Einwilligung zur
            Speicherung widerrufen oder der Zweck für die Datenspeicherung entfällt (z. B. nach
            abgeschlossener Bearbeitung Ihres Anliegens). Zwingende gesetzliche Bestimmungen –
            insbesondere gesetzliche Aufbewahrungsfristen – bleiben unberührt.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Datenbank und Backend (Lovable Cloud)
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Für die Speicherung und Verarbeitung der über die Website erfassten Daten (z. B.
            Anmeldungen zu „Lavidro live erleben“ und unverbindliche Vorbestellungen) nutzen wir
            „Lovable Cloud“. Anbieter ist die
            Lovable Labs AB, Regeringsgatan 25, 111 53 Stockholm, Schweden. Lovable Cloud stellt uns
            eine verwaltete Datenbank-Infrastruktur bereit. Im Hintergrund nutzt Lovable für diese
            Dienste den Infrastruktur-Anbieter Supabase, Inc. (Palo Alto, USA) als
            Unterauftragsverarbeiter. Die Daten werden auf Servern innerhalb der Europäischen Union
            gespeichert. Für den Fall, dass Daten in die USA übertragen oder von dort aus eingesehen
            werden können, haben Lovable bzw. Supabase sich zur Einhaltung der
            EU-Standardvertragsklauseln verpflichtet, um ein angemessenes Datenschutzniveau zu
            garantieren. Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren,
            skalierbaren und performanten Datenbank-Infrastruktur (Art. 6 Abs. 1 lit. f DSGVO).
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Schriftarten (lokal eingebunden)
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Zur einheitlichen Darstellung von Schriftarten verwenden wir auf dieser Website lokal
            gehostete Schriftarten (u. a. „Inter" und „Montserrat"). Die Schriftdateien werden
            direkt vom Server unseres Hosting-Anbieters ausgeliefert. Es erfolgt keine Verbindung zu
            Servern Dritter (insbesondere keine Verbindung zu Google Fonts) und es werden keine
            personenbezogenen Daten an Dritte übertragen.
          </p>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer
            einheitlichen und ansprechenden Darstellung unseres Online-Angebots unter Wahrung des
            Datenschutzes).
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">Cookies / Local Storage</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Details zu den auf dieser Website eingesetzten Cookies und First-Party-Einträgen
            im Local Storage finden Sie im nachfolgenden Abschnitt „Cookies und
            Nutzungsanalyse“.
          </p>

        </section>

        {/* Cookies und Nutzungsanalyse */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">Cookies und Nutzungsanalyse</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Wir verwenden ausschließlich First-Party-Cookies, die auf dieser Domain gesetzt werden.
            Es findet keine Weitergabe an externe Analyse- oder Werbedienste (z. B. Google
            Analytics, Meta Pixel) statt. Optionale Cookies werden erst nach Ihrer ausdrücklichen
            Einwilligung im Cookie-Hinweis gesetzt (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG).
            Sie können Ihre Einwilligung jederzeit im Footer unter „Cookie-Einstellungen“
            widerrufen. Beim Widerruf werden die optionalen Cookies unmittelbar gelöscht.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-foreground/20 text-left">
                  <th className="py-2 pr-4 font-semibold">Cookie</th>
                  <th className="py-2 pr-4 font-semibold">Zweck</th>
                  <th className="py-2 pr-4 font-semibold">Laufzeit</th>
                  <th className="py-2 font-semibold">Kategorie</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-b border-foreground/10">
                  <td className="py-3 pr-4 font-mono text-xs">lavidro_consent</td>
                  <td className="py-3 pr-4">
                    Speichert Ihre Cookie-Auswahl (Version, Analytics ja/nein, Zeitstempel).
                  </td>
                  <td className="py-3 pr-4">6 Monate</td>
                  <td className="py-3">Notwendig</td>
                </tr>
                <tr className="border-b border-foreground/10">
                  <td className="py-3 pr-4 font-mono text-xs">lavidro_visitor</td>
                  <td className="py-3 pr-4">
                    Zufällige, nicht personenbezogene Kennung zur Wiedererkennung wiederkehrender
                    Besuche in der Nutzungsanalyse.
                  </td>
                  <td className="py-3 pr-4">6 Monate</td>
                  <td className="py-3">Analyse</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-xs">lavidro_session</td>
                  <td className="py-3 pr-4">
                    Zufällige Sitzungs-ID zur Gruppierung von Ereignissen innerhalb eines Besuchs
                    (Ablauf nach 30 Minuten Inaktivität).
                  </td>
                  <td className="py-3 pr-4">bis zu 6 Monate</td>
                  <td className="py-3">Analyse</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-foreground/80 leading-relaxed">
            Über die Analyse-Cookies erheben wir ausschließlich pseudonyme Ereignisse zu
            Seitenaufrufen sowie Produkt- und Konfigurator-Interaktionen (z. B. geöffnete
            Produktseite, gewählte Ausstattungsvariante). Es werden keine Namen, E-Mail-Adressen,
            Formulareingaben, Telefonnummern, vollständigen IP-Adressen oder Fingerprints
            gespeichert. Die Daten werden auf unseren Servern in der EU verarbeitet.
          </p>
        </section>

        {/* 5. Aktualität */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">5. Aktualität dieser Erklärung</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den
            aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in
            der Datenschutzerklärung umzusetzen.
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
