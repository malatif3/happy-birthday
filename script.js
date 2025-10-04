const typingText = "Setiap misi sudah kamu jalani—malam ini kita rayakan semua kemenanganmu.";
const baseDateParts = {
  year: 1974,
  month: 10,
  day: 4,
  hour: 0,
  minute: 0,
  second: 0
};
const timezoneFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Etc/GMT+7",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
const baseDateFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Etc/GMT+7",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
const numberFormatter = new Intl.NumberFormat("en-US");
let typingIndex = 0;
let lastSparkleTime = 0;
const sparkleCooldown = 120;
const sparkleChance = 0.55;
const baseTimezoneOffset = "-07:00";
const baseDateUTCValue = Date.UTC(
  baseDateParts.year,
  baseDateParts.month - 1,
  baseDateParts.day,
  baseDateParts.hour + 7,
  baseDateParts.minute,
  baseDateParts.second
);

function typingEffect() {
  const typingContainer = document.getElementById("typing");
  if (!typingContainer) return;
  typingContainer.textContent = "";

  function typeNext() {
    if (typingIndex < typingText.length) {
      typingContainer.textContent += typingText.charAt(typingIndex);
      typingIndex += 1;
      setTimeout(typeNext, 70);
    }
  }

  typeNext();
}

function getTimezoneParts(date) {
  return timezoneFormatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = Number(part.value);
    }
    return acc;
  }, {});
}

