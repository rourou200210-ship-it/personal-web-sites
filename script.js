const root = document.documentElement;
const body = document.body;
const loader = document.getElementById("loader");
const percentEl = document.getElementById("loadPercent");
const barEl = document.getElementById("loadBar");
const navLinks = [...document.querySelectorAll(".nav a")];
const sections = [...document.querySelectorAll("section[id]")];
const revealEls = [...document.querySelectorAll(".reveal")];
const scrollTitles = [...document.querySelectorAll("[data-scroll-title]")];
const workCards = [...document.querySelectorAll(".work-card")];
const photoTiltCards = [...document.querySelectorAll("[data-tilt-card]")];
const educationCards = [...document.querySelectorAll(".education-card")];
const eduModal = document.getElementById("eduModal");
const eduModalTitle = document.getElementById("eduModalTitle");
const eduModalYear = document.getElementById("eduModalYear");
const eduModalType = document.getElementById("eduModalType");
const eduModalSchool = document.getElementById("eduModalSchool");
const eduModalMajor = document.getElementById("eduModalMajor");
const eduCloseButtons = [...document.querySelectorAll("[data-edu-close]")];
let educationOpenTimer = null;
let educationFocusTimer = null;

let progress = 0;
const loadTimer = setInterval(() => {
  const step = progress < 72 ? 4 : progress < 92 ? 2 : 1;
  progress = Math.min(100, progress + step);
  percentEl.textContent = progress;
  barEl.style.width = progress + "%";

  if (progress >= 100) {
    clearInterval(loadTimer);
    setTimeout(() => {
      loader.classList.add("is-done");
      body.classList.remove("is-lock");
      body.classList.add("is-loaded");
      requestAnimationFrame(tick);
    }, 420);
  }
}, 42);

document.addEventListener("mousemove", (event) => {
  const x = (event.clientX / window.innerWidth - 0.5).toFixed(3);
  const y = (event.clientY / window.innerHeight - 0.5).toFixed(3);
  root.style.setProperty("--mx", x);
  root.style.setProperty("--my", y);
});

const magicCanvas = document.getElementById("magicCanvas");
const magicState = {
  canvas: magicCanvas,
  ctx: magicCanvas ? magicCanvas.getContext("2d") : null,
  particles: [],
  sparks: [],
  lastMove: 0,
  spin: 0,
  active: false,
  width: 0,
  height: 0,
  dpr: 1
};

function resizeMagicCanvas() {
  if (!magicState.canvas || !magicState.ctx) return;
  const rect = magicState.canvas.getBoundingClientRect();
  magicState.dpr = Math.min(window.devicePixelRatio || 1, 2);
  magicState.width = Math.max(1, Math.floor(rect.width));
  magicState.height = Math.max(1, Math.floor(rect.height));
  magicState.canvas.width = Math.floor(magicState.width * magicState.dpr);
  magicState.canvas.height = Math.floor(magicState.height * magicState.dpr);
  magicState.ctx.setTransform(magicState.dpr, 0, 0, magicState.dpr, 0, 0);
}

function addMagicBurst(x, y, strength = 1) {
  if (!magicState.ctx) return;
  const count = Math.round(4 + strength * 6);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.35 + Math.random() * 2.2 * strength;
    magicState.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed + 0.35,
      vy: Math.sin(angle) * speed - 0.25,
      life: 44 + Math.random() * 44,
      maxLife: 88,
      size: 1.2 + Math.random() * 3.4,
      spin: Math.random() * Math.PI,
      twinkle: 0.5 + Math.random() * 1.4
    });
  }
  magicState.sparks.push({ x, y, life: 28, radius: 8 + Math.random() * 18 });
  if (magicState.particles.length > 170) magicState.particles.splice(0, magicState.particles.length - 170);
  if (magicState.sparks.length > 18) magicState.sparks.splice(0, magicState.sparks.length - 18);
}

function drawStar(ctx, x, y, radius, alpha, spin) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const r = i % 2 === 0 ? radius : radius * 0.28;
    const a = i / 8 * Math.PI * 2;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = `rgba(233, 189, 223, ${alpha})`;
  ctx.shadowColor = "rgba(255, 159, 229, 0.72)";
  ctx.shadowBlur = radius * 4;
  ctx.fill();
  ctx.restore();
}

