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

const distributionGenerator = ({ chromosome, start, end, peaks }) => {
  let position = start + 77;
  const associations = [];
  while (position < end) {
    // create pval based on relative position to peaks
    const pseudoRandom = Math.abs(Math.sin(position));
    const pval = pseudoRandom;

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
