import { MockList } from 'graphql-tools';
import casual from 'casual-browserify';
import _ from 'lodash';

import STUDIES from './studies';

const SIGNIFICANCE = -Math.log10(5e-8);
const MIN_PVAL = -Math.log10(1e-300);
const MIN_PVAL_PHEWAS = 1e-20;
const MAX_NEG_LOG10_PVAL_PHEWAS = -Math.log10(MIN_PVAL_PHEWAS);
const CHROMOSOMES = [
  ...Array.from(new Array(22), (val, index) => `${index + 1}`),
  'X',
];
const CHROMOSOME_LENGTHS_GRCH38 = {
  '1': 248956422,
  '2': 242193529,
  '3': 198295559,
  '4': 190214555,
  '5': 181538259,
  '6': 170805979,
  '7': 159345973,
  '8': 145138636,
  '9': 138394717,
  '10': 133797422,
  '11': 135086622,
  '12': 133275309,
  '13': 114364328,
  '14': 107043718,
  '15': 101991189,
  '16': 90338345,
  '17': 83257441,
  '18': 80373285,
  '19': 58617616,
  '20': 64444167,
  '21': 46709983,
  '22': 50818468,
  X: 156040895,
  Y: 57227415,
};
const ALLELES = 'ACGT'.split('');

const mockManhattanAssociation = () => {
  const chromosome = casual.random_element(CHROMOSOMES);
  const position = casual.integer(1, CHROMOSOME_LENGTHS_GRCH38[chromosome]);
  const effectAllele = casual.random_element(ALLELES);
  const effectAlleleIndex = ALLELES.indexOf(effectAllele);
  const otherAlleleOptions = [
    ...ALLELES.slice(0, effectAlleleIndex),
    ...ALLELES.slice(effectAlleleIndex + 1),
  ];
  const otherAllele = casual.random_element(otherAlleleOptions);
  const rsNumber = casual.integer(100, 100000);

  return {
    indexVariantId: `${chromosome}_${position}_${otherAllele}_${effectAllele}`,
    indexVariantRsId: `rs${rsNumber}`,
    pval: Math.pow(10, -casual.double(SIGNIFICANCE, MIN_PVAL)),
    chromosome,
    position,
    credibleSetSize: casual.integer(0, 10),
    ldSetSize: casual.integer(0, 30),
    bestGenes: [],
  };
};

const mocks = {
  PheWAS: (a, b) => {
    // sample from the actual study names, then augment with other fields
    const associations = _.sampleSize(STUDIES, 100).map(d => ({
      ...d,
      traitCode: `TRAIT_${casual.integer(10000, 99999)}`,
      pval: Math.pow(10, -casual.double(0, MAX_NEG_LOG10_PVAL_PHEWAS)),
      nCases: casual.integer(1, d.nTotal),
    }));
    return { associations };
  },
  ManhattanAssociation: mockManhattanAssociation,
  RootQueryType: () => ({
    manhattan: (_, { studyId }) => {
      return {
        associations: () => new MockList(100),
      };
    },
  }),
};

export default mocks;
