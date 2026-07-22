import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { QuoteTicker } from "@/components/site/QuoteTicker";
import { ProductWorld } from "@/components/site/ProductWorld";
import { FeatureImages } from "@/components/site/FeatureImages";
import { HabitsProgress } from "@/components/site/HabitsProgress";
import { ProcessPath } from "@/components/site/ProcessPath";
import { AutonomySection } from "@/components/site/AutonomySection";
import { QualityArguments } from "@/components/site/QualityArguments";
import { FAQ } from "@/components/site/FAQ";
import { SocialProof } from "@/components/site/SocialProof";
import { LeadForm } from "@/components/site/LeadForm";
import { Footer } from "@/components/site/Footer";

const TITLE = "LAVIDRO — Wäsche. Einfach. Fertig.";
const DESCRIPTION =
  "Das erste System, das den vollständigen Wäscheprozess autonom und qualitätssicher übernimmt. Erlebe LAVIDRO live.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://lavidro.com/" },
      { name: "twitter:card", content: "summary_large_image" },
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
        <QuoteTicker />
        <ProductWorld />
        <FeatureImages />
        <HabitsProgress />
        <ProcessPath />
        <AutonomySection />
        <QualityArguments />
        <SocialProof />
        <FAQ />
        <LeadForm />
      </main>
      <Footer />
    </div>
  );
}
