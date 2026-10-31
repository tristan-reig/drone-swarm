/**
 * L'essaim = le système multi-agents.
 * Aucun chef : les drones réservent eux-mêmes un point libre,
 * négocient entre eux pour l'échanger, et gardent leurs distances.
 */
class Swarm {
  constructor(width, height) {
    this.drones = [];
    this.word = "";
    this.resize(width, height);
  }

  get activeDrones() {
    return this.drones.filter((drone) => !drone.failed);
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.formWord(this.word);
  }

  // Les nouveaux drones décollent du bas de l'écran
  launch(count) {
    for (let i = 0; i < count; i++) {
      const x = randomBetween(0, this.width);
      const y = this.height + randomBetween(20, 160);
      this.drones.push(new Drone(x, y));
    }
    this.formWord(this.word);
  }

  remove(count) {
    const leaving = shuffle(this.activeDrones).slice(0, count);
    for (const drone of leaving) {
      drone.failed = true;
      drone.target = null;
    }
    this.formWord(this.word); // les drones restants se réorganisent
  }

  formWord(word) {
    this.word = word;
    const drones = this.activeDrones;
    if (drones.length === 0) return;

    const targets = word
      ? getTextTargets(word, drones.length, this.width, this.height)
      : getIdleTargets(drones.length, this.width, this.height);
    this.claimTargets(drones, targets);
  }

  // Repousse les drones autour du clic
  scatter(x, y) {
    for (const drone of this.activeDrones) {
      const dx = drone.x - x;
      const dy = drone.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist > CONFIG.scatterRadius || dist === 0) continue;

      const strength = CONFIG.scatterStrength * (1 - dist / CONFIG.scatterRadius);
      drone.push((dx / dist) * strength, (dy / dist) * strength);
    }
  }

  // Chaque drone, dans un ordre aléatoire, réserve le point libre le plus proche
  claimTargets(drones, targets) {
    const free = [...targets];
    for (const drone of shuffle([...drones])) {
      let bestIndex = 0;
      let bestCost = Infinity;
      free.forEach((target, index) => {
        const cost = drone.costTo(target);
        if (cost < bestCost) {
          bestCost = cost;
          bestIndex = index;
        }
      });
      drone.target = free[bestIndex];
      free[bestIndex] = free[free.length - 1];
      free.pop();
    }
  }

  // Négociation : deux drones échangent leurs cibles si ça raccourcit leur trajet total
  negotiate() {
    const drones = this.activeDrones;
    if (drones.length < 2) return;

    for (let i = 0; i < CONFIG.negotiationsPerFrame; i++) {
      const a = drones[Math.floor(Math.random() * drones.length)];
      const b = drones[Math.floor(Math.random() * drones.length)];
      if (a === b) continue;

      const currentCost = a.costTo(a.target) + b.costTo(b.target);
      const swappedCost = a.costTo(b.target) + b.costTo(a.target);
      if (swappedCost < currentCost) {
        [a.target, b.target] = [b.target, a.target];
      }
    }
  }

  // Évitement des collisions : les drones trop proches se repoussent
  keepDistance() {
    const drones = this.activeDrones;
    const radius = CONFIG.separationRadius;

    for (let i = 0; i < drones.length; i++) {
      for (let j = i + 1; j < drones.length; j++) {
        const a = drones[i];
        const b = drones[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        if (Math.abs(dx) > radius || Math.abs(dy) > radius) continue;

        const dist = Math.hypot(dx, dy);
        if (dist === 0 || dist > radius) continue;

        const force = CONFIG.separationStrength * (1 - dist / radius);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.push(fx, fy);
        b.push(-fx, -fy);
      }
    }
  }

  update() {
    this.negotiate();
    this.keepDistance();
    for (const drone of this.drones) drone.update();
    this.drones = this.drones.filter((drone) => !drone.isGone);
  }
}
