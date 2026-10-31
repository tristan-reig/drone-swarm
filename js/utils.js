function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Réduit un vecteur pour que sa longueur ne dépasse pas max
function limit(x, y, max) {
  const length = Math.hypot(x, y);
  if (length <= max || length === 0) return { x, y };
  return { x: (x / length) * max, y: (y / length) * max };
}
