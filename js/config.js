// Tous les réglages de la simulation
const CONFIG = {
  initialDrones: 400,
  dronesPerClick: 40,

  // Déplacement d'un drone
  maxSpeed: 7,
  maxForce: 0.35,
  slowDownRadius: 110,
  friction: 0.96,
  settledDistance: 3,

  // Interactions entre drones
  separationRadius: 8,
  separationStrength: 0.5,
  negotiationsPerFrame: 600,

  // Dispersion au clic
  scatterRadius: 200,
  scatterStrength: 18,

  // Affichage
  droneSize: 3.6,
  trailLength: 5,
  colors: {
    background: "#04121a",
    hologram: "#62f3ff",
    travelling: "#2b9fb5",
    ghost: "#ff4fd8",
    failing: "#ff3d6e",
  },

  font: "'Chakra Petch', 'Segoe UI', Arial, sans-serif",
};