function renderMagic() {
  if (!magicState.ctx) return;
  const ctx = magicState.ctx;
  magicState.spin = (magicState.spin + 0.22) % 360;
  root.style.setProperty("--magic-spin", `${magicState.spin.toFixed(2)}deg`);
  ctx.clearRect(0, 0, magicState.width, magicState.height);

  const t = performance.now() * 0.001;
  for (let i = 0; i < 34; i += 1) {
    const x = (Math.sin(t * 0.28 + i * 1.9) * 0.5 + 0.5) * magicState.width;
    const y = (Math.cos(t * 0.21 + i * 1.4) * 0.5 + 0.5) * magicState.height;
    const alpha = 0.08 + Math.sin(t * 1.7 + i) * 0.04;
    drawStar(ctx, x, y, 1.2 + (i % 4) * 0.35, alpha, t + i);
  }

  for (let i = magicState.sparks.length - 1; i >= 0; i -= 1) {
    const spark = magicState.sparks[i];
    spark.life -= 1;
    const alpha = Math.max(0, spark.life / 28);
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, spark.radius * (1.4 - alpha), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(233, 189, 223, ${alpha * 0.34})`;
    ctx.lineWidth = 1;
    ctx.shadowColor = "rgba(255, 159, 229, 0.48)";
    ctx.shadowBlur = 18;
    ctx.stroke();
    if (spark.life <= 0) magicState.sparks.splice(i, 1);
  }

  for (let i = magicState.particles.length - 1; i >= 0; i -= 1) {
    const p = magicState.particles[i];
    p.life -= 1;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.985;
    p.vy = p.vy * 0.985 - 0.012;
    p.spin += 0.07 * p.twinkle;
    const alpha = Math.max(0, p.life / p.maxLife);
    drawStar(ctx, p.x, p.y, p.size * alpha, alpha * 0.82, p.spin);
    if (p.life <= 0) magicState.particles.splice(i, 1);
  }

  requestAnimationFrame(renderMagic);
}

if (magicCanvas && magicState.ctx) {
  resizeMagicCanvas();
  window.addEventListener("resize", resizeMagicCanvas);
  document.addEventListener("pointermove", (event) => {
    const home = document.getElementById("home");
    if (!home) return;
    const rect = home.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inside) return;
    const now = performance.now();
    if (now - magicState.lastMove < 28) return;
    magicState.lastMove = now;
    addMagicBurst(event.clientX - rect.left, event.clientY - rect.top, 0.75);
  });
  document.addEventListener("pointerdown", (event) => {
    const home = document.getElementById("home");
    if (!home) return;
    const rect = home.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
    addMagicBurst(event.clientX - rect.left, event.clientY - rect.top, 2.2);
  });
  requestAnimationFrame(renderMagic);
}
navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
    }
  });
}, { threshold: 0.16 });

revealEls.forEach((el, index) => {
  el.style.transitionDelay = Math.min(index * 0.035, 0.25) + "s";
  revealObserver.observe(el);
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.getAttribute("id");
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
    });
  });
}, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
sections.forEach((section) => sectionObserver.observe(section));

workCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width * 100).toFixed(2);
    const y = ((event.clientY - rect.top) / rect.height * 100).toFixed(2);
    card.style.setProperty("--x", x + "%");
    card.style.setProperty("--y", y + "%");
  });
});

const openEducationModal = (card) => {
  if (!eduModal) return;
  clearTimeout(educationOpenTimer);
  clearTimeout(educationFocusTimer);
  educationCards.forEach((item) => item.classList.remove("is-activating"));
  card.classList.add("is-activating");

  eduModalTitle.textContent = card.dataset.eduTitle || "";
  eduModalYear.textContent = card.dataset.eduYear || "";
  eduModalType.textContent = card.dataset.eduType || "";
  eduModalSchool.textContent = card.dataset.eduSchool || "";
  eduModalMajor.textContent = card.dataset.eduMajor || "";

  educationOpenTimer = window.setTimeout(() => {
    eduModal.classList.add("is-open");
    eduModal.setAttribute("aria-hidden", "false");
    body.classList.add("is-modal-open");

    educationFocusTimer = window.setTimeout(() => {
      eduCloseButtons.find((button) => button.classList.contains("edu-modal__close"))?.focus();
      card.classList.remove("is-activating");
    }, 420);
  }, 150);
};

const closeEducationModal = () => {
  if (!eduModal) return;
  clearTimeout(educationOpenTimer);
  clearTimeout(educationFocusTimer);
  educationCards.forEach((card) => card.classList.remove("is-activating"));
  eduModal.classList.remove("is-open");
  eduModal.setAttribute("aria-hidden", "true");
  body.classList.remove("is-modal-open");
};

educationCards.forEach((card) => {
  card.addEventListener("click", () => openEducationModal(card));
});

eduCloseButtons.forEach((button) => {
  button.addEventListener("click", closeEducationModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && eduModal?.classList.contains("is-open")) {
    closeEducationModal();
  }
});

photoTiltCards.forEach((card) => {
  // 3D photo card controls. Adjust these values to tune the interaction.
  const config = {
    maxRotateX: 8,       // up/down tilt strength, in degrees
    maxRotateY: 10,      // left/right tilt strength, in degrees
    smoothing: 0.12,     // lower = more inertia, higher = more responsive
    glareIdle: 0.05,     // reflection intensity at rest
    glareActive: 0.46,   // reflection intensity while hovering
    shadowMove: 18,      // shadow movement in px
    holoShift: 28,       // holographic foil movement, in percent
    sheenShift: 10       // laminate highlight movement, in px
  };

  const state = {
    rx: 0,
    ry: 0,
    sx: 0,
    sy: 30,
    glare: config.glareIdle,
    glareX: 50,
    glareY: 50,
    holoX: 50,
    holoY: 50,
    holoAngle: 140,
    holoRotate: -8,
    holoHue: 0,
    holoPhaseX: 0,
    holoPhaseY: 0,
    prismSize: 160,
    sheenAngle: 105,
    sheenX: 0,
    sheenY: 0,
    targetRx: 0,
    targetRy: 0,
    targetSx: 0,
    targetSy: 30,
    targetGlare: config.glareIdle,
    targetGlareX: 50,
    targetGlareY: 50,
    targetHoloX: 50,
    targetHoloY: 50,
    targetHoloAngle: 140,
    targetHoloRotate: -8,
    targetHoloHue: 0,
    targetHoloPhaseX: 0,
    targetHoloPhaseY: 0,
    targetPrismSize: 160,
    targetSheenAngle: 105,
    targetSheenX: 0,
    targetSheenY: 0,
    frame: null
  };
  let cardBounds = null;

  const render = () => {
    state.rx += (state.targetRx - state.rx) * config.smoothing;
    state.ry += (state.targetRy - state.ry) * config.smoothing;
    state.sx += (state.targetSx - state.sx) * config.smoothing;
    state.sy += (state.targetSy - state.sy) * config.smoothing;
    state.glare += (state.targetGlare - state.glare) * config.smoothing;
    state.glareX += (state.targetGlareX - state.glareX) * config.smoothing;
    state.glareY += (state.targetGlareY - state.glareY) * config.smoothing;
    state.holoX += (state.targetHoloX - state.holoX) * config.smoothing;
    state.holoY += (state.targetHoloY - state.holoY) * config.smoothing;
    state.holoAngle += (state.targetHoloAngle - state.holoAngle) * config.smoothing;
    state.holoRotate += (state.targetHoloRotate - state.holoRotate) * config.smoothing;
    state.holoHue += (state.targetHoloHue - state.holoHue) * config.smoothing;
    state.holoPhaseX += (state.targetHoloPhaseX - state.holoPhaseX) * config.smoothing;
    state.holoPhaseY += (state.targetHoloPhaseY - state.holoPhaseY) * config.smoothing;
    state.prismSize += (state.targetPrismSize - state.prismSize) * config.smoothing;
    state.sheenAngle += (state.targetSheenAngle - state.sheenAngle) * config.smoothing;
    state.sheenX += (state.targetSheenX - state.sheenX) * config.smoothing;
    state.sheenY += (state.targetSheenY - state.sheenY) * config.smoothing;

    card.style.setProperty("--photo-tilt-x", `${state.rx.toFixed(3)}deg`);
    card.style.setProperty("--photo-tilt-y", `${state.ry.toFixed(3)}deg`);
    card.style.setProperty("--photo-shadow-x", `${state.sx.toFixed(2)}px`);
    card.style.setProperty("--photo-shadow-y", `${state.sy.toFixed(2)}px`);
    card.style.setProperty("--photo-glare-opacity", state.glare.toFixed(3));
    card.style.setProperty("--photo-glare-x", `${state.glareX.toFixed(2)}%`);
    card.style.setProperty("--photo-glare-y", `${state.glareY.toFixed(2)}%`);
    card.style.setProperty("--photo-holo-x", `${state.holoX.toFixed(2)}%`);
    card.style.setProperty("--photo-holo-y", `${state.holoY.toFixed(2)}%`);
    card.style.setProperty("--photo-holo-angle", `${state.holoAngle.toFixed(2)}deg`);
    card.style.setProperty("--photo-holo-rotate", `${state.holoRotate.toFixed(2)}deg`);
    card.style.setProperty("--photo-holo-hue", `${state.holoHue.toFixed(2)}deg`);
    card.style.setProperty("--photo-holo-phase-x", `${state.holoPhaseX.toFixed(2)}px`);
    card.style.setProperty("--photo-holo-phase-y", `${state.holoPhaseY.toFixed(2)}px`);
    card.style.setProperty("--photo-prism-size", `${state.prismSize.toFixed(2)}%`);
    card.style.setProperty("--photo-sheen-angle", `${state.sheenAngle.toFixed(2)}deg`);
    card.style.setProperty("--photo-sheen-x", `${state.sheenX.toFixed(2)}px`);
    card.style.setProperty("--photo-sheen-y", `${state.sheenY.toFixed(2)}px`);

    const stillMoving =
      Math.abs(state.targetRx - state.rx) > 0.01 ||
      Math.abs(state.targetRy - state.ry) > 0.01 ||
      Math.abs(state.targetSx - state.sx) > 0.05 ||
      Math.abs(state.targetSy - state.sy) > 0.05 ||
      Math.abs(state.targetGlare - state.glare) > 0.005 ||
      Math.abs(state.targetGlareX - state.glareX) > 0.05 ||
      Math.abs(state.targetGlareY - state.glareY) > 0.05 ||
      Math.abs(state.targetHoloX - state.holoX) > 0.05 ||
      Math.abs(state.targetHoloY - state.holoY) > 0.05 ||
      Math.abs(state.targetHoloAngle - state.holoAngle) > 0.05 ||
      Math.abs(state.targetHoloRotate - state.holoRotate) > 0.05 ||
      Math.abs(state.targetHoloHue - state.holoHue) > 0.05 ||
      Math.abs(state.targetHoloPhaseX - state.holoPhaseX) > 0.05 ||
      Math.abs(state.targetHoloPhaseY - state.holoPhaseY) > 0.05 ||
      Math.abs(state.targetPrismSize - state.prismSize) > 0.05 ||
      Math.abs(state.targetSheenAngle - state.sheenAngle) > 0.05 ||
      Math.abs(state.targetSheenX - state.sheenX) > 0.05 ||
      Math.abs(state.targetSheenY - state.sheenY) > 0.05;

    state.frame = stillMoving ? requestAnimationFrame(render) : null;
  };

  const startRender = () => {
    if (!state.frame) state.frame = requestAnimationFrame(render);
  };

  const resetTilt = () => {
    state.targetRx = 0;
    state.targetRy = 0;
    state.targetSx = 0;
    state.targetSy = 30;
    state.targetGlare = config.glareIdle;
    state.targetGlareX = 50;
    state.targetGlareY = 50;
    state.targetHoloX = 50;
    state.targetHoloY = 50;
    state.targetHoloAngle = 140;
    state.targetHoloRotate = -8;
    state.targetHoloHue = 0;
    state.targetHoloPhaseX = 0;
    state.targetHoloPhaseY = 0;
    state.targetPrismSize = 160;
    state.targetSheenAngle = 105;
    state.targetSheenX = 0;
    state.targetSheenY = 0;
    startRender();
  };

  card.addEventListener("pointermove", (event) => {
    const rect = cardBounds || card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const nx = px * 2 - 1;
    const ny = py * 2 - 1;
    const distance = Math.min(1, Math.hypot(nx, ny));

    state.targetRy = nx * config.maxRotateY;
    state.targetRx = -ny * config.maxRotateX;
    state.targetSx = -nx * config.shadowMove;
    state.targetSy = 30 + Math.abs(ny) * 10;
    state.targetGlare = config.glareActive;
    state.targetGlareX = px * 100;
    state.targetGlareY = py * 100;
    state.targetHoloX = 50 + nx * config.holoShift;
    state.targetHoloY = 50 + ny * config.holoShift;
    state.targetHoloAngle = 140 + nx * 58 - ny * 36;
    state.targetHoloRotate = -8 + nx * 22 - ny * 18;
    state.targetHoloHue = nx * 88 + ny * 54;
    state.targetHoloPhaseX = nx * 58;
    state.targetHoloPhaseY = ny * 58;
    state.targetPrismSize = 155 + distance * 70;
    state.targetSheenAngle = 105 + nx * 26 - ny * 18;
    state.targetSheenX = -nx * config.sheenShift;
    state.targetSheenY = -ny * config.sheenShift;
    startRender();
  });

  document.addEventListener("pointermove", (event) => {
    const rect = cardBounds || card.getBoundingClientRect();
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if (outside && state.targetGlare !== config.glareIdle) resetTilt();
  });

  card.addEventListener("pointerenter", () => {
    cardBounds = card.getBoundingClientRect();
  });
  card.addEventListener("pointerleave", () => {
    cardBounds = null;
    resetTilt();
  });
  card.addEventListener("pointercancel", () => {
    cardBounds = null;
    resetTilt();
  });
});

function tick() {
  const vh = window.innerHeight;
  scrollTitles.forEach((title) => {
    const rect = title.parentElement.getBoundingClientRect();
    const center = rect.top + rect.height / 2 - vh / 2;
    const drift = Math.max(-120, Math.min(120, center * -0.12));
    title.style.transform = `translate3d(calc(var(--mx) * -10px), ${drift}px, 0)`;
  });
  requestAnimationFrame(tick);
}

(() => {
  const demo = document.getElementById("servicesDemo");
  if (!demo) return;

  const modules = [
    {
      title: "Social and Content",
      box: "SOCIAL AND CONTENT",
      copy: "Campaign stories, daily publishing systems and the rhythm that keeps the audience close."
    },
    {
      title: "Growth and Analytics",
      box: "GROWTH AND ANALYTICS",
      copy: "Sharp loops for acquisition, retention and reporting, tuned for fast creative decisions."
    },
    {
      title: "Community",
      box: "COMMUNITY",
      copy: "Member moments, creator programs and conversations that turn attention into belonging."
    },
    {
      title: "Design",
      box: "DESIGN",
      copy: "Identity, motion language and digital surfaces with a precise black-and-pink signal."
    },
    {
      title: "Press",
      box: "PRESS",
      copy: "Launch narratives, editorial hooks and the timing needed to make the story travel."
    },
    {
      title: "Strategy",
      box: "SPREAD THE WORD",
      copy: "A compact system for making the right people notice, repeat and remember the message."
    }
  ];

  const card = document.getElementById("servicesCard");
  const number = document.getElementById("servicesNumber");
  const title = document.getElementById("servicesTitle");
  const copy = document.getElementById("servicesCopy");
  const page = document.getElementById("servicesPage");
  const track = document.getElementById("servicesCubeTrack");
  const previous = document.getElementById("servicesPrev");
  const next = document.getElementById("servicesNext");
  const tabs = [...demo.querySelectorAll(".services-tab")];
  let activeIndex = 0;
  let isAnimating = false;
  let isInView = false;
  let autoplayTimer = null;
  let autoplayStarted = false;

  const twoDigits = (value) => String(value).padStart(2, "0");

  const createBox = (module, index) => {
    const box = document.createElement("div");
    box.className = "services-box";
    box.dataset.index = index;
    box.innerHTML = `
      <div class="services-face services-face--front"><span class="services-box-label">${module.box}</span></div>
      <div class="services-face services-face--top"><span class="services-box-label">${module.box}</span></div>
      <div class="services-face services-face--side"><span class="services-box-label">${module.box}</span></div>
    `;
    track.appendChild(box);
  };

  const updateBoxes = () => {
    demo.querySelectorAll(".services-box").forEach((box, index) => {
      const delta = index - activeIndex;
      const distance = Math.abs(delta);
      box.style.setProperty("--services-box-y", `${delta * 86}px`);
      box.style.setProperty("--services-box-z", `${distance * -54}px`);
      box.style.setProperty("--services-box-rx", `${delta * -19}deg`);
      box.style.setProperty("--services-box-scale", Math.max(0.68, 1 - distance * 0.08));
      box.style.setProperty("--services-box-opacity", distance > 3 ? 0 : Math.max(0.18, 1 - distance * 0.24));
      box.style.setProperty("--services-box-sat", distance === 0 ? 1 : 0.72);
    });
  };

  const updateCard = () => {
    const module = modules[activeIndex];
    card.classList.add("is-changing");
    window.setTimeout(() => {
      number.textContent = twoDigits(activeIndex + 1);
      title.textContent = module.title;
      copy.textContent = module.copy;
      page.textContent = `${twoDigits(activeIndex + 1)}/${twoDigits(modules.length)}`;
      card.classList.remove("is-changing");
    }, 210);
  };

  const setActive = (index) => {
    const nextIndex = (index + modules.length) % modules.length;
    activeIndex = nextIndex;
    isAnimating = true;
    demo.style.setProperty("--services-active", activeIndex);
    demo.style.setProperty("--services-progress", activeIndex / (modules.length - 1));
    demo.style.setProperty("--services-pulse", activeIndex % 2);
    demo.classList.toggle("is-final", activeIndex >= modules.length - 1);
    tabs.forEach((tab, tabIndex) => tab.classList.toggle("is-active", tabIndex === 0));
    updateBoxes();
    updateCard();
    window.setTimeout(() => {
      isAnimating = false;
    }, 760);
  };

  const stopAutoplay = () => {
    if (!autoplayTimer) return;
    window.clearInterval(autoplayTimer);
    autoplayTimer = null;
  };

  const move = (direction, fromUser = true) => {
    if (isAnimating) return;
    if (fromUser) stopAutoplay();
    setActive(activeIndex + direction);
  };

  const startAutoplay = () => {
    if (autoplayStarted) return;
    autoplayStarted = true;
    let steps = 0;
    autoplayTimer = window.setInterval(() => {
      steps += 1;
      if (steps >= modules.length || !isInView) {
        stopAutoplay();
        return;
      }
      move(1, false);
    }, 1500);
  };

  modules.forEach(createBox);
  setActive(0);

  previous?.addEventListener("click", () => move(-1));
  next?.addEventListener("click", () => move(1));

  const handleServicesWheel = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (Math.abs(event.deltaY) < 12 || isAnimating) return;
    move(event.deltaY > 0 ? 1 : -1);
  };

  demo.addEventListener("wheel", handleServicesWheel, { passive: false });

  document.addEventListener("keydown", (event) => {
    if (!isInView) return;
    if (event.key === "ArrowDown" || event.key === "PageDown") move(1);
    if (event.key === "ArrowUp" || event.key === "PageUp") move(-1);
  });

  const demoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isInView = entry.isIntersecting;
      if (isInView) startAutoplay();
    });
  }, { threshold: 0.46 });

  demoObserver.observe(demo);
})();
