(() => {
  const header = document.querySelector("[data-header]");
  const revealItems = document.querySelectorAll(".reveal");
  const form = document.querySelector("[data-form]");
  const formStatus = document.querySelector("[data-form-status]");
  const heroImage = document.querySelector(".hero-image");
  const counter = document.querySelector("[data-counter]");
  const progressCard = document.querySelector(".progress-card");
  const processSection = document.querySelector("[data-process]");
  const quoteTrack = document.querySelector(".quote-track");

  const setHeaderState = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 28);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 },
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 90}ms`;
    revealObserver.observe(item);
  });

  if (quoteTrack) {
    const setupQuoteMarquee = () => {
      const firstSet = quoteTrack.querySelector(".quote-set");
      if (!firstSet) return;

      const setWidth = firstSet.getBoundingClientRect().width;
      while (quoteTrack.scrollWidth < window.innerWidth + setWidth) {
        const clone = firstSet.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        quoteTrack.appendChild(clone);
      }

      quoteTrack.style.setProperty("--quote-shift", `${-setWidth}px`);
    };

    setupQuoteMarquee();
    window.addEventListener("resize", setupQuoteMarquee);
  }

  if (processSection) {
    const processPaths = processSection.querySelectorAll(".process-route-line");
    const processSteps = processSection.querySelectorAll(".process-step");
    const stepThresholds = [0.035, 0.34, 0.62, 0.9];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let processTicking = false;

    const prepareProcessPaths = () => {
      processPaths.forEach((path) => {
        const length = path.getTotalLength();
        path.dataset.length = String(length);
        path.style.strokeDasharray = String(length);
        path.style.strokeDashoffset = String(length);
      });
    };

    const updateProcess = () => {
      const rect = processSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const stickyDistance = Math.max(processSection.offsetHeight - viewportHeight, 1);
      const entryProgress = (1 - rect.top / viewportHeight) * 0.08;
      const stickyProgress = 0.08 + (-rect.top / stickyDistance) * 0.92;
      const rawProgress = rect.top > 0 ? entryProgress : stickyProgress;
      const progress = reduceMotion.matches ? 1 : Math.min(Math.max(rawProgress, 0), 1);

      processPaths.forEach((path) => {
        const length = Number(path.dataset.length || path.getTotalLength());
        path.style.strokeDashoffset = String(length * (1 - progress));
      });

      processSteps.forEach((step, index) => {
        step.classList.toggle("is-reached", progress >= stepThresholds[index]);
      });

      processTicking = false;
    };

    const requestProcessUpdate = () => {
      if (processTicking) return;
      window.requestAnimationFrame(updateProcess);
      processTicking = true;
    };

    prepareProcessPaths();
    updateProcess();
    window.addEventListener("scroll", requestProcessUpdate, { passive: true });
    window.addEventListener("resize", () => {
      prepareProcessPaths();
      requestProcessUpdate();
    });
  }

  let ticking = false;

  const animateHero = () => {
    if (!heroImage) return;
    const shift = Math.min(window.scrollY / 900, 1) * 18;
    heroImage.style.setProperty("translate", `0 ${shift}px`);
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(animateHero);
        ticking = true;
      }
    },
    { passive: true },
  );

  if (counter && progressCard) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const completeProgress = () => {
      progressCard.classList.add("is-loaded");

      if (reduceMotion) {
        counter.textContent = "60%";
        return;
      }

      const duration = 1600;
      const start = performance.now();

      const updateCounter = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        counter.textContent = `${Math.round(easedProgress * 60)}%`;

        if (progress < 1) window.requestAnimationFrame(updateCounter);
      };

      window.requestAnimationFrame(updateCounter);
    };

    const progressObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        completeProgress();
        progressObserver.disconnect();
      },
      { threshold: 0.45 },
    );

    progressObserver.observe(progressCard);
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();

    if (!email) {
      formStatus.textContent = "Bitte gib eine E-Mail-Adresse ein.";
      return;
    }

    formStatus.textContent = "Danke. Wir melden uns, sobald Sie LAVIDRO live erleben können.";
    form.reset();
  });

  const alignNavigationTarget = () => {
    const requestedProductTarget =
      new URLSearchParams(window.location.search).get("ziel") === "produkte";
    const targetHash = requestedProductTarget ? "#produkt-teaser" : window.location.hash;
    const supportedTargets = new Set(["#module", "#produkt-teaser", "#qualitaet"]);
    if (!supportedTargets.has(targetHash)) return;

    const targetSection = document.querySelector(targetHash);
    if (!targetSection) return;

    const previousScrollBehavior = document.documentElement.style.scrollBehavior;

    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo({ top: Math.max(0, targetSection.offsetTop) });
    window.requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    });
  };

  const scheduleNavigationAlignment = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(alignNavigationTarget);
    });
  };

  if (document.readyState === "complete") {
    scheduleNavigationAlignment();
  } else {
    window.addEventListener("load", scheduleNavigationAlignment, { once: true });
  }

  document.fonts?.ready.then(scheduleNavigationAlignment);
  window.addEventListener("pageshow", scheduleNavigationAlignment);
  window.addEventListener("hashchange", alignNavigationTarget);
})();
