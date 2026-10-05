(() => {
  const functions = [
    { key: "sort", label: "Wäsche sortieren" },
    { key: "wash", label: "Wäsche waschen & trocknen" },
    { key: "fold", label: "Wäsche falten" },
    { key: "provide", label: "Wäsche nach Personen bereitstellen" },
    { key: "stain", label: "Flecken gezielt behandeln" },
    { key: "refresh", label: "Kleidungsstücke auffrischen" },
  ];

  const products = {
    mobile: {
      title: "Lavidro Mobile",
      family: "Mobiler Wäscheassistent",
      description:
        "Ein mobiler Roboterarm auf fahrbarer Basis für automatisierte Wäschepflege. Er wird flexibel im Hauswirtschaftsraum positioniert und übernimmt Ihre Wäsche.",
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
      title: "Lavidro Cabinet",
      family: "Autonomer Wäscheschrank",
      description:
        "Vollautomatischer Wäscheschrank mit intelligenter Robotik, diskret integriert und für den Prozess vom Sortieren bis zur bereitgestellten Kleidung konzipiert.",
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
      title: "Lavidro One",
      family: "Einzelne Wäscheaufbereitung",
      description:
        "Ein leistungsstarkes Dampfreinigungssystem entfernt bis zu 99,99 % der Gerüche, Viren und Bakterien aus den Textilien und frischt sie hygienisch auf. Ergänzend behandelt ein integrierter Roboterarm einzelne Kleidungsstücke gezielt, bearbeitet Flecken punktgenau und kann Textilien zusätzlich schonend steamen. So werden Kleidungsstücke gezielt gepflegt und aufgefrischt, wann immer es nötig ist.",
      image: "/__l5e/assets-v1/d374de19-f828-4b44-8831-d1e221804f08/lavidro-one.png",
      highlights: [
        "Roboterarm im Schrank für die Behandlung einzelner Kleidungsstücke",
        "Gezielte Fleckenbehandlung statt kompletter Waschladung",
        "Textilien zwischen zwei Tragevorgängen auffrischen",
      ],
      levels: {
        standard: {
          note: "Fleckenbehandlung und Auffrischen einzelner Kleidungsstücke",
          price: 8990,
          monthly: 199,
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
  const promise = document.querySelector("[data-product-promise]");
  const featureList = document.querySelector("[data-feature-list]");
  const buyButton = document.querySelector("[data-buy-button]");
  const compareTable = document.querySelector("[data-compare-table]");
  const compareDialog = document.querySelector("[data-compare-dialog]");
  const openCompareButtons = document.querySelectorAll("[data-open-compare]");
  const closeCompareButton = document.querySelector("[data-close-compare]");

  const renderFeatures = () => {
    const activeFeatures = selectedProduct.levels[selectedLevelKey].features;
    featureList.innerHTML = functions
      .map((feature) => {
        const available = activeFeatures.includes(feature.key);
        return `
        <li class="${available ? "is-available" : "is-unavailable"}">
          <span aria-hidden="true">${available ? "✓" : "×"}</span>
          <strong>${feature.label}</strong>
        </li>
      `;
      })
      .join("");
  };

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
    productImage.alt = `${selectedProduct.title} Produktvorschau`;
    productTitle.textContent = selectedProduct.family;
    productFamily.textContent = selectedProduct.title;
    panelTitle.textContent = selectedProduct.title;
    description.textContent = selectedProduct.description;
    promise.textContent = selectedKey === "one"
      ? "Bereitet Ihre schönsten Wäschestücke wieder auf, ganz ohne Waschen."
      : "Dreckige Wäsche dem System geben und saubere, gefaltete Wäsche zurückbekommen.";
    renderFeatures();
    renderCompare();
  };

  buyButton?.addEventListener("click", () => {
    const level = selectedProduct.levels[selectedLevelKey];
    window.dispatchEvent(
      new CustomEvent("lavidro:preorder", {
        detail: {
          productId: selectedKey,
          productName: selectedProduct.title,
          family: selectedProduct.family,
          tier: selectedLevelKey,
          price: level.price,
          monthly: level.monthly,

          paymentType: "upfront",
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
