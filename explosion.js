const canvas = document.getElementById("explosionCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 3 + 2;

    // Spread outward in a circle
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    this.speedX = Math.cos(angle) * speed;
    this.speedY = Math.sin(angle) * speed;

    this.opacity = 1;
    this.color = color;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.opacity -= 0.02;
  }
}


function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => {
    p.update();
    p.draw(ctx);
    if (p.opacity <= 0) particles.splice(i, 1);
  });
  requestAnimationFrame(animate);
}
animate();

export function triggerExplosion(cell) {
  const rect = cell.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  const colors = ["#ff0000", "#ffaa00", "#ffff00", "#ff5500", "#ffffff"];
  for (let i = 0; i < 40; i++) {
    let color = colors[Math.floor(Math.random() * colors.length)];
    particles.push(new Particle(x, y, color));
  }
}
