// this maps X, Y, and MT chromosomes to relative positions
// for sorting
const CHROM_MAP = {
  X: 0,
  Y: 1,
  MT: 2,
};

const chromosomeComparator = (aChrom, bChrom) => {
  if (aChrom === bChrom) {
    return 0;
  }

  if (isNaN(aChrom) && isNaN(bChrom)) {
    return CHROM_MAP[aChrom] - CHROM_MAP[bChrom];
  }
  if (isNaN(aChrom)) {
    return 1;
  }

  if (isNaN(bChrom)) {
    return -1;
  }

  return Number(aChrom) - Number(bChrom);
};

export default chromosomeComparator;
