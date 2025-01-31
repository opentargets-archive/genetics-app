import chromosomeComparator from './chromosomeComparator';

const cytobandComparator = (a, b) => {
  const { chromosome: chromosomeA, cytoband: cytobandA } = a;
  const { chromosome: chromosomeB, cytoband: cytobandB } = b;

  if (chromosomeA !== chromosomeB) {
    return chromosomeComparator(chromosomeA, chromosomeB);
  }

  const regex = /[pq]/;
  const matchA = cytobandA.match(regex);
  const matchB = cytobandB.match(regex);
  const armA = matchA[0];
  const armB = matchB[0];

  if (armA !== armB) {
    if (armA === 'p') return -1;
    return 1;
  }

  const majorA = cytobandA.slice(matchA.index + 1);
  const majorB = cytobandB.slice(matchB.index + 1);

  return Number(majorA) - Number(majorB);
};

export default cytobandComparator;
