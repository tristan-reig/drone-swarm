class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ripples = [];
  }

  // Adapte la résolution à l'écran pour un rendu net
  resize(width, height) {
    const ratio = window.devicePixelRatio || 1;
    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.width = width;
    this.height = height;
  }

  addRipple(x, y) {
    this.ripples.push({ x, y, radius: 0, opacity: 0.7 });
  }

  draw(swarm, time) {
    const ctx = this.ctx;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = CONFIG.colors.background;
    ctx.fillRect(0, 0, this.width, this.height);

    // Les lumières qui se chevauchent s'additionnent
    ctx.globalCompositeOperation = "lighter";
    this.drawRipples();
    this.drawTrails(swarm.drones);
    this.drawDrones(swarm.drones, time);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  drawTrails(drones) {
    const ctx = this.ctx;
    ctx.lineCap = "round";
    ctx.lineWidth = 1.5;

    for (const drone of drones) {
      const speed = Math.hypot(drone.vx, drone.vy);
      if (speed < 0.6) continue;

      ctx.globalAlpha = Math.min(0.5, speed / 12) * drone.opacity;
      ctx.strokeStyle = drone.failed ? CONFIG.colors.failing : CONFIG.colors.travelling;
      ctx.beginPath();
      ctx.moveTo(drone.x, drone.y);
      ctx.lineTo(drone.x - drone.vx * CONFIG.trailLength, drone.y - drone.vy * CONFIG.trailLength);
      ctx.stroke();
    }
  }

  drawRipples() {
    const ctx = this.ctx;
    for (const ripple of this.ripples) {
      ripple.radius += 10;
      ripple.opacity -= 0.025;
      ctx.globalAlpha = Math.max(0, ripple.opacity);
      ctx.strokeStyle = CONFIG.colors.hologram;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    this.ripples = this.ripples.filter((ripple) => ripple.opacity > 0);
  }

  drawDrones(drones, time) {
    const settled = [];
    const travelling = [];

    for (const drone of drones) {
      if (drone.failed) {
        // Peu nombreux : dessinés un par un, avec leur propre transparence
        drawQuadcopters(this.ctx, [drone], CONFIG.colors.failing, drone.opacity);
      } else if (drone.isSettled) {
        // Les drones en place flottent légèrement
        settled.push({ x: drone.x, y: drone.y + Math.sin(time / 600 + drone.phase) * 0.7, heading: drone.heading });
      } else {
        travelling.push(drone);
      }
    }

    const flicker = 0.9 + Math.random() * 0.1;

    drawHalos(this.ctx, settled, CONFIG.colors.hologram, 0.1);
    drawQuadcopters(this.ctx, settled, CONFIG.colors.ghost, 0.35, 1.5);
    drawQuadcopters(this.ctx, settled, CONFIG.colors.hologram, flicker);
    drawQuadcopters(this.ctx, travelling, CONFIG.colors.travelling, 0.85);
  }
}

// Halo doux autour de chaque drone, tous dessinés en un seul tracé
function drawHalos(ctx, drones, color, alpha) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (const d of drones) {
    ctx.moveTo(d.x + 7, d.y);
    ctx.arc(d.x, d.y, 7, 0, Math.PI * 2);
  }
  ctx.fill();
}

function drawQuadcopters(ctx, drones, color, alpha, offsetX = 0) {
  const size = CONFIG.droneSize;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1;

  const arms = new Path2D();
  const rotors = new Path2D();
  const bodies = new Path2D();

  for (const d of drones) {
    const x = d.x + offsetX;
    const y = d.y;
    bodies.moveTo(x + 1.5, y);
    bodies.arc(x, y, 1.5, 0, Math.PI * 2);

    for (let i = 0; i < 4; i++) {
      const a = d.heading + Math.PI / 4 + (i * Math.PI) / 2;
      const rx = x + Math.cos(a) * size;
      const ry = y + Math.sin(a) * size;
      arms.moveTo(x, y);
      arms.lineTo(rx, ry);
      rotors.moveTo(rx + 1.5, ry);
      rotors.arc(rx, ry, 1.5, 0, Math.PI * 2);
    }
  }

  ctx.stroke(arms);
  ctx.stroke(rotors);
  ctx.fill(bodies);
}
