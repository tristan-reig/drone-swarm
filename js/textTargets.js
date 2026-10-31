/**
 * Transforme un mot en une liste de points, un par drone :
 * on dessine le mot sur un canvas caché, puis on garde
 * les points d'une grille qui tombent dans les lettres.
 */
function getTextTargets(text, count, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  drawCenteredText(ctx, text, width, height);

  const pixels = ctx.getImageData(0, 0, width, height).data;
  const isInsideLetter = (x, y) => pixels[(y * width + x) * 4 + 3] > 128;

  // On resserre la grille jusqu'à avoir assez de points pour tous les drones
  let spacing = Math.sqrt(countFilledPixels(isInsideLetter, width, height) / count);
  let points = [];

  while (spacing > 2) {
    points = sampleGrid(isInsideLetter, width, height, spacing);
    if (points.length >= count) break;
    spacing *= 0.95;
  }

  return shuffle(points).slice(0, count);
}

function getIdleTargets(count, width, height) {
  const left = width * 0.05;
  const top = height * 0.3;
  const areaWidth = width * 0.9;
  const areaHeight = height * 0.48;

  const cell = Math.sqrt((areaWidth * areaHeight) / count);
  const columns = Math.ceil(areaWidth / cell);
  const rows = Math.ceil(areaHeight / cell);
  const jitter = cell * 0.3;

  const points = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      points.push({
        x: left + (col + 0.5) * cell + randomBetween(-jitter, jitter),
        y: top + (row + 0.5) * cell + randomBetween(-jitter, jitter),
      });
    }
  }
  return shuffle(points).slice(0, count);
}

function drawCenteredText(ctx, text, width, height) {
  let fontSize = height * 0.42;
  ctx.font = `700 ${fontSize}px ${CONFIG.font}`;

  // Réduit la police si le mot est trop large pour l'écran
  const maxWidth = width * 0.86;
  const textWidth = ctx.measureText(text).width;
  if (textWidth > maxWidth) {
    fontSize *= maxWidth / textWidth;
    ctx.font = `700 ${fontSize}px ${CONFIG.font}`;
  }

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width / 2, height * 0.55);
}

// Surface approximative couverte par les lettres, en pixels
function countFilledPixels(isInsideLetter, width, height) {
  const step = 2;
  let filled = 0;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (isInsideLetter(x, y)) filled++;
    }
  }
  return filled * step * step;
}

function sampleGrid(isInsideLetter, width, height, spacing) {
  const points = [];
  let row = 0;
  for (let y = spacing / 2; y < height; y += spacing, row++) {
    const offset = row % 2 === 0 ? 0 : spacing / 2; // une ligne sur deux est décalée
    for (let x = spacing / 2 + offset; x < width; x += spacing) {
      if (isInsideLetter(Math.floor(x), Math.floor(y))) {
        points.push({ x, y });
      }
    }
  }
  return points;
}
