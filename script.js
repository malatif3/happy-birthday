// =========================
//  CONFIG & CONSTANTS
// =========================
const INTRO_TEXT = "Tonight isn’t about solving a case, it’s about celebrating the one who solved them all.";
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
//  SOUND EFFECTS
// =========================
const balloonPop = new Audio("music/balloon-burst.mp3");
const confettiPop = new Audio("music/shine.mp3");
const keyboardSound = new Audio("music/keyboard-click.mp3");
const reloadSound = new Audio("music/caulking-gun-back.mp3");
const tapSound = new Audio("music/tap.mp3");

balloonPop.volume = 0.5;
confettiPop.volume = 0.5;
keyboardSound.volume = 0.5;
reloadSound.volume = 0.5;
tapSound.volume = 0.5;

// =========================
//  INTRO TYPING ANIMATION
// =========================
function typeIntro() {
  const target = document.getElementById("typing");
  if (!target) return;
  target.textContent = "";
  
  let index = 0;
  let deleting = false;

  const speed = 70;         // kecepatan mengetik
  const pauseBeforeDelete = 2000; // jeda sebelum menghapus (ms)
  const pauseBeforeType = 600;    // jeda sebelum mengetik lagi (ms)

  function step() {
    if (!deleting) {
      // nambah huruf
      target.textContent = INTRO_TEXT.slice(0, index + 1);
      index++;
      if (index === INTRO_TEXT.length) {
        deleting = true;
        setTimeout(step, pauseBeforeDelete);
        return;
      }
    } else {
      // hapus huruf
      target.textContent = INTRO_TEXT.slice(0, index - 1);
      index--;
      if (index === 0) {
        deleting = false;
        setTimeout(step, pauseBeforeType);
        return;
      }
    }
    setTimeout(step, speed);
  }

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
// =========================
//  SLIDER / GALLERY (Clickable Side Slides)
// =========================
function initSlider() {
  const slides = Array.from(document.querySelectorAll(".slide"));
  if (!slides.length) return;

  const prevButton = document.querySelector(".slider-control--prev");
  const nextButton = document.querySelector(".slider-control--next");
  let current = 0;

  // --- Atur posisi slide
  const arrange = () => {
    slides.forEach((slide, index) => {
      slide.classList.remove("is-active", "is-next", "is-prev");

      if (index === current) slide.classList.add("is-active");
      else if (index === (current + 1) % slides.length) slide.classList.add("is-next");
      else if (index === (current - 1 + slides.length) % slides.length) slide.classList.add("is-prev");
    });
  };

  // --- Fungsi ganti slide
  const goTo = (index) => {
    keyboardSound.currentTime = 0;
    keyboardSound.play();
    current = (index + slides.length) % slides.length;
    arrange();
  };

  // --- Tombol panah
  prevButton?.addEventListener("click", () => goTo(current - 1));
  nextButton?.addEventListener("click", () => goTo(current + 1));

  // --- Klik foto samping kanan/kiri
  slides.forEach((slide) => {
    // biar bisa diklik walau klik di dalam img atau figcaption
    slide.addEventListener("click", (e) => {

      const target = e.currentTarget;
      if (target.classList.contains("is-next")) goTo(current + 1);
      else if (target.classList.contains("is-prev")) goTo(current - 1);
    });

    // hilangkan pointer-events: none di CSS
    slide.style.pointerEvents = "auto";
  });

  arrange();
}

// =========================
//  SPARKLE EFFECT
// =========================
function createSparkle(x, y) {
  const s = document.createElement("span");
  s.className = "sparkle";
  const size = 6 + Math.random() * 8;
  const hue = Math.floor(Math.random() * 360);
  Object.assign(s.style, {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}px`,
    top: `${y}px`,
    background: `radial-gradient(circle, hsla(${hue}, 100%, 70%, 1) 0%, transparent 70%)`
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
//  DNA RAIN EFFECT
// =========================
function spawnDNA() {
  const dna = document.createElement("img");
  dna.src = "pictures/dna.png";
  dna.className = "dna";

  const size = 40 + Math.random() * 40;
  dna.style.width = `${size}px`;
  dna.style.left = `${Math.random() * 100}vw`;
  dna.style.animationDuration = `${8 + Math.random() * 6}s`;

  // bikin warna pelangi lewat shadow
  const hue = Math.floor(Math.random() * 360);
  dna.style.filter = `drop-shadow(0 0 8px hsl(${hue}, 100%, 60%)) brightness(2)`;

  document.body.appendChild(dna);
  setTimeout(() => dna.remove(), 15000);
}

function initDNARain() {
  const loop = () => {
    spawnDNA();
    setTimeout(loop, 1000 + Math.random() * 3000); // kecepatan spawn
  };
  loop();
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
  const flashlightEl = document.querySelector(".flashlight"); // 🔥 Tambahan baru
  const pistolWrapper = document.querySelector(".gadget--pistol");
  const flashlightWrapper = document.querySelector(".gadget--flashlight");
  const pistol = pistolWrapper?.querySelector("model-viewer");
  const flashlight = flashlightWrapper?.querySelector("model-viewer");

  if (!target || !pistol || !flashlight) return;

  const toDeg = 180 / Math.PI;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  function updateAim(model, x, y) {
    if (!model) return;
    const rect = model.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Selisih posisi kursor dari tengah objek
    const dx = x - cx;
    const dy = y - cy;

    // Hitung rotasi kiri/kanan dan atas/bawah
    const yaw = Math.atan2(dx, 300) * toDeg;      // horizontal
    const pitch = Math.atan2(-dy, 300) * toDeg;   // vertikal

    const yawClamped = clamp(yaw, -60, 60);
    const pitchClamped = clamp(pitch, -30, 30);

    // Set orientasi: "pitch yaw roll"
    model.orientation = `0deg ${pitchClamped.toFixed(2)}deg ${-yawClamped.toFixed(2)}deg`;
  }

    document.addEventListener("pointermove", (e) => {
    const x = e.clientX;
    const y = e.clientY;

    // update crosshair
    target.style.setProperty("--cursor-x", `${x}px`);
    target.style.setProperty("--cursor-y", `${y}px`);

    // update flashlight posisi
    flashlightEl?.style.setProperty("--cursor-x", `${x}px`);
    flashlightEl?.style.setProperty("--cursor-y", `${y}px`);

    // rotasi model
    updateAim(pistol, x, y);
    updateAim(flashlight, x, y);
  });

  document.addEventListener("pointerenter", () => {
    document.body.classList.add("is-aiming");
  });
  document.addEventListener("pointerleave", () => {
    document.body.classList.remove("is-aiming");
  });
}

// =========================
//  BALLOONS + BURST
// =========================
function createBurst(x, y, color) {
  // burst dasar (shard pecahan)
  const b = document.createElement("div");
  b.className = "burst";
  b.style.left = `${x}px`;
  b.style.top = `${y}px`;

  for (let i = 0; i < 10; i++) {
    const shard = document.createElement("span");
    shard.style.transform = `translate(-50%, -50%) rotate(${(360 / 10) * i}deg)`;
    shard.style.background = color;
    b.appendChild(shard);
  }
  document.body.appendChild(b);
  setTimeout(() => b.remove(), 500);

  // ✨ sparkle tambahan
  for (let i = 0; i < 8; i++) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 40;
    sparkle.style.left = `${x + Math.cos(angle) * radius}px`;
    sparkle.style.top = `${y + Math.sin(angle) * radius}px`;
    sparkle.style.width = `${6 + Math.random() * 6}px`;
    sparkle.style.height = sparkle.style.width;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 700 + Math.random() * 300);
  }
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
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  balloonPop.currentTime = 0; // reset agar bisa main berulang
  balloonPop.play();

  // 💥 Ledakan pecahan balon
  createBurst(cx, cy, `hsla(${hue},95%,70%,1)`);

  // ✨ Tambahkan 10–15 sparkle acak di sekitar titik
  for (let i = 0; i < 12; i++) {
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 100;
    createSparkle(cx + offsetX, cy + offsetY);
  }

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

    keyboardSound.currentTime = 0;
    keyboardSound.play();

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
//  BACKGROUND MUSIC SYSTEM
// =========================
function initMusicPlayer() {
  const playlist = [
    "music/happy-birthday.mp3",
    "music/happy-birthday-rock.mp3",
    "music/happy-birthday-funk.mp3",
    "music/happy-birthday-jazz.mp3"
  ];

  let currentTrack = 0;
  backgroundAudio = new Audio(playlist[currentTrack]);
  backgroundAudio.loop = false;
  backgroundAudio.volume = 0.4;

  const toggleBtn = document.getElementById("musicToggle");
  const nextBtn = document.getElementById("nextTrack");

  // ✅ Start music only after first click anywhere
  const startMusic = () => {
    backgroundAudio.play().catch((err) => {
      console.warn("Autoplay blocked:", err.message);
    });
    document.removeEventListener("click", startMusic);
  };
  document.addEventListener("click", startMusic);

  function playNext() {
    currentTrack = (currentTrack + 1) % playlist.length;
    backgroundAudio.src = playlist[currentTrack];
    backgroundAudio.play().catch(() => {});
  }

  toggleBtn.addEventListener("click", () => {
    backgroundAudio.muted = !backgroundAudio.muted;
    toggleBtn.textContent = backgroundAudio.muted ? "🔇" : "🎵";
    keyboardSound.currentTime = 0;
    keyboardSound.play();
  });

  nextBtn.addEventListener("click", () => {
    keyboardSound.currentTime = 0;
    keyboardSound.play();
    playNext();
  });

  backgroundAudio.addEventListener("ended", playNext);
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
      
      confettiPop.currentTime = 0;
      confettiPop.play();
  });

  draw();
}

// =========================
//  AUTO RELOAD SOUND EFFECT
// =========================
// =========================
//  AUTO RELOAD SOUND EFFECT
// =========================
let backgroundAudio; // referensi global dari musik utama

function initAutoReload() {
  function playReload() {
    reloadSound.currentTime = 0;
    reloadSound.play();
  }

  const loop = () => {
    const delay = 5000 + Math.random() * 10000; // 5–15 detik random
    setTimeout(() => {
      // hanya mainkan jika musik tidak di-mute
      if (backgroundAudio && !backgroundAudio.muted) {
        playReload();
      }
      loop(); // ulangi terus
    }, delay);
  };

  loop();
}


// =========================
//  LOGO APPEAR EFFECT
// =========================
function showLogo(x, y, src = "pictures/fingerprint.png") {
  const img = document.createElement("img");
  img.src = src;
  img.alt = "special logo";
  img.className = "floating-logo";

  // Posisi muncul di lokasi klik
  img.style.left = `${x}px`;
  img.style.top = `${y}px`;

  document.body.appendChild(img);

  // Hapus otomatis setelah 2 detik
  setTimeout(() => img.remove(), 2000);
}

function initLogoTrigger() {
  const mainPhoto = document.querySelector(".slide.is-active img");
  const paperNote = document.querySelector(".paper-note__sheet");

  // klik di foto aktif (utama)
  document.querySelector(".photo-slider")?.addEventListener("click", (e) => {
    tapSound.currentTime = 0;
    tapSound.play();

    const activeSlide = document.querySelector(".slide.is-active img");
    if (activeSlide && e.target === activeSlide) {
      showLogo(e.clientX, e.clientY);
    }
  });

  // klik di kertas note
  paperNote?.addEventListener("click", (e) => {
    tapSound.currentTime = 0;
    tapSound.play();
    showLogo(e.clientX, e.clientY);
  });
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
  initDNARain();
  initReveal();
  initAimFollowers();
  initThemeToggle();
  initMusicPlayer();
  initBalloons();
  initAutoReload();
  initLogoTrigger();

  const canvas = document.getElementById("confetti");
  const ctx = canvas?.getContext("2d");
  if (canvas && ctx) initFireworks(canvas, ctx, [], []);
});