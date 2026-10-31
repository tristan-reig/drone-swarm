const canvas = document.getElementById("sky");
const renderer = new Renderer(canvas);
const swarm = new Swarm(window.innerWidth, window.innerHeight);

const ui = {
  input: document.getElementById("wordInput"),
  addButton: document.getElementById("addButton"),
  removeButton: document.getElementById("removeButton"),
  droneCount: document.getElementById("droneCount"),
};

function resize() {
  renderer.resize(window.innerWidth, window.innerHeight);
  swarm.resize(window.innerWidth, window.innerHeight);
}

// Les drones suivent le texte en temps réel
ui.input.addEventListener("input", () => {
  swarm.formWord(ui.input.value.trim().toUpperCase());
});

ui.addButton.addEventListener("click", () => swarm.launch(CONFIG.dronesPerClick));
ui.removeButton.addEventListener("click", () => swarm.remove(CONFIG.dronesPerClick));

canvas.addEventListener("click", (event) => {
  swarm.scatter(event.clientX, event.clientY);
  renderer.addRipple(event.clientX, event.clientY);
});

window.addEventListener("resize", resize);

// Boucle d'animation
function loop(time) {
  swarm.update();
  renderer.draw(swarm, time);
  ui.droneCount.textContent = swarm.activeDrones.length;
  requestAnimationFrame(loop);
}

resize();
swarm.launch(CONFIG.initialDrones);

// On attend la police pour que les lettres aient la bonne forme
document.fonts.ready.then(() => {
  swarm.formWord(ui.input.value.trim().toUpperCase());
  requestAnimationFrame(loop);
});
