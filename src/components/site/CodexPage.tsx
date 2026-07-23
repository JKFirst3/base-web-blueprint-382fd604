import { memo, useEffect } from "react";

export function extractBodyMarkup(documentHtml: string) {
  const body = documentHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? documentHtml;
  return body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

export function useCodexRuntime(src: string) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `${src}?v=1`;
    script.async = false;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [src]);
}

export const CodexMarkup = memo(function CodexMarkup({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: extractBodyMarkup(html) }} />
  );
});
