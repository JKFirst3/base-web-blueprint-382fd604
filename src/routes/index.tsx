import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Features } from "@/components/site/Features";
import { LeadForm } from "@/components/site/LeadForm";
import { Footer } from "@/components/site/Footer";

const TITLE = "Lavidro — Textile Care Intelligence";
const DESCRIPTION =
  "Das erste System, das den vollständigen Wäscheprozess nach deinen Gewohnheiten autonom und qualitätssicher übernimmt. Jetzt auf die Warteliste setzen.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "https://lavidro.com/" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://lavidro.com/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <LeadForm />
      </main>
      <Footer />
    </div>
  );
}
