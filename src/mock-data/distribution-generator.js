const alleleMap = ['A', 'T', 'C', 'G'];

const variantAtPosition = ({ chromosome, position }) => {
  const ref = position % 4;
  const alt = (position >> 1) % 4;
  const refAllele = alleleMap[ref];
  const altAllele = alleleMap[alt];
  return {
    id: `${chromosome}_${position}_${refAllele}_${altAllele}`,
    chromosome,
    position,
    refAllele,
    altAllele,
  };
};

const peakEffect = position => peak => {
  const distance = Math.abs(position - peak.position);
  if (distance > 10000) {
    return 1;
  } else {
    const exponent = -Math.pow(distance / peak.dispersion, 2);
    const factor = 1 - Math.exp(exponent);
    const value = peak.value + (1 - peak.value) * factor;
    return value;
  }
};

const distributionGenerator = ({ seed, chromosome, start, end, peaks }) => {
  let position = start + 77;
  const associations = [];

  while (position < end) {
    // create pval based on relative position to peaks (with fallback to pseudorandom)
    const pseudoRandom = Math.abs(Math.sin(position * seed));
    const peakEffectAtPosition = peakEffect(position);
    const peakEffects = peaks.map(peakEffectAtPosition);
    const peakEffectMin = Math.min(...peakEffects);
    const pval = Math.min(pseudoRandom, peakEffectMin);

    // create association
    const association = {
      ...variantAtPosition({ chromosome, position }),
      pval,
    };
    associations.push(association);

    // should jump by up to about 300 bp (according to SNP section of https://en.wikipedia.org/wiki/Human_genetic_variation)
    // try bigger jump
    const jump = 1 + (position % 83) * (position % 73) * (position % 3);
    position += jump;
  }
  return associations;
};

export default distributionGenerator;
