// =========================
//  CONFIG & CONSTANTS
// =========================
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

const birthParts = { year: 1974, month: 10, day: 4, hour: 0, minute: 0, second: 0 };
const birthUTC = new Date(BIRTH_ISO).getTime();


// =========================
//  INTRO TYPING ANIMATION
// =========================
function typeIntro() {
  const target = document.getElementById("typing");
  if (!target) return;
  target.textContent = "";
  let index = 0;

  const step = () => {
    if (index >= INTRO_TEXT.length) return;
    target.textContent += INTRO_TEXT.charAt(index);
    index++;
    setTimeout(step, 70);
  };

  step();
}


// =========================
//  TIME & DATE FUNCTIONS
// =========================
function getZoneParts(date = new Date()) {
  const formatted = ZONE_PARTS_FORMAT.format(date);
  const [datePart, timePart] = formatted.split(/\s+/);
  if (!timePart) return {};
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);
  return { year, month, day, hour, minute, second };
}

function updateBirthDisplay() {
  const el = document.getElementById("birthTime");
  if (!el) return;
  const formatted = BIRTH_FORMAT.format(new Date(BIRTH_ISO));
  el.textContent = formatted;
  el.setAttribute("datetime", BIRTH_ISO);
}

function updateZoneClock() {
  const clock = document.getElementById("zoneClock");
  if (!clock) return;
  const parts = getZoneParts();
  const pad = (v) => String(v).padStart(2, "0");
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
    const prevDays = new Date(parts.year, parts.month - 1, 0).getDate();
    days += prevDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const anchor = new Date(Date.UTC(birthParts.year, birthParts.month - 1, birthParts.day));
  anchor.setUTCFullYear(anchor.getUTCFullYear() + years);
  anchor.setUTCMonth(anchor.getUTCMonth() + months);
  anchor.setUTCDate(anchor.getUTCDate() + days);

  const now = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  let diff = Math.max(0, now - anchor.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * 60 * 60 * 1000;
  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * 60 * 1000;
  const seconds = Math.floor(diff / 1000);

  const values = { years, months, days, hours, minutes, seconds };
  Object.entries(values).forEach(([key, val]) => {
    const el = document.getElementById(key);
    if (el) el.textContent = NUMBER_FORMAT.format(val);
  });
}


// =========================
//  SLIDER / GALLERY
// =========================
function initSlider() {
  const slides = Array.from(document.querySelectorAll(".slide"));
  if (!slides.length) return;

  const prevButton = document.querySelector(".slider-control--prev");
  const nextButton = document.querySelector(".slider-control--next");
  let current = 0;

  const arrange = () => {
    const container = document.querySelector(".slides-window");
    const containerWidth = container ? container.getBoundingClientRect().width : window.innerWidth;
    const baseShift = Math.min(containerWidth / 2.2, 240);

    slides.forEach((slide, index) => {
      let offset = index - current;
      const half = Math.floor(slides.length / 2);
      if (offset > half) offset -= slides.length;
      if (offset < -half) offset += slides.length;

      const abs = Math.abs(offset);
      const translateX = offset * baseShift;
      const rotateY = offset * -8;
      const scale = Math.max(0.65, 1 - abs * 0.18);
      const depthOpacity = abs > 2 ? 0 : Math.max(0.35, 1 - abs * 0.25);

      slide.style.transform = `translate(-50%, -50%) translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`;
      slide.style.zIndex = slides.length - abs;
      slide.style.opacity = depthOpacity;
      slide.classList.toggle("is-active", offset === 0);
    });
  };

  const goTo = (index) => {
    current = (index + slides.length) % slides.length;
    arrange();
  };

  prevButton?.addEventListener("click", () => goTo(current - 1));
  nextButton?.addEventListener("click", () => goTo(current + 1));

  window.addEventListener("resize", arrange);
  arrange();
}


// =========================
//  SPARKLE EFFECT
// =========================
function createSparkle(x, y) {
  const s = document.createElement("span");
  s.className = "sparkle";
  const size = 8 + Math.random() * 10;
  Object.assign(s.style, {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}px`,
    top: `${y}px`
  });
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 600);
}

function initSparkles() {
  let last = 0;
  document.addEventListener("pointermove", (e) => {
    const now = performance.now();
    if (now - last < 120) return;
    if (Math.random() < 0.6) createSparkle(e.clientX, e.clientY);
    last = now;
  });
}


// =========================
//  REVEAL ON SCROLL
// =========================
function initReveal() {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;

  els.forEach((el, i) => {
    const d = i * 0.05 + Math.random() * 0.18;
    el.style.setProperty("--reveal-delay", `${d.toFixed(2)}s`);
    el.style.setProperty("--reveal-translate", `${(32 + Math.random() * 24).toFixed(2)}px`);
  });

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  els.forEach((el) => io.observe(el));
}


// =========================
//  AIM FOLLOWERS (3D GADGETS + CROSSHAIR)
// =========================
function initAimFollowers() {
  const target = document.getElementById("targetCursor");
  const pistol = document.querySelector(".gadget--pistol");
  const flashlight = document.querySelector(".gadget--flashlight");
  if (!target && !pistol && !flashlight) return;

  const toDeg = 180 / Math.PI;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  const updateAim = (el, x, y) => {
    if (!el) return;
    const pivot = el.querySelector(".gadget__pivot");
    const rect = (pivot ?? el).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const vw = window.innerWidth, vh = window.innerHeight;
    const yaw = clamp(Math.atan2(dx, vw * 0.38) * toDeg, -55, 55);
    const pitch = clamp(Math.atan2(-dy, vh * 0.42) * toDeg, -38, 42);
    const roll = clamp(Math.atan2(dx, vw * 0.85) * toDeg * 0.6, -18, 18);
    el.style.setProperty("--aim-yaw", `${yaw}deg`);
    el.style.setProperty("--aim-pitch", `${pitch}deg`);
    el.style.setProperty("--aim-roll", `${roll}deg`);
  };

  document.addEventListener("pointermove", (e) => {
    target?.style.setProperty("--cursor-x", `${e.clientX}px`);
    target?.style.setProperty("--cursor-y", `${e.clientY}px`);
    updateAim(pistol, e.clientX, e.clientY);
    updateAim(flashlight, e.clientX, e.clientY);
    document.body.classList.add("is-aiming");
  });

  document.addEventListener("pointerleave", () => document.body.classList.remove("is-aiming"));
}


// =========================
//  BALLOONS + BURST
// =========================
function createBurst(x, y, color) {
  const b = document.createElement("div");
  b.className = "burst";
  b.style.left = `${x}px`;
  b.style.top = `${y}px`;
  for (let i = 0; i < 8; i++) {
    const shard = document.createElement("span");
    shard.style.transform = `translate(-50%, -50%) rotate(${(360 / 8) * i}deg)`;
    shard.style.background = color;
    b.appendChild(shard);
  }
  document.body.appendChild(b);
  setTimeout(() => b.remove(), 450);
}

function spawnBalloon() {
  const el = document.createElement("div");
  el.className = "balloon";
  const hue = Math.floor(Math.random() * 360);
  const size = 70 + Math.random() * 50;
  el.style.width = `${size}px`;
  el.style.height = `${size * 1.35}px`;
  el.style.left = `${Math.random() * 100}vw`;
  el.style.animationDuration = `${12 + Math.random() * 8}s`;
  el.style.background = `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.7), hsla(${hue}, 90%, 65%, 0.95) 55%, hsla(${hue}, 90%, 55%, 0.95))`;
  document.body.appendChild(el);
  const remove = setTimeout(() => el.remove(), 16000);
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    const rect = el.getBoundingClientRect();
    createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, `hsla(${hue},95%,70%,1)`);
    el.classList.add("popped");
    clearTimeout(remove);
    setTimeout(() => el.remove(), 300);
  });
}

function initBalloons() {
  const loop = () => {
    spawnBalloon();
    setTimeout(loop, 1500 + Math.random() * 1800);
  };
  loop();
}


// =========================
//  THEME TOGGLE
// =========================
function initThemeToggle() {
  const btn = document.querySelector("[data-theme-toggle]");
  if (!btn) return;
  const root = document.documentElement;
  const icon = btn.querySelector(".theme-toggle__icon");
  const label = btn.querySelector(".theme-toggle__label");
  const key = "hb-theme";
  const apply = (t) => {
    const mode = t === "light" ? "light" : "dark";
    root.dataset.theme = mode;
    localStorage.setItem(key, mode);
    if (icon) icon.textContent = mode === "light" ? "☀️" : "🌙";
    if (label) label.textContent = mode === "light" ? "Light" : "Dark";
  };
  apply(localStorage.getItem(key) || "dark");
  btn.addEventListener("click", () => apply(root.dataset.theme === "dark" ? "light" : "dark"));
}


// =========================
//  FIREWORKS + CONFETTI
// =========================
function initFireworks(canvas, ctx, confetti, fireworks) {
  function makeConfetti() {
    confetti.length = 0;
    for (let i = 0; i < 80; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 5 + 3,
        dy: Math.random() * 1.5 + 0.5,
        color: `hsl(${Math.random() * 360},90%,60%)`
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.y += p.dy;
      if (p.y > canvas.height + 12) p.y = -10;
    });

    fireworks.forEach((f, i) => {
      f.x += f.vx;
      f.y += f.vy;
      f.vy += 0.05;
      f.alpha -= 0.02;
      ctx.globalAlpha = f.alpha;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = f.color;
      ctx.fill();
      if (f.alpha <= 0) fireworks.splice(i, 1);
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  canvas.width = innerWidth;
  canvas.height = innerHeight;
  makeConfetti();

  window.addEventListener("resize", () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    makeConfetti();
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("button,.slide,.slider-control,.paper-note__sheet,.balloon")) return;
    for (let i = 0; i < 30; i++)
      fireworks.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        alpha: 1,
        color: ["#ffc857", "#ff5f6d", "#43e5f7", "#c084fc"][Math.floor(Math.random() * 4)]
      });
  });

  draw();
}


// =========================
//  INIT ALL ON LOAD
// =========================
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
  if (canvas && ctx) initFireworks(canvas, ctx, [], []);
});
