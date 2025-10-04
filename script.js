const INTRO_TEXT = "Setiap misi sudah kamu jalani—malam ini kita rayakan semua kemenanganmu.";
const BIRTH_ISO = "1974-10-04T00:00:00-07:00";
const TIME_ZONE = "America/Los_Angeles";
const NUMBER_FORMAT = new Intl.NumberFormat("en-US");
const ZONE_PARTS_FORMAT = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
const BIRTH_FORMAT = new Intl.DateTimeFormat("id-ID", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});

const birthParts = {
  year: 1974,
  month: 10,
  day: 4,
  hour: 0,
  minute: 0,
  second: 0
};

const birthUTC = new Date(BIRTH_ISO).getTime();

function typeIntro() {
  const target = document.getElementById("typing");
  if (!target) return;
  target.textContent = "";
  let index = 0;

  const step = () => {
    if (index >= INTRO_TEXT.length) return;
    target.textContent += INTRO_TEXT.charAt(index);
    index += 1;
    setTimeout(step, 70);
  };

  step();
}

function getZoneParts(date = new Date()) {
  const formatted = ZONE_PARTS_FORMAT.format(date);
  const [datePart, timePart] = formatted.split(/\s+/);
  if (!timePart) return {};
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);
  return { year, month, day, hour, minute, second };
}

function updateBirthDisplay() {
  const birthTimeElement = document.getElementById("birthTime");
  if (!birthTimeElement) return;
  const formatted = BIRTH_FORMAT.format(new Date(birthUTC));
  birthTimeElement.textContent = formatted;
  birthTimeElement.setAttribute("datetime", BIRTH_ISO);
}

