import { createFileRoute } from "@tanstack/react-router";
import aboutHtml from "@/content/about.html?raw";
import { CodexMarkup, useCodexRuntime } from "@/components/site/CodexPage";

const TITLE = "Über Lavidro — Gründer, Mission und Partner";
const DESCRIPTION =
  "Lernen Sie die Gründer, die gemeinsame Mission und die Partner hinter Lavidro kennen.";

export const Route = createFileRoute("/aboutLavidro")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "https://lavidro.com/aboutLavidro" },
    ],
    links: [{ rel: "canonical", href: "https://lavidro.com/aboutLavidro" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  useCodexRuntime("/codex-runtime/home.js");
  return <CodexMarkup html={aboutHtml} className="about-page" />;
}
