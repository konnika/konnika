const w = process.argv[2];
const h = process.argv[3];

if (w === undefined || h === undefined) {
  console.log(`Usage: node img [w] [h]`);
  exit(1);
}

const factors = [0.5, 0.75, 0.8, 0.9, 1, 1.25, 1.5, 2, 3, 4];

factors.forEach((x) => console.log(`${x}: width="${w * x}" height="${h * x}"`));
