// ✨ Efek typing
const text = "Klik di layar untuk mulai 🎁";
let i = 0;
function typingEffect() {
  if (i < text.length) {
    document.getElementById("typing").innerHTML += text.charAt(i);
    i++;
    setTimeout(typingEffect, 100);
  } else {
    document.getElementById("quiz").style.display = "block";
  }
}

document.body.addEventListener("click", typingEffect, { once: true });

// 🕵️ Quiz sederhana
function checkAnswer() {
  const ans = document.getElementById("answer").value.toLowerCase();
  if(ans.includes("kue") || ans.includes("cake")) {
    document.getElementById("quiz").style.display = "none";
    document.getElementById("secretMessage").style.display = "block";
    spawnBalloons();
  } else {
    alert("Hehe coba lagi, pikirkan ulang 🎂");
  }
}

// 🎈 Balon kejutan
function spawnBalloons() {
  for (let i = 0; i < 20; i++) {
    let balloon = document.createElement("div");
    balloon.classList.add("balloon");
    balloon.innerHTML = "🎈";
    balloon.style.left = Math.random() * 100 + "vw";
    balloon.style.animationDuration = 4 + Math.random() * 3 + "s";
    document.body.appendChild(balloon);
    setTimeout(() => { balloon.remove(); }, 7000);
  }
}

// 🎉 Confetti animasi
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const confetti = Array.from({length: 100}, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 6 + 4,
  d: Math.random() * 10,
  color: `hsl(${Math.random()*360},100%,50%)`
}));

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  confetti.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI);
    ctx.fillStyle = c.color;
    ctx.fill();
  });
  update();
}

function update() {
  confetti.forEach(c => {
    c.y += 1;
    if(c.y > canvas.height) {
      c.y = -10; c.x = Math.random() * canvas.width;
    }
  });
}

setInterval(draw, 20);
// --- IGNORE ---