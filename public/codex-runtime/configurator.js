(() => {
  const functions = [
    { key: "collect", label: "Wäsche im Haus einsammeln" },
    { key: "sort", label: "Wäsche sortieren" },
    { key: "wash", label: "Wäsche waschen & trocknen" },
    { key: "fold", label: "Wäsche falten" },
    { key: "provide", label: "Wäsche nach Personen bereitstellen" },
    { key: "store", label: "Wäsche in den Schrank bringen" },
    { key: "stain", label: "Flecken gezielt behandeln" },
    { key: "refresh", label: "Kleidungsstücke auffrischen" },
  ];

  const products = {
    mobile: {
      title: "Lavidro Mobile",
      family: "Mobiler Wäscheassistent",
      description:
        "Ein mobiler Roboterarm auf fahrbarer Basis für automatisierte Wäschepflege. Er wird flexibel im Hauswirtschaftsraum positioniert und verbindet die Stationen des Wäschealltags.",
      image: "assets/lavidro-hero-humanoid-v4.png",
      highlights: [
        "Roboterarm auf fahrbarer Basis statt fest montierter Lösung",
        "Flexibel im Hauswirtschaftsraum positionierbar",
        "Automatisiert den Ablauf zwischen Wäsche, Maschinen und Ablage",
      ],
      levels: {
        premium: {
          label: "Premium",
          note: "Mehr Automatisierung für den vollständigen Ablauf",
          price: 14000,
          features: ["sort", "wash", "fold", "provide"],
        },
      },
    },
    cabinet: {
      title: "Lavidro Cabinet",
      family: "Integrierter Wäscheschrank",
      description:
        "Vollautomatischer Wäscheschrank mit intelligenter Robotik, diskret integriert und für den Prozess vom Sortieren bis zur bereitgestellten Kleidung konzipiert.",
      image: "/__l5e/assets-v1/951a43fb-a953-4e09-b964-5ae22977e862/lavidro-cabinet.png",
      highlights: [
        "Integrierter Wäscheschrank mit intelligenter Robotik",
        "Diskret integriert mit elegantem Möbeldesign",
        "Planungsrichtwert: ab 3 m² bis 5 m² Fläche",
      ],
      levels: {
        premium: {
          label: "Premium",
          note: "Planungsrichtwert ab 5 m² Fläche",
          price: 21500,
          features: ["sort", "wash", "fold", "provide"],
        },
      },
    },
    one: {
      title: "Lavidro One",
      family: "Einzelteilbehandlung im Schrank",
      description:
        "Ein Roboterarm im Schrank, der einzelne Kleidungsstücke behandelt: Flecken gezielt vorbehandeln und Textilien zwischendurch auffrischen – ohne komplette Waschladung.",
      image: "/__l5e/assets-v1/d374de19-f828-4b44-8831-d1e221804f08/lavidro-one.png",
      highlights: [
        "Roboterarm im Schrank für die Behandlung einzelner Kleidungsstücke",
        "Gezielte Fleckenbehandlung statt kompletter Waschladung",
        "Auffrischen von Textilien zwischen zwei Tragen",
      ],
      levels: {
        standard: {
          label: "Standard",
          note: "Fleckenbehandlung und Auffrischen einzelner Kleidungsstücke",
          price: 10000,
          features: ["refresh", "stain"],
        },
      },
    },
  };

  const params = new URLSearchParams(window.location.search);
  const selectedKey = products[params.get("product")] ? params.get("product") : "mobile";
  if (params.get("product") && !products[params.get("product")]) {
    params.set("product", selectedKey);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }
  const selectedProduct = products[selectedKey];
  let selectedLevelKey = Object.keys(selectedProduct.levels)[0];

  const productImage = document.querySelector("[data-product-image]");
  const productTitle = document.querySelector("[data-product-title]");
  const productFamily = document.querySelector("[data-product-family]");
  const panelTitle = document.querySelector("[data-panel-title]");
  const description = document.querySelector("[data-product-description]");
  const levelOptions = document.querySelector("[data-level-options]");
  const featureList = document.querySelector("[data-feature-list]");
  const form = document.querySelector("[data-config-form]");
  const buyButton = document.querySelector("[data-buy-button]");
  const priceUpfront = document.querySelector("[data-price-upfront]");
  const priceMonthly = document.querySelector("[data-price-monthly]");
  const compareTable = document.querySelector("[data-compare-table]");
  const compareDialog = document.querySelector("[data-compare-dialog]");
  const openCompareButtons = document.querySelectorAll("[data-open-compare]");
  const closeCompareButton = document.querySelector("[data-close-compare]");

  const monthlyRate = (amount) => Math.round((amount / 36) * 1.08);

  const selectedFinance = () => (form ? new FormData(form).get("finance") : null);

  const renderLevels = () => {
    const level = selectedProduct.levels[selectedLevelKey];
    const options = [
      ["cash", "Kaufpreis", `Einmalig ${level.price.toLocaleString("de-DE")} €`],
      ["monthly", "Monatlicher Beitrag (Abo)", `${monthlyRate(level.price).toLocaleString("de-DE")} € / Monat im Abonnement`],
    ];
    levelOptions.innerHTML = options
      .map(
        ([key, label, note]) => `
        <label class="option-row">
          <input type="radio" name="finance" value="${key}" />
          <span>
            <strong>${label}</strong>
            <small>${note}</small>
          </span>
        </label>
      `,
      )
      .join("");
  };

  const renderFeatures = () => {
    const activeFeatures = selectedProduct.levels[selectedLevelKey].features;
    featureList.innerHTML = functions
      .map((feature) => {
        const available = activeFeatures.includes(feature.key);
        return `
        <li class="${available ? "is-available" : "is-unavailable"}">
          <span aria-hidden="true">${available ? "✓" : "–"}</span>
          <strong>${feature.label}</strong>
        </li>
      `;
      })
      .join("");
  };

  const renderPrices = () => {
    const level = selectedProduct.levels[selectedLevelKey];
    priceUpfront.textContent = `${level.price.toLocaleString("de-DE")} €`;
    priceMonthly.textContent = `${monthlyRate(level.price).toLocaleString("de-DE")} € / Monat`;
    const finance = selectedFinance();
    priceUpfront.closest("p")?.classList.toggle("is-selected", finance === "cash");
    priceMonthly.closest("p")?.classList.toggle("is-selected", finance === "monthly");
    if (buyButton) {
      buyButton.disabled = !finance;
      buyButton.title = finance ? "" : "Bitte zuerst Kaufpreis oder Abo wählen";
    }
  };

  const renderCompare = () => {
    const comparableProducts = Object.entries(products).filter(
      ([, product]) => Object.keys(product.levels).length,
    );

    compareTable.innerHTML = comparableProducts
      .map(([key, product]) => {
        const level = Object.values(product.levels)[0];
        return `
        <article class="compare-card">
          <img src="${product.image}" alt="Produktansicht: ${product.title}">
          <p class="kicker">${product.title}</p>
          <h3>${product.family}</h3>
          <p>${level.price.toLocaleString("de-DE")} € oder ${monthlyRate(level.price).toLocaleString("de-DE")} € / Monat im Abo</p>
          <ul>
            ${product.highlights.map((highlight) => `<li>${highlight}</li>`).join("")}
          </ul>
          <a class="outline-button" href="/Konfigurator?product=${key}">Konfigurieren</a>
        </article>
      `;
      })
      .join("");
  };

  const renderProduct = () => {
    productImage.src = selectedProduct.image;
    productImage.alt = `${selectedProduct.title} Produktvorschau`;
    productTitle.textContent = selectedProduct.family;
    productFamily.textContent = selectedProduct.title;
    panelTitle.textContent = `${selectedProduct.title} konfigurieren`;
    description.textContent = selectedProduct.description;
    renderLevels();
    renderFeatures();
    renderPrices();
    renderCompare();
  };

  form?.addEventListener("change", (event) => {
    if (event.target.name === "finance") {
      renderPrices();
      if (event.isTrusted) {
        window.dispatchEvent(
          new CustomEvent("lavidro:purchase-model", {
            detail: {
              productId: selectedKey,
              paymentType: event.target.value === "cash" ? "upfront" : "monthly",
            },
          }),
        );
      }
    }
  });

  buyButton?.addEventListener("click", () => {
    if (!selectedFinance()) return;
    const level = selectedProduct.levels[selectedLevelKey];
    window.dispatchEvent(
      new CustomEvent("lavidro:preorder", {
        detail: {
          productId: selectedKey,
          productName: selectedProduct.title,
          family: selectedProduct.family,
          tier: selectedLevelKey,
          tierLabel: level.label,
          price: level.price,
          monthly: monthlyRate(level.price),
          paymentType: selectedFinance() === "cash" ? "upfront" : "monthly",
        },
      }),
    );
  });

  openCompareButtons.forEach((button) => {
    button.addEventListener("click", () => {
      renderCompare();
      compareDialog?.showModal();
    });
  });

  closeCompareButton?.addEventListener("click", () => compareDialog.close());

  compareDialog?.addEventListener("click", (event) => {
    if (event.target === compareDialog) {
      compareDialog.close();
    }
  });

  renderProduct();
})();
