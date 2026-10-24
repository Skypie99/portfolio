import { createRequire } from 'node:module';
const require = createRequire(process.argv[2] + '/package.json');
const sharp = require('sharp');
const { data, info } = await sharp(process.argv[3]).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const px = (x, y) => { const i = (y * info.width + x) * 3; return [data[i], data[i+1], data[i+2]]; };
// Inside the card face, right of the orange stripe: x 290..965
let prev = null, start = 0;
for (let y = 430; y <= 1310; y++) {
  let dark = 0, minv = 255;
  for (let x = 290; x <= 965; x++) { const m = Math.min(...px(x, y)); if (m < 245) dark++; minv = Math.min(minv, m); }
  const state = dark === 0 ? 'white' : 'ink';
  if (state !== prev) { if (prev) console.log(`${prev.padEnd(5)} y ${start}..${y-1}`); prev = state; start = y; }
}
console.log(`${prev} y ${start}..1310`);
// stripe x extent at y 700
let row = []; for (let x = 250; x < 300; x++) { const [r,g,b] = px(x,700); row.push(r>200&&g<170&&b<100?'O':'.'); } console.log('stripe x250..299', row.join(''));
