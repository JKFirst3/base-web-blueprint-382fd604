import { Link } from "@tanstack/react-router";
import mobilImage from "@/assets/konfigurator-mobil.png.asset.json";
import { track } from "@/lib/track";
import { useEffect, useRef } from "react";

type Product = {
  id: string;
  brand: string;
  name: string;
  category: string;
  image: string;
};

const PRODUCTS: Product[] = [
  {
    id: "mobil",
    brand: "LAVIDRO Arm",
    name: "Mobiler Wäscheassistent",
    category: "Serie · Arm",
    image: mobilImage.url,
  },
  {
    id: "wand",
    brand: "LAVIDRO Cabinet",
    name: "Integrierter Wäscheschrank",
    category: "Serie · Cabinet",
    image: "/assets/lavidro-cabinet.webp",
  },
  {
    id: "humanoid",
    brand: "LAVIDRO One",
    name: "Humanoider Wäschroboter",
    category: "Serie · One",
    image: "/assets/lavidro-one.webp",
  },
];

export function ProductWorld() {
  const seen = useRef(false);
  useEffect(() => {
    if (seen.current) return;
    seen.current = true;
  }, []);

  return (
    <section id="system" className="bg-[#F7F5F2] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-4">
            <p className="font-display text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              LAVIDRO Produktwelt
            </p>
          </div>
          <div className="md:col-span-8">
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Drei Systeme für einen vollständig autonomen Wäschealltag.
            </h2>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {PRODUCTS.map((p) => (
            <article
              key={p.id}
              className="group flex flex-col overflow-hidden rounded-lg border border-[rgba(23,23,23,0.1)] bg-white"
            >
              <div className="aspect-[4/5] overflow-hidden bg-[#EBE6DF]">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  {p.category}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
                  {p.brand}
                </h3>
                <p className="mt-1 text-sm text-foreground/70">{p.name}</p>
                <Link
                  to="/Konfigurator"
                  hash={p.id}
                  onClick={() => track("product_click", { product_id: p.id, product_name: p.name })}
                  className="mt-6 inline-flex w-fit items-center justify-center rounded-full bg-[#050505] px-5 py-2 text-[13px] font-medium text-white transition hover:opacity-90"
                >
                  Produkt anzeigen
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
