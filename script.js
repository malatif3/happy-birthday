const INTRO_TEXT = "Setiap misi sudah kamu jalani—malam ini kita rayakan semua kemenanganmu.";
const BIRTH_ISO = "1974-10-04T00:00:00-07:00";
const TIME_ZONE = "America/Los_Angeles";
const NUMBER_FORMAT = new Intl.NumberFormat("en-US");
const ZONE_PARTS_FORMAT = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TIME_ZONE,
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit",
  hour12: false
});
const BIRTH_FORMAT = new Intl.DateTimeFormat("id-ID", {
  timeZone: TIME_ZONE,
  year: "numeric", month: "long", day: "numeric",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
});

const birthParts = { year: 1974, month: 10, day: 4 };

function typeIntro() {
  const t = document.getElementById("typing");
  if (!t) return;
  let i = 0;
  const loop = () => {
    if (i < INTRO_TEXT.length) {
      t.textContent += INTRO_TEXT.charAt(i);
      i++;
      setTimeout(loop, 70);
    }
  };
  loop();
}

function getZoneParts(d = new Date()) {
  const f = ZONE_PARTS_FORMAT.format(d);
  const [dp, tp] = f.split(" ");
  const [y, m, da] = dp.split("-").map(Number);
  const [h, mi, s] = tp.split(":").map(Number);
  return { year: y, month: m, day: da, hour: h, minute: mi, second: s };
}

function updateZoneClock() {
  const el = document.getElementById("zoneClock");
  if (!el) return;
  const p = getZoneParts();
  el.textContent = `${String(p.hour).padStart(2,"0")}:${String(p.minute).padStart(2,"0")}:${String(p.second).padStart(2,"0")}`;
}

function updateElapsed() {
  const p = getZoneParts();
  let y = p.year - birthParts.year;
  let m = p.month - birthParts.month;
  let d = p.day - birthParts.day;
  if (d < 0) { m--; d += new Date(p.year, p.month - 1, 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  const vals = { years: y, months: m, days: d, hours: p.hour, minutes: p.minute, seconds: p.second };
  for (const [k,v] of Object.entries(vals)) {
    const e = document.getElementById(k);
    if (e) e.textContent = NUMBER_FORMAT.format(v);
  }
}

/* Slider */
function initSlider() {
  const slides = [...document.querySelectorAll(".slide")];
  if (!slides.length) return;
  let current = 0;
  const prev = document.querySelector(".slider-control--prev");
  const next = document.querySelector(".slider-control--next");

  function arrange() {
    const c = document.querySelector(".slides-window");
    const w = c ? c.getBoundingClientRect().width : innerWidth;
    const shift = Math.min(w / 2.2, 240);
    slides.forEach((s, i) => {
      let off = i - current;
      const half = Math.floor(slides.length / 2);
      if (off > half) off -= slides.length;
      if (off < -half) off += slides.length;
      const abs = Math.abs(off);
      s.style.transform = `translate(-50%, -50%) translateX(${off * shift}px) scale(${Math.max(0.65, 1 - abs*0.18)})`;
      s.style.opacity = abs > 2 ? 0 : 1 - abs * 0.3;
      s.classList.toggle("is-active", off === 0);
    });
  }
  prev.onclick = () => (current = (current - 1 + slides.length) % slides.length, arrange());
  next.onclick = () => (current = (current + 1) % slides.length, arrange());
  arrange();
  addEventListener("resize", arrange);
}

/* Sparkles */
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
    if (now - last < 100) return;
    if (Math.random() < 0.6) createSparkle(e.clientX, e.clientY);
    last = now;
  });
}

/* Reveal animation */
function initReveal() {
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;

  els.forEach((el, i) => {
    const delay = i * 0.05 + Math.random() * 0.18;
    el.style.setProperty("--reveal-delay", `${delay.toFixed(2)}s`);
    el.style.setProperty("--reveal-translate", `${(24 + Math.random() * 16).toFixed(2)}px`);
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  els.forEach((el) => observer.observe(el));
}

/* Aim / Crosshair followers */
function initAimFollowers() {
  const target = document.getElementById("targetCursor");
  const pistol = document.querySelector(".gadget--pistol");
  const flashlight = document.querySelector(".gadget--flashlight");
  if (!target && !pistol && !flashlight) return;

  const toDeg = 180 / Math.PI;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  function updateAim(el, x, y) {
    if (!el) return;
    const pivot = el.querySelector(".gadget__pivot");
    const rect = (pivot ?? el).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const vw = innerWidth;
    const vh = innerHeight;
    const yaw = clamp(Math.atan2(dx, vw * 0.38) * toDeg, -55, 55);
    const pitch = clamp(Math.atan2(-dy, vh * 0.42) * toDeg, -38, 42);
    const roll = clamp(Math.atan2(dx, vw * 0.85) * toDeg * 0.6, -18, 18);
    el.style.setProperty("--aim-yaw", `${yaw}deg`);
    el.style.setProperty("--aim-pitch", `${pitch}deg`);
    el.style.setProperty("--aim-roll", `${roll}deg`);
  }

  document.addEventListener("pointermove", (e) => {
    target?.style.setProperty("--cursor-x", `${e.clientX}px`);
    target?.style.setProperty("--cursor-y", `${e.clientY}px`);
    updateAim(pistol, e.clientX, e.clientY);
    updateAim(flashlight, e.clientX, e.clientY);
    document.body.classList.add("is-aiming");
  });

  document.addEventListener("pointerleave", () => {
    document.body.classList.remove("is-aiming");
  });
}

/* Balloons */
function createBurst(x, y, color) {
  const burst = document.createElement("div");
  burst.className = "burst";
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;
  for (let i = 0; i < 8; i++) {
    const shard = document.createElement("span");
    shard.style.transform = `translate(-50%, -50%) rotate(${(360 / 8) * i}deg)`;
    shard.style.background = color;
    burst.appendChild(shard);
  }
  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 450);
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
  el.style.background = `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.7),
    hsla(${hue}, 90%, 65%, 0.95) 55%, hsla(${hue}, 90%, 55%, 0.95))`;
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
    if (document.querySelectorAll(".balloon").length < 8) spawnBalloon();
    setTimeout(loop, 1500 + Math.random() * 2000);
  };
  loop();
}

/* Theme toggle */
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
  btn.addEventListener("click", () =>
    apply(root.dataset.theme === "dark" ? "light" : "dark")
  );
}

/* Fireworks / Confetti */
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

  addEventListener("resize", () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    makeConfetti();
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("button,.slide,.slider-control,.paper-note__sheet,.balloon")) return;
    for (let i = 0; i < 30; i++) {
      fireworks.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        alpha: 1,
        color: ["#ffc857", "#ff5f6d", "#43e5f7", "#c084fc"][Math.floor(Math.random() * 4)]
      });
    }
  });

  draw();
}

/* === INIT === */
window.addEventListener("DOMContentLoaded", () => {
  typeIntro();
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
