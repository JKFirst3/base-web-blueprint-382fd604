(() => {
  const products = {
    mobile: {
      slogan: "Wäschearbeit abgeben. Mehr Zeit für das Leben.",
      benefits: ["Bis zu acht Stunden weniger Wäschearbeit pro Woche*", "Rund 8.300 € jährlicher Arbeitswert im Modell*"],
      title: "Lavidro Mobile",
      family: "Mobiler Wäscheassistent",
      description:
        "Sortieren, umladen, falten: Lavidro integriert Robotik anderer Hersteller in Ihren Waschraum.",
      image: "assets/lavidro-hero-humanoid-v4.png",
      highlights: [
        "Mobiler Roboterarm für automatisierte Wäschepflege",
        "Flexibel im Hauswirtschaftsraum positionierbar",
        "Automatisiert den Ablauf zwischen Wäsche, Maschinen und Ablage",
      ],
      levels: {
        premium: {
          note: "Mehr Automatisierung für den vollständigen Ablauf",
          price: 22990,
          monthly: 469,
          features: ["sort", "wash", "fold", "provide"],
        },
      },
    },
    cabinet: {
      slogan: "Schmutzige Wäsche rein. Gefaltete Wäsche raus.",
      benefits: ["Schmutzige Wäsche rein. Gefaltete Kleidung zurück.", "Rund 8.300 € jährlicher Arbeitswert im Modell*"],
      title: "Lavidro Cabinet",
      family: "Autonomer Wäscheschrank",
      description:
        "Diskret integriert: Lavidro verbindet einen Wäscheschrank mit Robotik anderer Hersteller.",
      image: "/__l5e/assets-v1/951a43fb-a953-4e09-b964-5ae22977e862/lavidro-cabinet.png",
      highlights: [
        "Autonomer Wäscheschrank mit intelligenter Robotik",
        "Diskret integriert mit elegantem Möbeldesign",
        "Planungsrichtwert: ab 3 m² bis 5 m² Fläche",
      ],
      levels: {
        premium: {
          note: "Planungsrichtwert ab 5 m² Fläche",
          price: 20449,
          monthly: 390,
          features: ["sort", "wash", "fold", "provide"],
        },
      },
    },
    one: {
      slogan: "Lieblingsstück schonend reinigen, Knitterfalten glätten.",
      benefits: ["Flecken gezielt und schonend behandeln", "Knitterfalten glätten statt selbst bügeln"],
      title: "Lavidro One",
      family: "Einzelne Wäscheaufbereitung",
      description:
        "Flecken gezielt behandeln und Kleidung glätten: Lavidro One integriert Robotik anderer Hersteller.",
      image: "/__l5e/assets-v1/d374de19-f828-4b44-8831-d1e221804f08/lavidro-one.png",
      highlights: [
        "Roboterarm im Schrank für die Behandlung einzelner Kleidungsstücke",
        "Gezielte Fleckenbehandlung statt kompletter Waschladung",
        "Knitterfalten schonend glätten",
      ],
      levels: {
        standard: {
          note: "Fleckenbehandlung und Bügeln einzelner Kleidungsstücke",
          price: 8990,
          monthly: 199,
          features: ["stain", "iron"],
        },
      },
    },
  };

  // Each ad selects one stable copy variant; A is the default.
  const variants = {
    mobile: {
      a: ["Mehr Zeit. Weniger Wäsche.", "Wäschearbeit abgeben. Mehr Zeit für das Leben."],
      b: ["Ein Arbeitstag mehr für Ihr Leben.", "Bis zu acht Stunden Wäschearbeit pro Woche zurückgewinnen.*"],
      c: ["Mehr Zeit für die Menschen, die zählen.", "Lavidro übernimmt die wiederkehrende Wäschearbeit."],
    },
    cabinet: {
      a: ["Schmutzige Wäsche rein. Gefaltete Wäsche raus.", "Wäschepflege, die im Schrank verschwindet."],
      b: ["Keine Wäscheberge. Mehr Ruhe.", "Ein aufgeräumtes Zuhause beginnt bei der Wäsche."],
      c: ["Ihr Zuhause. Ihre Zeit. Ihre Ruhe.", "Wäsche reinlegen. Den Rest Lavidro überlassen."],
    },
    one: {
      a: ["Lieblingsstück schonend reinigen, Knitterfalten glätten.", "Gezielte Fleckenbehandlung und Bügeln in einem System."],
      b: ["Flecken weg. Falten glatt.", "Ihr Lieblingsstück bekommt wieder seinen großen Auftritt."],
      c: ["Ihr Lieblingsstück verdient einen zweiten Auftritt.", "Flecken schonend entfernen. Knitterfalten glätten."],
    },
  };
  const params = new URLSearchParams(window.location.search);
  const selectedKey = products[params.get("product")] ? params.get("product") : "mobile";
  if (params.get("product") && !products[params.get("product")]) {
    params.set("product", selectedKey);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }
  const selectedProduct = products[selectedKey];
  const rawVariant = params.get("lv_variant");
  const selectedVariant = rawVariant === "b" || rawVariant === "c" ? rawVariant : "a";
  const [variantTitle, variantPromise] = variants[selectedKey][selectedVariant];
  const saleCampaigns = {
    mobile: "smoke_google_mobile_sale_v1",
    cabinet: "smoke_google_cabinet_sale_v1",
    one: "smoke_google_one_sale_v1",
  };
  const saleValues = {
    mobile: { price: 11490, monthly: 234 },
    cabinet: { price: 10220, monthly: 195 },
    one: { price: 4490, monthly: 99 },
  };
  let selectedLevelKey = Object.keys(selectedProduct.levels)[0];

  const productImage = document.querySelector("[data-product-image]");
  const productTitle = document.querySelector("[data-product-title]");
  const productFamily = document.querySelector("[data-product-family]");
  const panelTitle = document.querySelector("[data-panel-title]");
  const description = document.querySelector("[data-product-description]");
  const promise = document.querySelector("[data-product-promise]");
  const compareTable = document.querySelector("[data-compare-table]");
  const compareDialog = document.querySelector("[data-compare-dialog]");
  const openCompareButtons = document.querySelectorAll("[data-open-compare]");
  const closeCompareButton = document.querySelector("[data-close-compare]");

  const renderCompare = () => {
    const comparableProducts = Object.entries(products).filter(
      ([, product]) => Object.keys(product.levels).length,
    );

    compareTable.innerHTML = comparableProducts
      .map(([key, product]) => {
        return `
        <article class="compare-card">
          <img src="${product.image}" alt="Produktansicht: ${product.title}">
          <p class="kicker">${product.title}</p>
          <h3>${product.family}</h3>

          <ul>
            ${product.highlights.map((highlight) => `<li>${highlight}</li>`).join("")}
          </ul>
          <a class="outline-button" href="/Konfigurator?product=${key}">Produkt anzeigen</a>
        </article>
      `;
      })
      .join("");
  };

  const renderProduct = () => {
    productImage.src = selectedProduct.image;
    productImage.alt = selectedProduct.title + " Produktvorschau";
    productTitle.textContent = variantTitle;
    productFamily.textContent = selectedProduct.title;
    panelTitle.textContent = selectedProduct.title;
    description.textContent = selectedProduct.description;
    promise.textContent = variantPromise;
    document.querySelector("[data-benefit-list]").innerHTML = selectedProduct.benefits
      .map((value) => '<li><span class="benefit-check" aria-hidden="true">✓</span><strong>' + value + '</strong></li>')
      .join("");
    const level = selectedProduct.levels[selectedLevelKey];
    const isSale = params.get("lv_campaign") === saleCampaigns[selectedKey];
    const quoted = isSale ? saleValues[selectedKey] : level;
    document.querySelector("[data-price-indication]").textContent =
      quoted.price.toLocaleString("de-DE") + " € · " + quoted.monthly.toLocaleString("de-DE") + " €/Monat";
    document.querySelector("[data-product-notes]").hidden = selectedKey === "one";
    renderCompare();
  };

  // Keep a single set of anchor targets: sidebar on desktop, page end on mobile.
  const mobileLayout = window.matchMedia("(max-width: 980px)");
  const notes = document.querySelector("[data-product-notes]");
  const placeNotes = () => {
    const target = document.querySelector(mobileLayout.matches ? "[data-mobile-notes]" : "[data-desktop-notes]");
    if (!target || !notes?.isConnected) {
      mobileLayout.removeEventListener("change", placeNotes);
      return;
    }
    target.appendChild(notes);
  };
  placeNotes();
  mobileLayout.addEventListener("change", placeNotes);

  document.querySelectorAll("[data-buy-button]").forEach((buyButton) => {
    buyButton.addEventListener("click", () => {
      const level = selectedProduct.levels[selectedLevelKey];
      window.dispatchEvent(new CustomEvent("lavidro:preorder", {
        detail: {
          productId: selectedKey,
          productName: selectedProduct.title,
          family: selectedProduct.family,
          tier: selectedLevelKey,
          price: level.price,
          monthly: level.monthly,
          paymentType: "upfront",
        },
      }));
    });
  });

  openCompareButtons.forEach((button) => {
    button.addEventListener("click", () => {
      renderCompare();
      compareDialog?.showModal();
      window.dispatchEvent(new CustomEvent("lavidro:comparison-opened"));
    });
  });

  compareTable?.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    if (!link) return;
    const target = new URL(link.href, window.location.origin).searchParams.get("product");
    if (target && products[target] && target !== selectedKey) {
      window.dispatchEvent(new CustomEvent("lavidro:comparison-product-selected", {
        detail: { productId: target },
      }));
    }
  });

  closeCompareButton?.addEventListener("click", () => compareDialog.close());

  compareDialog?.addEventListener("click", (event) => {
    if (event.target === compareDialog) {
      compareDialog.close();
    }
  });

  renderProduct();
})();
