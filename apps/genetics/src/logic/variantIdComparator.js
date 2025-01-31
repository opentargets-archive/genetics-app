import chromosomeComparator from './chromosomeComparator';

const variantIdComparator = (a, b) => {
  const { chromosome: aChrom, position: aPos } = a;
  const { chromosome: bChrom, position: bPos } = b;
  const chromResult = chromosomeComparator(aChrom, bChrom);

  if (chromResult === 0) {
    return aPos - bPos;
  }

  return chromResult;
};

export default variantIdComparator;
