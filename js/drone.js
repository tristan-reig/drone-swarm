/**
 * Un drone = un agent.
 * Il ne connaît que sa position, sa vitesse et sa cible,
 * et décide seul comment s'en approcher.
 */
class Drone {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.target = null;
    this.failed = false;
    this.opacity = 1;
    this.phase = Math.random() * Math.PI * 2;
    this.heading = Math.random() * Math.PI * 2;
  }

  costTo(point) {
    return point ? distance(this, point) : Infinity;
  }

  get isSettled() {
    return !this.failed && this.costTo(this.target) < CONFIG.settledDistance;
  }

  get isGone() {
    return this.opacity <= 0;
  }

  push(fx, fy) {
    this.vx += fx;
    this.vy += fy;
  }

  // Se dirige vers la cible et freine en s'en approchant
  seekTarget() {
    if (!this.target) return;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.01) return;

    const speed = dist < CONFIG.slowDownRadius
      ? CONFIG.maxSpeed * (dist / CONFIG.slowDownRadius)
      : CONFIG.maxSpeed;

    const desiredX = (dx / dist) * speed;
    const desiredY = (dy / dist) * speed;
    const steer = limit(desiredX - this.vx, desiredY - this.vy, CONFIG.maxForce);
    this.push(steer.x, steer.y);
  }

  // Un drone retiré tombe et s'efface
  fall() {
    this.push(0, 0.18);
    this.opacity -= 0.012;
  }

  update() {
    if (this.failed) this.fall();
    else this.seekTarget();

    this.vx *= CONFIG.friction;
    this.vy *= CONFIG.friction;
    this.x += this.vx;
    this.y += this.vy;

    if (Math.hypot(this.vx, this.vy) > 0.4) {
      this.heading = Math.atan2(this.vy, this.vx);
    }
  }
}
