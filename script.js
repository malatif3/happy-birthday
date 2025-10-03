// ✨ Efek typing bertema balistik
const text = "Klik sekali untuk memulai misi ulang tahun 🎯";
let typingIndex = 0;
let typingStarted = false;

function typingEffect() {
  if (typingStarted) return;
  typingStarted = true;

  const typingContainer = document.getElementById("typing");
  function typeNext() {
    if (typingIndex < text.length) {
      typingContainer.innerHTML += text.charAt(typingIndex);
      typingIndex++;
      setTimeout(typeNext, 70);
    } else {
      document.getElementById("quiz").style.display = "block";
    }
  }

  typeNext();
}

document.body.addEventListener("click", typingEffect, { once: true });

// 🕵️ Quiz sederhana
function checkAnswer() {
  const ans = document.getElementById("answer").value.toLowerCase();
  if (ans.includes("kue") || ans.includes("cake")) {
    const quiz = document.getElementById("quiz");
    quiz.style.display = "none";
    const celebration = document.getElementById("celebration");
    celebration.style.display = "flex";
    const secretMessage = document.getElementById("secretMessage");
    secretMessage.style.display = "block";
    triggerLaunchSequence();
    setTimeout(updateSlidePosition, 20);
  } else {
    alert("Hehe coba lagi, pikirkan ulang 🎂");
  }
}

// 🚀 Peluncuran roket perayaan
function triggerLaunchSequence() {
  for (let i = 0; i < 16; i++) {
    const rocket = document.createElement("div");
    rocket.classList.add("balloon");
    rocket.textContent = "🚀";
    rocket.style.left = Math.random() * 100 + "vw";
    rocket.style.animationDuration = 4 + Math.random() * 3 + "s";
    document.body.appendChild(rocket);
    setTimeout(() => rocket.remove(), 7000);
  }
}

// 🎞️ Slider foto
const slidesWindow = document.querySelector(".slides-window");
const slidesContainer = document.querySelector(".slides");
const slides = document.querySelectorAll(".slide");
const prevButton = document.querySelector(".slider-nav.prev");
const nextButton = document.querySelector(".slider-nav.next");
let currentSlide = 0;

function updateSlidePosition() {
  if (!slidesContainer || !slides.length) return;
  const slideWidth = slidesWindow?.getBoundingClientRect().width || 0;
  slidesContainer.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
}

function goToSlide(index) {
  if (!slides.length) return;
  currentSlide = (index + slides.length) % slides.length;
  updateSlidePosition();
}

prevButton?.addEventListener("click", () => goToSlide(currentSlide - 1));
nextButton?.addEventListener("click", () => goToSlide(currentSlide + 1));
window.addEventListener("resize", updateSlidePosition);

// ✨ Sparkle mengikuti kursor
function createSparkle(x, y) {
  const sparkle = document.createElement("span");
  sparkle.className = "sparkle";
  sparkle.style.left = `${x}px`;
  sparkle.style.top = `${y}px`;
  document.body.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 600);
}

document.addEventListener("mousemove", (event) => {
  if (!typingStarted) return;
  createSparkle(event.clientX, event.clientY);
});

// 🎆 Fireworks
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
let confettiPieces = [];
let fireworks = [];

function setupCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

setupCanvas();
window.addEventListener("resize", setupCanvas);

function createConfetti() {
  confettiPieces = Array.from({ length: 90 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 6 + 4,
    dy: Math.random() * 1.5 + 0.5,
    color: `hsl(${Math.random() * 360}, 90%, 60%)`
  }));
}

createConfetti();

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
  if (event.target.closest(".quiz-card, .slider-nav, input, button")) return;
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

animate();
