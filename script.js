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

function typeIntro() {
  const target = document.getElementById("typing");
  if (!target) return;
  target.textContent = "";
  let i = 0;
  const step = () => {
    if (i >= INTRO_TEXT.length) return;
    target.textContent += INTRO_TEXT.charAt(i);
    i++;
    setTimeout(step, 70);
  };
  step();
}

function getZoneParts(date = new Date()) {
  const formatted = ZONE_PARTS_FORMAT.format(date);
  const [datePart, timePart] = formatted.split(/\s+/);
  if (!timePart) return {};
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, min, s] = timePart.split(":").map(Number);
  return { year: y, month: m, day: d, hour: h, minute: min, second: s };
}

function updateBirthDisplay() {
  const el = document.getElementById("birthTime");
  if (!el) return;
  el.textContent = BIRTH_FORMAT.format(new Date(BIRTH_ISO));
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
  const p = getZoneParts();
  if (!p.year) return;

  let years = p.year - birthParts.year;
  let months = p.month - birthParts.month;
  let days = p.day - birthParts.day;

  if (days < 0) {
    months--;
    const prevDays = new Date(p.year, p.month - 1, 0).getDate();
    days += prevDays;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const anchor = new Date(Date.UTC(birthParts.year, birthParts.month - 1, birthParts.day));
  anchor.setUTCFullYear(anchor.getUTCFullYear() + years);
  anchor.setUTCMonth(anchor.getUTCMonth() + months);
  anchor.setUTCDate(anchor.getUTCDate() + days);

  const now = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  let diff = Math.max(0, now - anchor.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * 60 * 60 * 1000;
  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * 60 * 1000;
  const seconds = Math.floor(diff / 1000);

  const values = { years, months, days, hours, minutes, seconds };
  for (const [key, val] of Object.entries(values)) {
    const el = document.getElementById(key);
    if (el) el.textContent = NUMBER_FORMAT.format(val);
  }
}

function initSlider() {
  const slides = [...document.querySelectorAll(".slide")];
  if (!slides.length) return;

  const prevButton =
    document.querySelector(".slider-control--prev") || document.querySelector(".slider-nav.prev");
  const nextButton =
    document.querySelector(".slider-control--next") || document.querySelector(".slider-nav.next");

  let current = 0;
  const arrange = () => {
    const container = document.querySelector(".slides-window");
    const containerWidth = container ? container.getBoundingClientRect().width : window.innerWidth;
    const baseShift = Math.min(containerWidth / 2.2, 240);

    slides.forEach((slide, i) => {
      let offset = i - current;
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

function createSparkle(x, y) {
  const s = document.createElement("span");
  s.className = "sparkle";
  const size = 8 + Math.random() * 10;
  Object.assign(s.style, { width: `${size}px`, height: `${size}px`, left: `${x}px`, top: `${y}px` });
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 600);
}
function initSparkles() {
  let sparkleRaf;
  document.addEventListener("pointermove", (e) => {
    cancelAnimationFrame(sparkleRaf);
    sparkleRaf = requestAnimationFrame(() => {
      if (Math.random() < 0.5) createSparkle(e.clientX, e.clientY);
    });
  });
}

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

  document.addEventListener("pointerenter", () => document.body.classList.add("is-aiming"));
  document.addEventListener("pointerleave", () => document.body.classList.remove("is-aiming"));
}

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
  initBalloons();
  initThemeToggle();
  const canvas = document.getElementById("confetti");
  const ctx = canvas?.getContext("2d");
  if (canvas && ctx) initFireworks(canvas, ctx, [], []);
});
