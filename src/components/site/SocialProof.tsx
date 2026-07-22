import mieleLogo from "@/assets/miele-logo.png.asset.json";
import garage33Logo from "@/assets/garage33-logo.png.asset.json";
import factory33Logo from "@/assets/factory33-logo.png.asset.json";

export function SocialProof() {
  const partners = [
    { name: "Miele", note: "Industriepartner", logo: mieleLogo.url },
    { name: "Garage33", note: "Forschungspartner", logo: garage33Logo.url },
    { name: "Factory33", note: "Gründungspartner", logo: factory33Logo.url },
  ];

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="text-center font-display text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Unsere Partner
        </p>
        <div className="mt-14 grid grid-cols-1 divide-y divide-[rgba(23,23,23,0.16)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {partners.map((p) => (
            <div
              key={p.name}
              className="flex flex-col items-center justify-center gap-4 py-10 sm:py-4"
            >
              <div className="flex h-20 w-full items-center justify-center">
                <img
                  src={p.logo}
                  alt={`${p.name} Logo`}
                  loading="lazy"
                  className="max-h-16 w-auto max-w-[70%] object-contain"
                />
              </div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                {p.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
