(() => {
  // The script is reinserted on SPA navigation; clear previous observers/listeners.
  window.__lavidroHomeCleanup?.();
  const abort = new AbortController();
  const activeObservers = [];
  window.__lavidroHomeCleanup = () => {
    abort.abort();
    for (const observer of activeObservers) observer.disconnect();
  };
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
  window.addEventListener("scroll", setHeaderState, { passive: true, signal: abort.signal });

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

  activeObservers.push(revealObserver);
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
    window.addEventListener("resize", setupQuoteMarquee, { signal: abort.signal });
  }

  if (processSection) {
    const processPaths = processSection.querySelectorAll(".process-route-line");
    const processSteps = processSection.querySelectorAll(".process-step");
    const stepThresholds = [0.05, 0.43, 0.73, 0.94];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let processTicking = false;

    const renderProcessPath = (path, progress) => {
      const geometry = path.previousElementSibling;
      if (!geometry?.matches(".process-route-base")) return;

      const length = Number(path.dataset.length || geometry.getTotalLength());
      const visibleLength = length * progress;
      const start = geometry.getPointAtLength(0);

      if (visibleLength <= 0.01) {
        path.setAttribute("d", `M ${start.x} ${start.y}`);
        return;
      }

      const segments = Math.max(1, Math.ceil(visibleLength / 6));
      let partialPath = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`;

      for (let index = 1; index <= segments; index += 1) {
        const point = geometry.getPointAtLength((visibleLength * index) / segments);
        partialPath += ` L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
      }

      path.setAttribute("d", partialPath);
    };

    const prepareProcessPaths = () => {
      processPaths.forEach((path) => {
        const geometry = path.previousElementSibling;
        if (!geometry?.matches(".process-route-base")) return;

        const length = geometry.getTotalLength();
        path.dataset.length = String(length);
        path.style.strokeDasharray = "none";
        path.style.strokeDashoffset = "0";
        renderProcessPath(path, 0);
      });
    };

    const updateProcess = () => {
      const rect = processSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const stickyDistance = Math.max(processSection.offsetHeight - viewportHeight, 1);
      const rawProgress = -rect.top / stickyDistance;
      const progress =
        rect.top >= 0
          ? 0
          : reduceMotion.matches
            ? 1
            : Math.min(Math.max(rawProgress, 0), 1);

      processSection.classList.toggle("is-drawing", progress > 0.001);

      processPaths.forEach((path) => {
        renderProcessPath(path, progress);
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
    window.addEventListener("scroll", requestProcessUpdate, { passive: true, signal: abort.signal });
    window.addEventListener("resize", () => {
      prepareProcessPaths();
      requestProcessUpdate();
    }, { signal: abort.signal });
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
    { passive: true, signal: abort.signal },
  );

  if (counter && progressCard) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const completeProgress = () => {
      progressCard.classList.add("is-loaded");

      if (reduceMotion) {
        counter.textContent = "100 %";
        return;
      }

      const duration = 1600;
      const start = performance.now();

      const updateCounter = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        counter.textContent = `${Math.round(easedProgress * 100)} %`;

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

    activeObservers.push(progressObserver);
    progressObserver.observe(progressCard);
  }

  // Newsletter submit is handled by the page itself (real backend request, real status).

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
    window.addEventListener("load", scheduleNavigationAlignment, { once: true, signal: abort.signal });
  }

  document.fonts?.ready.then(() => { if (!abort.signal.aborted) scheduleNavigationAlignment(); });
  window.addEventListener("pageshow", scheduleNavigationAlignment, { signal: abort.signal });
  window.addEventListener("hashchange", alignNavigationTarget, { signal: abort.signal });
})();
