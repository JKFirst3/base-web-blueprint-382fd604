import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({
    meta: [
      { title: "Datenschutz — Lavidro" },
      { name: "description", content: "Datenschutzerklärung von Lavidro: Welche Daten wir bei Newsletter, unverbindlichen Anfragen und der Nutzungsanalyse mit PostHog verarbeiten und welche Rechte du hast." },
      { property: "og:title", content: "Datenschutz — Lavidro" },
      { property: "og:description", content: "Datenschutzerklärung von Lavidro: Welche Daten wir bei Newsletter, unverbindlichen Anfragen und der Nutzungsanalyse mit PostHog verarbeiten und welche Rechte du hast." },
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
        <h1 className="font-display text-4xl font-bold tracking-tight break-words sm:text-5xl">
          Datenschutzerklärung
        </h1>
        <p className="mt-4 text-sm text-foreground/60">Stand: 2. Oktober 2026</p>

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
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Factory33 Ecosystem GmbH freut sich über Ihr Interesse an LAVIDRO. Der Schutz
            personenbezogener Daten ist uns ein wichtiges Anliegen. Sämtliche Verarbeitungen im
            Rahmen dieser Website richten sich nach den anwendbaren Vorschriften zum Datenschutz und
            zur Datensicherheit. Diese Erklärung beschreibt sowohl die allgemeinen Grundsätze als
            auch die für LAVIDRO konkret eingesetzten Dienste und Datenflüsse.
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

          <h3 className="mt-6 font-display text-lg font-semibold">Hosting über Lovable</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Unsere Website wird über die Plattform <strong>Lovable</strong> bereitgestellt
            (Anbieter: Lovable Labs AB, Regeringsgatan 25, 111 53 Stockholm, Schweden). Lovable
            setzt hierfür nach unserem Kenntnisstand Infrastruktur- und Netzwerkdienstleister ein.
            Welche Subunternehmer im Einzelnen eingesetzt werden und an welchen Standorten Daten
            verarbeitet werden, richtet sich nach den Vertrags- und Datenschutzunterlagen von
            Lovable.
          </p>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Beim Aufruf der Website werden technisch notwendige Verbindungsdaten (insbesondere Ihre
            IP-Adresse, Zeitpunkt der Anfrage, aufgerufene URL, Browsertyp und Betriebssystem)
            verarbeitet, um die Website stabil und sicher bereitzustellen.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Rechtsgrundlage und Auftragsverarbeitung
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Die Datenverarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
            Interesse an einer technisch fehlerfreien, schnellen und sicheren Bereitstellung unserer
            Website). Soweit Dienstleister personenbezogene Daten in unserem Auftrag verarbeiten,
            muss dies auf Grundlage der hierfür erforderlichen datenschutzrechtlichen Vereinbarungen
            erfolgen. Die konkret eingesetzten Unterauftragnehmer, Verarbeitungsstandorte und
            Garantien für mögliche Drittlandübermittlungen sind anhand der jeweils aktuellen
            Vertrags- und Datenschutzunterlagen sowie der jeweils geltenden Rechtslage zu prüfen.
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
            Vertreten durch die Geschäftsführer Dr. Slawa Tomin und Jannik Woste
            <br />
            Sitz der Gesellschaft: Paderborn
            <br />
            Registergericht: Amtsgericht Paderborn, HRB 17652
            <br />
            <br />
            E-Mail:{" "}
            <a href="mailto:hello@factory33.de" className="underline underline-offset-4">
              hello@factory33.de
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
            Im Rahmen unserer Geschäftstätigkeit arbeiten wir mit externen Stellen zusammen. Dabei
            kann eine Übermittlung personenbezogener Daten erforderlich sein. Eine Übermittlung
            erfolgt nur, soweit sie zur Durchführung eines Vertrags oder vorvertraglicher Maßnahmen
            erforderlich ist, eine gesetzliche Pflicht besteht, ein berechtigtes Interesse die
            Verarbeitung trägt, eine Einwilligung vorliegt oder eine andere Rechtsgrundlage dies
            erlaubt. Für LAVIDRO sind dies nach dem aktuellen technischen Stand insbesondere Lovable
            Labs AB für Websitebetrieb, verwaltete Datenbank und E-Mail-Versand, die innerhalb der
            Lovable-Cloud eingesetzte Datenbanktechnik von Supabase sowie – ausschließlich nach
            Analyse-Einwilligung – PostHog.
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

          <h3 className="mt-6 font-display text-lg font-semibold">Links zu anderen Websites</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Diese Datenschutzerklärung gilt für die LAVIDRO-Website. Soweit diese Website Links zu
            Angeboten anderer Verantwortlicher enthält, gelten dort deren eigene
            Datenschutzerklärungen. Bitte informieren Sie sich beim Verlassen unserer Website über
            die Verarbeitung personenbezogener Daten durch den jeweiligen Anbieter.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">Sicherheit</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Wir treffen angemessene technische und organisatorische Vorkehrungen, um
            personenbezogene Daten vor Verlust, Zerstörung, Verfälschung, Manipulation und
            unberechtigtem Zugriff zu schützen. Ein absoluter Schutz bei der Datenübertragung im
            Internet kann jedoch nicht gewährleistet werden.
          </p>
        </section>

        {/* 4. Datenerfassung auf dieser Website */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">4. LAVIDRO-spezifische Verarbeitungen</h2>

          <h3 className="mt-6 font-display text-lg font-semibold">Kontaktformular</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem
            Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung
            der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Empfänger sind
            Factory33 Ecosystem GmbH sowie die für Betrieb und Speicherung technisch erforderlichen
            Dienstleister (siehe „Hosting“, „Datenbank und Backend“ und „E-Mail-Versand“). Eine
            darüber hinausgehende Weitergabe erfolgt nur bei gesetzlicher Erlaubnis oder wirksamer
            Einwilligung. Die Verarbeitung dieser Daten erfolgt auf
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

          <h3 className="mt-6 font-display text-lg font-semibold">Newsletter</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Wenn Sie sich auf der Startseite für den Newsletter anmelden, verarbeiten wir Ihre
            E-Mail-Adresse, Ihre Einwilligung sowie den Zeitpunkt der Anmeldung. Zweck ist, Sie
            über Entwicklungsfortschritte, Pilotphasen und Neuigkeiten von Lavidro zu informieren.
            Nach der Anmeldung senden wir eine Bestätigungs-E-Mail. Dabei werden die E-Mail-Adresse,
            der Anmeldekontext sowie Versandstatus und technische Zustellereignisse verarbeitet.
            Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO); technische
            Versandprotokolle verarbeiten wir zur zuverlässigen Zustellung und zur Beachtung von
            Abmeldungen, Beschwerden oder unzustellbaren Adressen auf Grundlage von Art. 6 Abs. 1
            lit. f DSGVO. Sie können Ihre Einwilligung jederzeit mit
            Wirkung für die Zukunft per E-Mail an{" "}
            <a href="mailto:hello@factory33.de" className="underline underline-offset-4">
              hello@factory33.de
            </a>{" "}
            oder über den Abmeldelink in unseren E-Mails widerrufen. Wir speichern die Daten bis
            zum Widerruf; den Nachweis der Einwilligung können wir darüber hinaus aufbewahren,
            soweit dies zur Abwehr von Ansprüchen erforderlich ist.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Unverbindliche Anfrage zum Kaufinteresse
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Wenn Sie auf der Produktseite über „Anfragen“ unverbindlich Ihr Kaufinteresse
            mitteilen, verarbeiten wir Ihren Namen, Ihre E-Mail-Adresse, das ausgewählte Produkt,
            die gewählte Variante zwischen Kauf und Abo, die zum Zeitpunkt der Anfrage angezeigte
            Preisindikation, optional Ihre Angaben zur Haushaltsgröße, zum Jobtitel und zum größten
            Mehrwert (bei „Sonstige“ gegebenenfalls mit Freitext), die Bestätigung, dass Sie die
            Datenschutzhinweise zur Kenntnis genommen haben, gegebenenfalls Ihre freiwillige
            Einwilligung in zusätzliche Produktinformationen samt Zeitpunkt sowie den Zeitpunkt und die Quelle der Anfrage (z. B. Produktseite oder eine bestimmte
            Kampagne).
          </p>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Die Anfrage ist unverbindlich. Durch sie kommt kein Kaufvertrag zustande, und es wird
            keine Zahlung ausgelöst oder vereinbart. Die angezeigten Preise sind vorläufig und
            können sich bis zu einem späteren verbindlichen Angebot ändern. Die eingegebenen
            Namen, E-Mail-Adressen, Jobtitel und freie Antworten werden nicht an den Analysedienst
            übermittelt. Nur nach Ihrer gesonderten Analyse-Einwilligung können beim erfolgreichen
            Absenden die ausgewählte Haushaltsgrößen-Kategorie, die ausgewählte vordefinierte
            Mehrwert-Kategorie (bei „Sonstige“ nur diese Kategorie) und die Angabe, ob das Jobtitel-Feld ausgefüllt wurde, ohne den
            eingegebenen Text ausgewertet werden.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Bestätigung der Produktanfrage (Double-Opt-In)
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Die unverbindliche Anfrage wird bereits mit dem erfolgreichen Absenden gespeichert. Im
            Anschluss senden wir einmalig eine E-Mail an die angegebene Adresse, damit Sie deren
            Inhaberschaft durch einen bewussten Klick bestätigen können. Der Link ist 72 Stunden
            gültig. Das bloße Öffnen des Links bestätigt die Anfrage nicht; die Bestätigung erfolgt
            erst über die Schaltfläche auf der Bestätigungsseite. Serverseitig wird nur eine
            kryptografische Prüfsumme des einmaligen Codes gespeichert. Zusätzlich speichern wir den
            Versand- und Bestätigungsstatus sowie die zugehörigen Zeitpunkte. Abgelaufene, ungültige
            oder bereits verwendete Codes können keine erneute Bestätigung auslösen.
          </p>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Die E-Mail dient der Absicherung und Bearbeitung Ihrer konkreten Anfrage. Für den Versand
            werden Empfängeradresse, Vorlagenname, Versandstatus und bei Fehlern eine technische
            Fehlermeldung im Versandprotokoll gespeichert. Rückmeldungen zu Unzustellbarkeit,
            Spam-Beschwerden oder Abmeldungen werden als Sperrstatus zur Vermeidung weiterer
            unerwünschter Sendungen gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO; die technischen Versand- und Sicherheitsprotokolle
            verarbeiten wir auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Eine Anfrage bleibt auch
            vor der E-Mail-Bestätigung gespeichert. Eine freiwillige Marketing-Einwilligung wird
            jedoch erst nach erfolgreicher Bestätigung aktiviert.
          </p>

          <p className="mt-4 text-foreground/80 leading-relaxed">
            Die Verarbeitung erfolgt zur Bearbeitung Ihrer Anfrage und zur Anbahnung eines möglichen
            Vertragsverhältnisses auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO sowie, soweit eine
            Einwilligung abgefragt wird, auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO. Die Daten
            verbleiben bei uns, bis die Anfrage abgeschlossen ist, Sie Ihre Einwilligung widerrufen
            oder Sie uns zur Löschung auffordern, sofern keine gesetzlichen Aufbewahrungspflichten
            entgegenstehen.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Mögliche Weitergabe an eine spätere Ausgründung
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Im Zuge des Projekts LAVIDRO kann eine eigenständige Gesellschaft entstehen. Sollte diese
            Gesellschaft oder eine spätere Rechtsnachfolgerin die Bearbeitung Ihrer Anfrage übernehmen,
            kommt eine Übermittlung der hierfür erforderlichen Anfrage- und Kontaktdaten für die hier
            beschriebenen Zwecke in Betracht. Eine solche Übermittlung erfolgt nur, wenn dafür eine
            datenschutzrechtliche Rechtsgrundlage besteht. Vor einer entsprechenden Weitergabe
            informieren wir Sie über den konkreten Empfänger, die Zwecke und die Rechtsgrundlage.
          </p>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Soweit die Weitergabe eine Einwilligung erfordert, holen wir diese gesondert und freiwillig
            ein. Die bloße Kenntnisnahme dieser Datenschutzerklärung im Anfrageformular stellt keine
            Einwilligung in die Weitergabe an eine Ausgründung oder Rechtsnachfolgerin dar.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Freiwillige Produktinformationen per E-Mail
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Wenn Sie im Anfrageformular gesondert einwilligen, dürfen wir Ihre E-Mail-Adresse nutzen,
            um Sie zusätzlich über die Produktentwicklung, Verfügbarkeit und Angebote von Lavidro zu
            informieren. Diese Einwilligung ist freiwillig, nicht vorausgewählt und keine Voraussetzung
            für die Bearbeitung Ihrer Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO. Sie
            können die Einwilligung jederzeit mit Wirkung für die Zukunft per E-Mail an{" "}
            <a href="mailto:hello@factory33.de" className="underline underline-offset-4">
              hello@factory33.de
            </a>{" "}
            widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt
            unberührt. Wir speichern den Einwilligungsstatus und den Zeitpunkt der Einwilligung zum
            Nachweis; nach einem Widerruf verwenden wir Ihre Kontaktdaten nicht mehr für diesen Zweck.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">Weitere Bestätigungs-E-Mails</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Auch nach einer Newsletter-Anmeldung kann eine Bestätigungs-E-Mail versendet werden.
            Hierfür verarbeiten wir die E-Mail-Adresse und den jeweiligen Anmeldekontext. Der Versand
            dient dem Nachweis Ihrer Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO. Versandstatus und
            technische Protokolldaten werden zur Gewährleistung eines sicheren und zuverlässigen
            Versands auf Grundlage unseres berechtigten Interesses gemäß Art. 6 Abs. 1 lit. f DSGVO
            verarbeitet.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">Anfrage per E-Mail</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Wenn Sie uns per E-Mail kontaktieren, wird Ihre Anfrage inklusive aller daraus
            hervorgehenden personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres
            Anliegens bei uns gespeichert und verarbeitet. Factory33 Ecosystem GmbH und technisch
            notwendige E-Mail-Dienstleister können diese Daten für Kommunikation und Zustellung
            verarbeiten. Eine Nutzung für andere Zwecke erfolgt nur bei gesetzlicher Erlaubnis oder
            Einwilligung. Die Verarbeitung dieser Daten
            erfolgt auf Grundlage von Art. 6 Abs.
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
            Newsletter-Anmeldungen, unverbindliche Anfragen zum Kaufinteresse und Kontaktanfragen)
            nutzen wir „Lovable Cloud“ der Lovable Labs AB, Regeringsgatan 25, 111 53 Stockholm,
            Schweden. Die Anwendung greift dabei auf eine verwaltete Supabase-Datenbank zu. Gespeichert
            werden die im jeweiligen Formular beschriebenen Angaben und Statusdaten; öffentlich
            können diese Datensätze nicht ausgelesen werden. Welche Gesellschaften als
            Unterauftragnehmer auftreten, an welchen Standorten die Daten gespeichert werden und
            welche Garantien bei möglichen Drittlandübermittlungen gelten, ist anhand der aktuellen
            Vertragsunterlagen von Lovable zu bestätigen. Rechtsgrundlage ist
            unser berechtigtes Interesse an einer sicheren und zuverlässigen Datenbank-Infrastruktur
            (Art. 6 Abs. 1 lit. f DSGVO) bzw. die Durchführung vorvertraglicher Maßnahmen (Art. 6
            Abs. 1 lit. b DSGVO).
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">E-Mail-Versand über Lovable</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Bestätigungen zu Newsletter-Anmeldungen und Produktanfragen werden über den verwalteten
            E-Mail-Dienst von Lovable Labs AB versendet. Hierfür werden insbesondere die
            Empfängeradresse, der Inhalt der jeweiligen Nachricht, ein technischer
            Wiederholungsschutz sowie Zustell- und Fehlerstatus verarbeitet. Die Anwendung führt ein
            Versandprotokoll mit Empfängeradresse, Vorlagenbezeichnung und Status; unzustellbare oder
            abgemeldete Adressen können in einer Sperrliste gespeichert werden. Die konkrete
            Versand-Infrastruktur, Unterauftragnehmer, Speicherfristen und Garantien für mögliche
            Drittlandübermittlungen sind anhand der aktuellen Vertragsunterlagen von Lovable zu
            bestätigen.
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Schriftarten (lokal eingebunden)
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Zur einheitlichen Darstellung verwenden wir die Schriftarten „Inter“ und „Montserrat“.
            Die Schriftdateien sind Bestandteil unserer Website und werden gemeinsam mit den
            übrigen Website-Inhalten über unseren Hosting-Anbieter ausgeliefert. Eine Verbindung zu
            Google Fonts oder anderen externen Schriftarten-Diensten wird dafür nicht aufgebaut.
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer
            einheitlichen Darstellung unseres Online-Angebots).
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">Cookies / Local Storage</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Details zu den auf dieser Website eingesetzten Cookies und Einträgen im Local Storage
            finden Sie im nachfolgenden Abschnitt „Cookies und Nutzungsanalyse mit PostHog“.
          </p>

        </section>

        {/* Cookies und Nutzungsanalyse */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">Cookies und Nutzungsanalyse mit PostHog</h2>

          <h3 className="mt-6 font-display text-lg font-semibold">Notwendiges Cookie</h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Wir speichern Ihre Auswahl im Cookie-Hinweis im Cookie <code className="font-mono text-xs">lavidro_consent</code>{" "}
            (Version, Analyse ja/nein, Zeitstempel; Laufzeit 6 Monate). Dieses Cookie ist technisch
            erforderlich, um Ihre Entscheidung zu beachten (§ 25 Abs. 2 Nr. 2 TDDDG, Art. 6 Abs. 1
            lit. c und f DSGVO).
          </p>

          <h3 className="mt-6 font-display text-lg font-semibold">
            Nutzungsanalyse mit PostHog (nur nach Einwilligung)
          </h3>
          <p className="mt-3 text-foreground/80 leading-relaxed">
            Nur wenn Sie im Cookie-Hinweis der Analyse aktiv zustimmen, nutzen wir den externen
            Analysedienst <strong>PostHog</strong>. Ohne Ihre Einwilligung wird PostHog nicht geladen und
            es werden keine Analyse-Ereignisse gesendet. Die Ereignisse werden an den EU-Endpunkt
            von PostHog übermittelt. Der EU-Endpunkt allein belegt keine ausschließlich europäische
            Verarbeitung; die verantwortliche PostHog-Gesellschaft, Unterauftragnehmer,
            Speicherorte, Speicherfristen und Garantien für mögliche Drittlandübermittlungen sind
            anhand der aktuellen Vertragsunterlagen zu bestätigen.
          </p>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Erfasst werden ausschließlich folgende pseudonyme Ereignisse. Die ersten fünf bilden
            den unveränderten Anfrage-Funnel; die beiden letzten Angaben werden davon getrennt
            ausgewertet:
          </p>
          <ul className="mt-3 list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
            <li>Aufruf der Startseite</li>
            <li>Sichtbarwerden bzw. Aufruf des Produktbereichs</li>
            <li>Wahl zwischen Kaufpreis und Abo</li>
            <li>Öffnen des Anfrageformulars</li>
            <li>
              Erfolgreiches Absenden des Anfrageformulars; dabei nur Haushaltsgrößen-Kategorie,
              vordefinierte Mehrwert-Kategorie und die
              Angabe, ob ein Jobtitel eingetragen wurde
            </li>
            <li>Sichtbare Verweildauer je Seite (<code className="font-mono text-xs">page_engagement</code>)</li>
            <li>
              Erfolgreiche E-Mail-Bestätigung der Produktanfrage als separate Diagnosekennzahl,
              nicht als Funnel-Schritt
            </li>
          </ul>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Zu den Ereignissen gehören das betroffene Produkt, die gewählte Zahlungsart, der
            Seitenpfad ohne URL-Parameter, eine zufällige pseudonyme Kennung für Browser und
            Sitzung sowie technische Angaben der PostHog-Bibliothek. Bei Besuchen über einen
            gekennzeichneten Anzeigenlink wird zusätzlich eine fest vorgegebene Kampagnenkennung
            übermittelt, damit die Nutzung dieser Kampagne getrennt ausgewertet werden kann.
            Diese Kennung wird über interne Links weitergegeben, ohne zusätzliche Kampagnen-Cookies
            oder Speichereinträge anzulegen. Beim Absenden der Anfrage können
            außerdem die oben genannten drei kategorisierten Angaben verarbeitet werden. Namen,
            E-Mail-Adressen, Jobtitel und freie Antworten werden nicht an PostHog übermittelt. Wir
            nutzen keine Identifizierung einzelner Personen (Identify), keine Personenprofile, keine
            automatische Erfassung von Klicks (Autocapture) und keine Sitzungsaufzeichnung (Session
            Replay).
          </p>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Der Browser sendet Analyseereignisse ausschließlich an eine Adresse derselben Website.
            Diese serverseitige Einwilligungsschranke prüft bei jeder Anfrage erneut die aktuelle
            Einwilligung und deren Zeitstempel, entfernt nicht erlaubte Angaben und leitet nur gültige
            Ereignisse an den fest vorgegebenen EU-Endpunkt von PostHog weiter. Dabei werden weder die
            Besucher-IP noch Browser-Header oder Cookies an PostHog weitergereicht; PostHog sieht die
            technische Verbindung des Servers. Die Standortauswertung ist zusätzlich deaktiviert.
          </p>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Die PostHog-Bibliothek speichert dafür nach Ihrer Einwilligung eine pseudonyme
            Kennung und Sitzungsinformationen in Cookies und im Local Storage Ihres Browsers
            (Einträge mit dem Präfix <code className="font-mono text-xs">ph_</code> bzw.{" "}
            <code className="font-mono text-xs">__ph</code>). Zweck ist die Auswertung, wie
            Besucherinnen und Besucher Produktbereich und Anfrageformular nutzen.
          </p>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG).
            Sie können Ihre Einwilligung jederzeit im Footer unter „Cookie-Einstellungen“ mit
            Wirkung für die Zukunft widerrufen. Beim Widerruf wird die Erfassung beendet und die
            PostHog-Einträge in Ihrem Browser werden ohne Neuladen der Seite gelöscht. Bereits vor
            dem Widerruf abgeschlossene Übermittlungen können nicht zurückgerufen werden; spätere
            oder wiederholte Sendeversuche werden an der serverseitigen Schranke verworfen. Frühere Cookies der eigenen
            Nutzungsanalyse (<code className="font-mono text-xs">lavidro_visitor</code>,{" "}
            <code className="font-mono text-xs">lavidro_session</code>) werden nicht mehr gesetzt
            und bei einem Besuch automatisch entfernt.
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
