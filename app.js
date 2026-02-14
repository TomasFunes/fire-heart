const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

let candles = [];
let mouse = { x: 0, y: 0 };
let particles = [];
let textOpacity = 0;
let backgroundDim = 0;
let isPressing = false;

const scale = 20;

// Generar corazón
for (let t = 0; t < Math.PI * 2; t += 0.18) {

  const x = 16 * Math.pow(Math.sin(t), 3);

  const y =
    13 * Math.cos(t)
    - 4 * Math.cos(2 * t)   // antes 5
    - 1.5 * Math.cos(3 * t) // antes 2
    - 0.5 * Math.cos(4 * t); // antes 1

  candles.push({
    x: centerX + x * scale,
    y: centerY - y * scale,
    progress: 0,
    flickerOffset: Math.random() * 1000
  });
}

function handleMove(x, y) {
  const rect = canvas.getBoundingClientRect();

  mouse.x = x - rect.left;
  mouse.y = y - rect.top;

  if (isPressing) {
    particles.push({
      x: mouse.x,
      y: mouse.y,
      life: 1
    });

    candles.forEach(c => {
      const dx = mouse.x - c.x;
      const dy = mouse.y - c.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < 28 && c.progress === 0) {
        c.progress = 0.01;
      }
    });
  }
}

canvas.addEventListener("pointerdown", (e) => {
  isPressing = true;
  handleMove(e.clientX, e.clientY);
});

canvas.addEventListener("pointermove", (e) => {
  handleMove(e.clientX, e.clientY);
});

canvas.addEventListener("pointerup", () => {
  isPressing = false;
});

canvas.addEventListener("pointercancel", () => {
  isPressing = false;
});

function getFlicker(time, offset) {
  return (
    Math.sin(time * 0.003 + offset) * 1.5 +
    Math.sin(time * 0.0015 + offset) * 1
  );
}

function drawCandle(c, time) {
  ctx.fillStyle = "rgba(200,200,200,0.15)";
  ctx.fillRect(c.x - 3, c.y, 6, 14);

  if (c.progress > 0) {
    c.progress = Math.min(c.progress + 0.02, 1);

    const flicker = getFlicker(time, c.flickerOffset);
    const radius = 7 + flicker;

    ctx.save();
    ctx.globalAlpha = c.progress;
    ctx.shadowBlur = 35;
    ctx.shadowColor = "rgba(255,140,0,0.9)";
    ctx.beginPath();
    ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "orange";
    ctx.fill();
    ctx.restore();
  }
}

function drawMatch(time) {
  if (!isPressing) return;

  const flicker = getFlicker(time, 0);
  const radius = 9 + flicker;

  ctx.save();
  ctx.shadowBlur = 40;
  ctx.shadowColor = "rgba(255,200,0,1)";
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.restore();
}

function drawParticles() {
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "orange";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "orange";
    ctx.fill();
    ctx.restore();

    p.life -= 0.04;
  });

  particles = particles.filter(p => p.life > 0);
}

function drawTextIfComplete() {
  if (candles.every(c => c.progress >= 1)) {

    backgroundDim = Math.min(backgroundDim + 0.01, 0.6);

    ctx.fillStyle = `rgba(0,0,0,${backgroundDim})`;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    textOpacity = Math.min(textOpacity + 0.01, 1);

    ctx.save();
    ctx.globalAlpha = textOpacity;
    ctx.shadowBlur = 60;
    ctx.shadowColor = "rgba(255,140,0,1)";
    ctx.fillStyle = "pink";
    ctx.textAlign = "center";

    // 🔥 Ajustamos posición general (más abajo)
    const baseY = centerY + 40;

    ctx.font = "90px 'Great Vibes', cursive";

    // Dibujamos "Te" un poco a la izquierda
    ctx.fillText("Te", centerX - 40, baseY - 40);

    // Dibujamos "amo" un poco a la derecha
    ctx.fillText("amo", centerX + 40, baseY + 20);

    // Nombre debajo
    ctx.font = "65px 'Great Vibes', cursive";
    ctx.fillText("Miki", centerX - 30, baseY + 110);

    ctx.restore();
  }
}

function animate(time) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  candles.forEach(c => drawCandle(c, time));
  drawParticles();
  drawMatch(time);
  drawTextIfComplete();

  requestAnimationFrame(animate);
}

animate();