function updateTimezoneClock() {
  const clock = document.getElementById("timezoneClock");
  if (!clock) return;

  const parts = getTimezoneParts(new Date());
  const pad = (value) => String(value).padStart(2, "0");
  clock.textContent = `${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
}

function updateBaseDateDisplay() {
  const baseDateElement = document.getElementById("baseDateDisplay");
  if (!baseDateElement) return;

  const formatted = baseDateFormatter.format(new Date(baseDateUTCValue));
  const pad = (value) => String(value).padStart(2, "0");
  const isoString = `${baseDateParts.year}-${pad(baseDateParts.month)}-${pad(baseDateParts.day)}T${pad(baseDateParts.hour)}:${pad(baseDateParts.minute)}:${pad(baseDateParts.second)}${baseTimezoneOffset}`;
  baseDateElement.textContent = formatted;
  baseDateElement.setAttribute("datetime", isoString);
}

function updateElapsedTime() {
  const nowParts = getTimezoneParts(new Date());
  if (!nowParts.year) return;

  let years = nowParts.year - baseDateParts.year;
  let months = nowParts.month - baseDateParts.month;
  let days = nowParts.day - baseDateParts.day;

  if (days < 0) {
    months -= 1;
    const prevMonthLength = new Date(Date.UTC(nowParts.year, nowParts.month - 1, 0)).getUTCDate();
    days += prevMonthLength;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const anchorUtc = Date.UTC(
    baseDateParts.year + years,
    baseDateParts.month - 1 + months,
    baseDateParts.day + days,
    baseDateParts.hour,
    baseDateParts.minute,
    baseDateParts.second
  );

  const nowUtc = Date.UTC(
    nowParts.year,
    nowParts.month - 1,
    nowParts.day,
    nowParts.hour,
    nowParts.minute,
    nowParts.second
  );

  let diffMs = nowUtc - anchorUtc;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  diffMs -= hours * 60 * 60 * 1000;
  const minutes = Math.floor(diffMs / (1000 * 60));
  diffMs -= minutes * 60 * 1000;
  const seconds = Math.floor(diffMs / 1000);

  const map = {
    years,
    months,
    days,
    hours,
    minutes,
    seconds
  };

  Object.entries(map).forEach(([key, value]) => {
    const target = document.getElementById(key);
    if (target) {
      target.textContent = numberFormatter.format(value);
    }
  });
}

function initSlider() {
  const slidesWindow = document.querySelector(".slides-window");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const prevButton = document.querySelector(".slider-nav.prev");
  const nextButton = document.querySelector(".slider-nav.next");
  let currentSlide = 0;

  function updateSlides() {
    if (!slidesWindow || !slides.length) return;
    const windowWidth = slidesWindow.getBoundingClientRect().width;
    const baseShift = Math.min(windowWidth / 2.2, 220);

    slides.forEach((slide, index) => {
      let offset = index - currentSlide;
      const half = slides.length / 2;
      if (offset > half) offset -= slides.length;
      if (offset < -half) offset += slides.length;
      const absOffset = Math.abs(offset);
      const translateX = offset * baseShift;
      const scale = Math.max(0.65, 1 - absOffset * 0.18);
      const rotate = offset * -7;
      const depthOpacity = absOffset > 2 ? 0 : Math.max(0.35, 1 - absOffset * 0.2);

      slide.style.transform = `translate(-50%, -50%) translateX(${translateX}px) scale(${scale}) rotateY(${rotate}deg)`;
      slide.style.zIndex = String(slides.length - absOffset);
      slide.style.opacity = depthOpacity;
      slide.style.filter = absOffset === 0 ? "none" : "brightness(0.78)";
      slide.style.pointerEvents = absOffset <= 2 ? "auto" : "none";
      slide.classList.toggle("is-active", offset === 0);
      slide.setAttribute("aria-hidden", offset === 0 ? "false" : "true");
      slide.setAttribute("tabindex", offset === 0 ? "-1" : "0");
      slide.setAttribute("aria-pressed", offset === 0 ? "true" : "false");
    });
  }

  function goToSlide(index) {
    if (!slides.length) return;
    currentSlide = (index + slides.length) % slides.length;
    updateSlides();
  }

  prevButton?.addEventListener("click", () => goToSlide(currentSlide - 1));
  nextButton?.addEventListener("click", () => goToSlide(currentSlide + 1));

  slides.forEach((slide, index) => {
    slide.setAttribute("role", "button");
    slide.addEventListener("click", () => {
      if (index !== currentSlide) {
        goToSlide(index);
      }
    });
    slide.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (index !== currentSlide) {
          goToSlide(index);
        }
      }
    });
  });

  window.addEventListener("resize", updateSlides);
  updateSlides();
}

function createSparkle(x, y) {
  const sparkle = document.createElement("span");
  sparkle.className = "sparkle";
  const size = 8 + Math.random() * 10;
  sparkle.style.width = `${size}px`;
  sparkle.style.height = `${size}px`;
  sparkle.style.left = `${x}px`;
  sparkle.style.top = `${y}px`;
  sparkle.style.animationDuration = `${0.5 + Math.random() * 0.25}s`;
  document.body.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 700);
}

function handlePointerTrail() {
  document.addEventListener("pointermove", (event) => {
    const now = performance.now();
    if (now - lastSparkleTime < sparkleCooldown) return;
    const shouldCreate = now - lastSparkleTime > sparkleCooldown * 2 || Math.random() < sparkleChance;
    if (!shouldCreate) return;
    lastSparkleTime = now;
    createSparkle(event.clientX, event.clientY);
  });
}

function setupScrollReveal() {
  const autoRevealSelectors = [
    ".header-bar",
    "#typing",
    ".time-card__header",
    ".time-card__timestamp",
    ".time-grid",
    ".celebration > *",
    ".photo-section__intro > *",
    ".closing-note p"
  ];

  autoRevealSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      if (!element.hasAttribute("data-reveal")) {
        element.setAttribute("data-reveal", "");
      }
    });
  });

  const revealTargets = document.querySelectorAll("[data-reveal]");
  if (!revealTargets.length) return;

  revealTargets.forEach((element, index) => {
    const baseDelay = index * 0.05;
    const randomDelay = Math.random() * 0.18;
    const tilt = (Math.random() - 0.5) * 12;
    const rotate = (Math.random() - 0.5) * 6;
    const translate = 32 + Math.random() * 24;
    element.style.setProperty("--reveal-delay", `${(baseDelay + randomDelay).toFixed(2)}s`);
    element.style.setProperty("--reveal-tilt", `${tilt.toFixed(2)}deg`);
    element.style.setProperty("--reveal-rotate", `${rotate.toFixed(2)}deg`);
    element.style.setProperty("--reveal-translate", `${translate.toFixed(2)}px`);
  });

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReducedMotion.matches) {
    revealTargets.forEach((element) => element.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px"
    }
  );

  revealTargets.forEach((element) => observer.observe(element));
}

function setupAimFollowers() {
  const targetCursor = document.getElementById("targetCursor");
  const pistol = document.querySelector(".gadget.pistol");
  const flashlight = document.querySelector(".gadget.flashlight");

  if (!targetCursor && !pistol && !flashlight) return;

  const updateAim = (element, pointerX, pointerY) => {
    if (!element) return;
    const pivot = element.querySelector(".gadget__pivot");
    const rect = (pivot ?? element).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height * 0.65;
    const angle = Math.atan2(pointerY - centerY, pointerX - centerX);
    element.style.setProperty("--aim-angle", `${angle}rad`);
  };

  const revealCursor = () => {
    document.body.classList.add("is-aiming");
    targetCursor?.classList.remove("is-hidden");
  };

  const handlePointerMove = (event) => {
    const pointerX = event.clientX;
    const pointerY = event.clientY;
    if (Number.isNaN(pointerX) || Number.isNaN(pointerY)) return;

    revealCursor();
    if (targetCursor) {
      targetCursor.style.setProperty("--cursor-x", `${pointerX}px`);
      targetCursor.style.setProperty("--cursor-y", `${pointerY}px`);
    }
    updateAim(pistol, pointerX, pointerY);
    updateAim(flashlight, pointerX, pointerY);
  };

  document.addEventListener("pointermove", handlePointerMove);
  document.addEventListener("pointerleave", () => {
    targetCursor?.classList.add("is-hidden");
    document.body.classList.remove("is-aiming");
  });
  document.addEventListener("pointerenter", () => {
    if (!targetCursor) return;
    revealCursor();
  });

  const initialX = window.innerWidth / 2;
  const initialY = window.innerHeight / 2;
  if (targetCursor) {
    targetCursor.style.setProperty("--cursor-x", `${initialX}px`);
    targetCursor.style.setProperty("--cursor-y", `${initialY}px`);
  }
  updateAim(pistol, initialX, initialY);
  updateAim(flashlight, initialX, initialY);
}

function setupThemeToggle() {
  const toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) return;

  const root = document.documentElement;
  const icon = toggle.querySelector(".theme-toggle__icon");
  const label = toggle.querySelector(".theme-toggle__label");
  const storageKey = "hb-theme";

  function applyTheme(theme) {
    const normalized = theme === "light" ? "light" : "dark";
    root.dataset.theme = normalized;
    localStorage.setItem(storageKey, normalized);
    toggle.setAttribute("aria-pressed", normalized === "light" ? "true" : "false");
    if (icon) icon.textContent = normalized === "light" ? "☀️" : "🌙";
    if (label) label.textContent = normalized === "light" ? "Light" : "Dark";
  }

  const storedTheme = localStorage.getItem(storageKey);
  applyTheme(storedTheme);

  toggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  });
}

function createBurst(x, y, color) {
  const burst = document.createElement("div");
  burst.className = "burst";
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;

  const particles = 8;
  for (let i = 0; i < particles; i += 1) {
    const shard = document.createElement("span");
    const angle = (360 / particles) * i;
    shard.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    shard.style.background = color;
    burst.appendChild(shard);
  }

  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 450);
}

function spawnBalloon() {
  const balloon = document.createElement("div");
  balloon.className = "balloon";

  const hue = Math.floor(Math.random() * 360);
  const size = 70 + Math.random() * 50;
  const duration = 12 + Math.random() * 8;
  const leftPosition = Math.random() * 100;

  balloon.style.width = `${size}px`;
  balloon.style.height = `${size * 1.35}px`;
  balloon.style.left = `calc(${leftPosition}vw)`;
  balloon.style.animationDuration = `${duration}s`;
  balloon.style.background = `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.7), hsla(${hue}, 90%, 65%, 0.95) 55%, hsla(${hue}, 90%, 55%, 0.95) 100%)`;

  document.body.appendChild(balloon);

  const removeTimeout = setTimeout(() => {
    balloon.remove();
  }, (duration + 2) * 1000);

  balloon.addEventListener("click", (event) => {
    event.stopPropagation();
    const rect = balloon.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    createBurst(x, y, `hsla(${hue}, 95%, 70%, 1)`);
    balloon.classList.add("popped");
    clearTimeout(removeTimeout);
    setTimeout(() => balloon.remove(), 320);
  });
}

function startBalloons() {
  const minInterval = 1600;
  const maxInterval = 3200;

  function scheduleNext() {
    const delay = Math.random() * (maxInterval - minInterval) + minInterval;
    setTimeout(() => {
      spawnBalloon();
      scheduleNext();
    }, delay);
  }

  scheduleNext();
}

const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
let confettiPieces = [];
let fireworks = [];

function setupCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createConfetti() {
  confettiPieces = Array.from({ length: 90 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 6 + 4,
    dy: Math.random() * 1.5 + 0.5,
    color: `hsl(${Math.random() * 360}, 90%, 60%)`
  }));
}

function drawConfetti() {
  confettiPieces.forEach((piece) => {
    ctx.beginPath();
    ctx.arc(piece.x, piece.y, piece.r, 0, Math.PI * 2);
    ctx.fillStyle = piece.color;
    ctx.fill();
  });
}

function updateConfetti() {
  confettiPieces.forEach((piece) => {
    piece.y += piece.dy;
    if (piece.y > canvas.height + 10) {
      piece.y = -10;
      piece.x = Math.random() * canvas.width;
    }
  });
}

function createFirework(x, y) {
  const colors = ["#ffcc00", "#ff5f6d", "#43e5f7", "#c084fc"];
  const particles = Array.from({ length: 30 }, () => ({
    x,
    y,
    vx: (Math.random() - 0.5) * 7,
    vy: (Math.random() - 0.5) * 7,
    alpha: 1,
    life: Math.random() * 40 + 30,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));
  fireworks.push(...particles);
}

document.addEventListener("click", (event) => {
  if (event.target.closest("button, .slider-nav, .slides-window, .photo-placeholder")) return;
  if (event.target.classList.contains("balloon")) return;
  createFirework(event.clientX, event.clientY);
});

function updateFireworks() {
  fireworks = fireworks.filter((particle) => particle.alpha > 0);
  fireworks.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.05;
    particle.alpha -= 0.02;
    particle.life -= 1;
    if (particle.life <= 0) particle.alpha = 0;
  });
}

function drawFireworks() {
  fireworks.forEach((particle) => {
    ctx.save();
    ctx.globalAlpha = particle.alpha;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
    ctx.restore();
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateConfetti();
  drawConfetti();
  updateFireworks();
  drawFireworks();
  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  setupCanvas();
  createConfetti();
});

window.addEventListener("DOMContentLoaded", () => {
  typingEffect();
  updateBaseDateDisplay();
  updateElapsedTime();
  setInterval(updateElapsedTime, 1000);
  updateTimezoneClock();
  setInterval(updateTimezoneClock, 1000);
  initSlider();
  handlePointerTrail();
  startBalloons();
  setupThemeToggle();
  setupScrollReveal();
  setupAimFollowers();
  setupCanvas();
  createConfetti();
  animate();
});
