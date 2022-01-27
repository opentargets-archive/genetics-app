import GRCh38 from './GRCh38';

// get the cytoband of a position on a chromosome
export const getCytoband = (chromosome, position) => {
  const chrom = GRCh38.top_level_region.find(d => d.name === chromosome);
  if (chrom) {
    const band = chrom.bands.find(d => d.start <= position && d.end > position);
    if (band) {
      const [major] = band.id.split('.');
      return `${chrom.name}${major}`;
    } else {
      return null;
    }
  }
  return null;
};

// ignore Y, MT and patches
const chromosomesNumeric = [];
for (let i = 0; i < 22; i++) {
  chromosomesNumeric.push(`${i + 1}`);
}

export const chromosomeNames = [...chromosomesNumeric, 'X', 'Y'];

// calculate chromosomes with cumulative lengths (also as fraction)
const chromosomesWithLengths = chromosomeNames.map(chr => {
  const chrom = GRCh38.top_level_region.find(d => d.name === chr);
  return { name: chr, length: chrom.length };
});
const totalLength = chromosomesWithLengths.reduce((acc, d) => {
  acc += d.length;
  return acc;
}, 0);
let cumLength = 0;

export const chromosomesWithCumulativeLengths = chromosomesWithLengths.reduce(
  (acc, d) => {
    cumLength += d.length;
    acc.push({
      ...d,
      cumulativeLength: cumLength,
      proportionalStart: (cumLength - d.length) / totalLength,
      proportionalEnd: cumLength / totalLength,
    });
    return acc;
  },
  []
);
