(() => {
  const functions = [
    { key: "collect", label: "Wäsche im Haus einsammeln" },
    { key: "sort", label: "Wäsche sortieren" },
    { key: "wash", label: "Wäsche waschen & trocknen" },
    { key: "fold", label: "Wäsche falten" },
    { key: "provide", label: "Wäsche bereitstellen" },
    { key: "store", label: "Wäsche in den Schrank bringen" },
  ];

  const products = {
    arm: {
      title: "Lavidro Arm",
      family: "Mobiler Wäscheassistent",
      description:
        "Flexibel im Hauswirtschaftsraum einsetzbar, ohne Umbauten. Übernimmt den Ablauf zwischen Waschmaschine und Trockner und erweitert ihn je nach Ausbaustufe.",
      image: "assets/lavidro-portrait.png",
      highlights: [
        "Flexibel einsetzbar, keine Umbauten nötig",
        "Automatisiert den Ablauf zwischen Waschmaschine und Trockner",
        "Sortiert, faltet und stellt Wäsche je nach Ausbaustufe bereit",
      ],
      levels: {
        core: { label: "Core", note: "Grundfunktionen", price: 6000, features: ["wash"] },
        plus: {
          label: "Plus",
          note: "Zusätzliche Funktionen",
          price: 9000,
          features: ["sort", "wash"],
        },
        pro: {
          label: "Pro",
          note: "Umfangreiche Funktionen",
          price: 12000,
          features: ["sort", "wash", "fold", "provide"],
        },
      },
    },
    cabinet: {
      title: "Lavidro Cabinet",
      family: "Integrierter Wäscheschrank",
      description:
        "Vollautomatischer Wäscheschrank mit intelligenter Robotik, diskret integriert und für den Prozess vom Sortieren bis zur bereitgestellten Kleidung konzipiert.",
      image: "assets/lavidro-cabinet.svg",
      highlights: [
        "Vollautomatischer Waschschrank mit intelligenter Robotik",
        "Diskret integriert mit elegantem Möbeldesign",
        "Vom Sortieren bis zur bereitgestellten Kleidung",
      ],
      levels: {
        core: { label: "Core", note: "Grundfunktionen", price: 7500, features: ["wash"] },
        plus: {
          label: "Plus",
          note: "Zusätzliche Funktionen",
          price: 10500,
          features: ["sort", "wash"],
        },
        pro: {
          label: "Pro",
          note: "Umfangreiche Funktionen",
          price: 13500,
          features: ["sort", "wash", "fold", "provide"],
        },
      },
    },
    humanoid: {
      title: "Lavidro One",
      family: "Humanoider Wäschroboter",
      description:
        "Autonomer Roboter für die gesamte Wäscheorganisation. Erkennt anfallende Wäsche, führt den Prozess aus und räumt sie in der Ultimate-Stufe zurück.",
      image: "assets/lavidro-humanoid.svg",
      highlights: [
        "Übernimmt die gesamte Wäscheorganisation",
        "Erkennt anfallende Wäsche eigenständig",
        "Führt den Prozess aus und räumt Kleidung zurück",
      ],
      levels: {
        pro: {
          label: "Pro",
          note: "Umfangreiche Funktionen",
          price: 22500,
          features: ["sort", "wash", "fold", "provide"],
        },
        ultimate: {
          label: "Ultimate",
          note: "Voller Funktionsumfang",
          price: 30000,
          features: ["collect", "sort", "wash", "fold", "provide", "store"],
        },
      },
    },
  };

  const params = new URLSearchParams(window.location.search);
  const selectedKey = products[params.get("product")] ? params.get("product") : "arm";
  const selectedProduct = products[selectedKey];
  let selectedLevelKey = Object.keys(selectedProduct.levels)[0];

  const productImage = document.querySelector("[data-product-image]");
  const productTitle = document.querySelector("[data-product-title]");
  const productFamily = document.querySelector("[data-product-family]");
  const panelTitle = document.querySelector("[data-panel-title]");
  const description = document.querySelector("[data-product-description]");
  const levelOptions = document.querySelector("[data-level-options]");
  const featureList = document.querySelector("[data-feature-list]");
  const priceLabel = document.querySelector("[data-price-label]");
  const price = document.querySelector("[data-price]");
  const priceNote = document.querySelector("[data-price-note]");
  const form = document.querySelector("[data-config-form]");
  const buyButton = document.querySelector("[data-buy-button]");
  const compareTable = document.querySelector("[data-compare-table]");
  const compareDialog = document.querySelector("[data-compare-dialog]");
  const openCompareButtons = document.querySelectorAll("[data-open-compare]");
  const closeCompareButton = document.querySelector("[data-close-compare]");

  const formatPrice = (amount) => `${amount.toLocaleString("de-DE")} €`;
  const monthlyRate = (amount) => Math.round(amount / 36);

  const selectedFinance = () => new FormData(form).get("finance") || "monthly";

  const renderLevels = () => {
    levelOptions.innerHTML = Object.entries(selectedProduct.levels)
      .map(
        ([key, level], index) => `
        <label class="option-row">
          <input type="radio" name="level" value="${key}" ${index === 0 ? "checked" : ""} />
          <span>
            <strong>${level.label}</strong>
            <small>${level.note}</small>
          </span>
          <em>${formatPrice(level.price)}</em>
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

  const renderPrice = () => {
    const level = selectedProduct.levels[selectedLevelKey];
    const finance = selectedFinance();

    if (finance === "cash") {
      priceLabel.textContent = "Einmalzahlung";
      price.textContent = formatPrice(level.price);
      priceNote.textContent = `${level.label} · ${level.note}`;
      return;
    }

    priceLabel.textContent = "Monatliche Rate";
    price.textContent = `${monthlyRate(level.price).toLocaleString("de-DE")} € / Monat`;
    priceNote.textContent = `36 Monate · Gesamtpreis ${formatPrice(level.price)}`;
  };

  const renderCompare = () => {
    const comparableProducts = Object.entries(products).filter(
      ([, product]) => product.levels[selectedLevelKey],
    );

    compareTable.innerHTML = comparableProducts
      .map(([key, product]) => {
        const level = product.levels[selectedLevelKey];
        return `
        <article class="compare-card">
          <img src="${product.image}" alt="${product.title}">
          <p class="kicker">${product.family}</p>
          <h3>${product.title}</h3>
          <strong>${level.label} · ${formatPrice(level.price)}</strong>
          <p>${level.note}</p>
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
    productTitle.textContent = selectedProduct.title;
    productFamily.textContent = selectedProduct.family;
    panelTitle.textContent = `${selectedProduct.title} konfigurieren`;
    description.textContent = selectedProduct.description;
    renderLevels();
    renderFeatures();
    renderPrice();
    renderCompare();
  };

  form?.addEventListener("change", (event) => {
    if (event.target.name === "level") {
      selectedLevelKey = event.target.value;
      renderFeatures();
      renderCompare();
    }
    renderPrice();
  });

  buyButton?.addEventListener("click", () => {
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