function updateZoneClock() {
  const clock = document.getElementById("zoneClock");
  if (!clock) return;
  const parts = getZoneParts();
  const pad = (value) => String(value).padStart(2, "0");
  clock.textContent = `${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
}

function updateElapsed() {
  const parts = getZoneParts();
  if (!parts.year) return;

  let years = parts.year - birthParts.year;
  let months = parts.month - birthParts.month;
  let days = parts.day - birthParts.day;

  if (days < 0) {
    months -= 1;
    const previousMonthDays = new Date(parts.year, parts.month - 1, 0).getDate();
    days += previousMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const anchor = new Date(
    Date.UTC(
      birthParts.year,
      birthParts.month - 1,
      birthParts.day,
      birthParts.hour,
      birthParts.minute,
      birthParts.second
    )
  );

  anchor.setUTCFullYear(anchor.getUTCFullYear() + years);
  anchor.setUTCMonth(anchor.getUTCMonth() + months);
  anchor.setUTCDate(anchor.getUTCDate() + days);

  const nowComparable = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  let diffMs = Math.max(0, nowComparable - anchor.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  diffMs -= hours * 60 * 60 * 1000;
  const minutes = Math.floor(diffMs / (1000 * 60));
  diffMs -= minutes * 60 * 1000;
  const seconds = Math.floor(diffMs / 1000);

  const values = { years, months, days, hours, minutes, seconds };
  Object.entries(values).forEach(([key, value]) => {
    const element = document.getElementById(key);
    if (element) {
      element.textContent = NUMBER_FORMAT.format(value);
    }
  });
}

function initSlider() {
  const slides = Array.from(document.querySelectorAll(".slide"));
  if (!slides.length) return;

  const prevButton = document.querySelector(".slider-control--prev");
  const nextButton = document.querySelector(".slider-control--next");
  let current = 0;

  const arrange = () => {
    const container = document.querySelector(".slider-window");
    const containerWidth = container ? container.getBoundingClientRect().width : window.innerWidth;
    const baseShift = Math.min(containerWidth / 2.2, 240);

    slides.forEach((slide, index) => {
      let offset = index - current;
      const half = slides.length / 2;
      if (offset > half) offset -= slides.length;
      if (offset < -half) offset += slides.length;
      const abs = Math.abs(offset);
      const translateX = offset * baseShift;
      const rotateY = offset * -8;
      const scale = Math.max(0.65, 1 - abs * 0.18);
      const depthOpacity = abs > 2 ? 0 : Math.max(0.35, 1 - abs * 0.25);

      slide.style.transform = `translate(-50%, -50%) translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`;
      slide.style.zIndex = String(slides.length - abs);
      slide.style.opacity = depthOpacity.toString();
      slide.style.filter = abs === 0 ? "none" : "brightness(0.8)";
      const isActive = offset === 0;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
      slide.setAttribute("tabindex", isActive ? "0" : "-1");
    });
  };

  const goTo = (index) => {
    current = (index + slides.length) % slides.length;
    arrange();
  };

  prevButton?.addEventListener("click", () => goTo(current - 1));
  nextButton?.addEventListener("click", () => goTo(current + 1));

  slides.forEach((slide, index) => {
    slide.setAttribute("role", "button");
    slide.addEventListener("click", () => {
      if (index !== current) {
        goTo(index);
      }
    });
    slide.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (index !== current) {
          goTo(index);
        }
      }
    });
  });

  window.addEventListener("resize", arrange);
  arrange();
}

function createSparkle(x, y) {
  const sparkle = document.createElement("span");
  sparkle.className = "sparkle";
  const size = 8 + Math.random() * 10;
  sparkle.style.width = `${size}px`;
  sparkle.style.height = `${size}px`;
  sparkle.style.left = `${x}px`;
  sparkle.style.top = `${y}px`;
  document.body.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 600);
}

function initSparkles() {
  let lastTime = 0;
  const cooldown = 120;
  const chance = 0.55;

  document.addEventListener("pointermove", (event) => {
    const now = performance.now();
    if (now - lastTime < cooldown) return;
    if (now - lastTime > cooldown * 2 || Math.random() < chance) {
      lastTime = now;
      createSparkle(event.clientX, event.clientY);
    }
  });
}

function initReveal() {
  const candidates = document.querySelectorAll("[data-reveal]");
  if (!candidates.length) return;

  candidates.forEach((element, index) => {
    const delay = index * 0.05 + Math.random() * 0.18;
    element.style.setProperty("--reveal-delay", `${delay.toFixed(2)}s`);
    element.style.setProperty("--reveal-translate", `${(32 + Math.random() * 24).toFixed(2)}px`);
    element.style.setProperty("--reveal-tilt", `${((Math.random() - 0.5) * 12).toFixed(2)}deg`);
    element.style.setProperty("--reveal-rotate", `${((Math.random() - 0.5) * 6).toFixed(2)}deg`);
  });

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReducedMotion.matches) {
    candidates.forEach((element) => element.classList.add("is-revealed"));
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
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
  );

  candidates.forEach((element) => observer.observe(element));
}

function initAimFollowers() {
  const target = document.getElementById("targetCursor");
  const pistol = document.querySelector(".gadget--pistol");
  const flashlight = document.querySelector(".gadget--flashlight");
  if (!target && !pistol && !flashlight) return;

  const toDegrees = 180 / Math.PI;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const toDegrees = 180 / Math.PI;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const updateAim = (element, pointerX, pointerY) => {
    if (!element) return;
    const pivot = element.querySelector(".gadget__pivot");
    const rect = (pivot ?? element).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height * 0.65;
    const angle = Math.atan2(pointerY - centerY, pointerX - centerX);
    element.style.setProperty("--aim-angle", `${angle}rad`);
    const centerY = rect.top + rect.height / 2;

    const dx = pointerX - centerX;
    const dy = pointerY - centerY;
    const viewportWidth = window.innerWidth || rect.width;
    const viewportHeight = window.innerHeight || rect.height;

    const yaw = clamp(Math.atan2(dx, viewportWidth * 0.38) * toDegrees, -55, 55);
    const pitch = clamp(Math.atan2(-dy, viewportHeight * 0.42) * toDegrees, -38, 42);
    const roll = clamp(Math.atan2(dx, viewportWidth * 0.85) * toDegrees * 0.6, -18, 18);

    element.style.setProperty("--aim-yaw", `${yaw.toFixed(2)}deg`);
    element.style.setProperty("--aim-pitch", `${pitch.toFixed(2)}deg`);
    element.style.setProperty("--aim-roll", `${roll.toFixed(2)}deg`);

    if (pivot) {
      const intensity = Math.min(Math.hypot(dx, dy) / Math.hypot(viewportWidth, viewportHeight), 1);
      pivot.style.setProperty("--aim-depth", intensity.toFixed(3));
    }
  };

  const resetAim = () => {
    [pistol, flashlight].forEach((element) => {
      if (!element) return;
      element.style.setProperty("--aim-yaw", "0deg");
      element.style.setProperty("--aim-pitch", "0deg");
      element.style.setProperty("--aim-roll", "0deg");
      const pivot = element.querySelector(".gadget__pivot");
      pivot?.style.setProperty("--aim-depth", "0");
    });
  };

  const revealCursor = () => {
    document.body.classList.add("is-aiming");
    target?.classList.remove("is-hidden");
  };

  const handlePointerMove = (event) => {
    const { clientX, clientY } = event;
    if (Number.isNaN(clientX) || Number.isNaN(clientY)) return;
    revealCursor();
    if (target) {
      target.style.setProperty("--cursor-x", `${clientX}px`);
      target.style.setProperty("--cursor-y", `${clientY}px`);
    }
    updateAim(pistol, clientX, clientY);
    updateAim(flashlight, clientX, clientY);
  };

  document.addEventListener("pointermove", handlePointerMove);
  document.addEventListener("pointerleave", () => {
    document.body.classList.remove("is-aiming");
    resetAim();
  });
  document.addEventListener("pointerenter", () => {
    if (target) revealCursor();
  });

  const initialX = window.innerWidth / 2;
  const initialY = window.innerHeight / 2;
  if (target) {
    target.style.setProperty("--cursor-x", `${initialX}px`);
    target.style.setProperty("--cursor-y", `${initialY}px`);
  }
  updateAim(pistol, initialX, initialY);
  updateAim(flashlight, initialX, initialY);
}

function createBurst(x, y, color) {
  const burst = document.createElement("div");
  burst.className = "burst";
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;

  const particles = 8;
  for (let i = 0; i < particles; i += 1) {
    const shard = document.createElement("span");
    shard.style.transform = `translate(-50%, -50%) rotate(${(360 / particles) * i}deg)`;
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
  const left = Math.random() * 100;

  balloon.style.width = `${size}px`;
  balloon.style.height = `${size * 1.35}px`;
  balloon.style.left = `calc(${left}vw)`;
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

function initBalloons() {
  const minInterval = 1600;
  const maxInterval = 3200;

  const schedule = () => {
    const delay = Math.random() * (maxInterval - minInterval) + minInterval;
    setTimeout(() => {
      spawnBalloon();
      schedule();
    }, delay);
  };

  schedule();
}

function initThemeToggle() {
  const toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) return;
  const root = document.documentElement;
  const icon = toggle.querySelector(".theme-toggle__icon");
  const label = toggle.querySelector(".theme-toggle__label");
  const storageKey = "hb-theme";

  const applyTheme = (theme) => {
    const mode = theme === "light" ? "light" : "dark";
    root.dataset.theme = mode;
    localStorage.setItem(storageKey, mode);
    toggle.setAttribute("aria-pressed", mode === "light" ? "true" : "false");
    if (icon) icon.textContent = mode === "light" ? "☀️" : "🌙";
    if (label) label.textContent = mode === "light" ? "Light" : "Dark";
  };

  applyTheme(localStorage.getItem(storageKey) || root.dataset.theme);

  toggle.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
  });
}

function initFireworks(canvas, ctx, confettiPieces, fireworks) {
  function createConfetti() {
    confettiPieces.length = 0;
    for (let i = 0; i < 90; i += 1) {
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 6 + 4,
        dy: Math.random() * 1.5 + 0.5,
        color: `hsl(${Math.random() * 360}, 90%, 60%)`
      });
    }
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
      if (piece.y > canvas.height + 12) {
        piece.y = -10;
        piece.x = Math.random() * canvas.width;
      }
    });
  }

  function createFirework(x, y) {
    const colors = ["#ffc857", "#ff5f6d", "#43e5f7", "#c084fc"];
    for (let i = 0; i < 30; i += 1) {
      fireworks.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 7,
        vy: (Math.random() - 0.5) * 7,
        alpha: 1,
        life: Math.random() * 40 + 30,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  function updateFireworks() {
    fireworks.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.05;
      particle.alpha -= 0.02;
      particle.life -= 1;
      if (particle.life <= 0) particle.alpha = 0;
    });
    for (let i = fireworks.length - 1; i >= 0; i -= 1) {
      if (fireworks[i].alpha <= 0) {
        fireworks.splice(i, 1);
      }
    }
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

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createConfetti();
  };

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateConfetti();
    drawConfetti();
    updateFireworks();
    drawFireworks();
    requestAnimationFrame(render);
  };

  resizeCanvas();
  render();

  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("click", (event) => {
    if (event.target.closest("button, .slider-control, .slides, .slide, .note__paper")) return;
    if (event.target.classList.contains("balloon")) return;
    createFirework(event.clientX, event.clientY);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  typeIntro();
  updateBirthDisplay();
  updateZoneClock();
  updateElapsed();
  setInterval(updateZoneClock, 1000);
  setInterval(updateElapsed, 1000);
  initSlider();
  initSparkles();
  initReveal();
  initAimFollowers();
  initThemeToggle();
  initBalloons();

  const canvas = document.getElementById("confetti");
  const ctx = canvas?.getContext("2d");
  if (canvas && ctx) {
    const confettiPieces = [];
    const fireworks = [];
    initFireworks(canvas, ctx, confettiPieces, fireworks);
  }
});
