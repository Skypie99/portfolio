import { createRequire } from 'node:module';
const require = createRequire(process.argv[2] + '/package.json');
const sharp = require('sharp');
const { data, info } = await sharp(process.argv[3]).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const px = (x, y) => { const i = (y * info.width + x) * 3; return [data[i], data[i+1], data[i+2]]; };
let s=''; for (let x=276;x<=292;x++) s += x+':'+Math.min(...px(x,1010))+' '; console.log(s);
for (const y of [990,993,995,996,997,998,1000,1005,1010,1015,1020,1022,1023,1024,1026]) {
  let m = 255, at=-1; for (let x = 284; x <= 976; x++) { const v=Math.min(...px(x, y)); if (v<m){m=v;at=x;} }
  console.log('row', y, 'min', m, 'at x', at);
}
