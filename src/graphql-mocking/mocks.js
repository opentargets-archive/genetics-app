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

const PUB_JOURNALS = [
  'Nat Commun',
  'Sci Rep',
  'Arthritis Res Ther',
  'Nature',
  'BMC Genomics',
  'Diabetes Metab Res Rev',
  'Prog Neuropsychopharmacol Biol Psychiatry',
];
const PUB_TITLES = [
  'Genome-wide association study link novel loci to endometriosis.',
  'Genome-wide association study of iron traits and relation to diabetes in the Hispanic Community Health Study/Study of Latinos (HCHS/SOL): potential genomic intersection of iron andglucose regulation?',
  'Meta-analysis of genome-wide association studies of anxiety disorders.',
  'Whole genome sequencing and imputation in isolated populations identify genetic associations with medically-relevant complex traits.',
  'Weight loss after gastric bypass is associated with a variant at 15q26.1.',
];

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

const SEARCH_GENES = [
  {
    id: 'ENSG00000157764',
    symbol: 'BRAF',
    name: 'B-Raf proto-oncogene, serine/threonine kinase',
    synonyms: [
      'BRAF1',
      'RAFB1',
      'v-Raf murine sarcoma viral oncogene homolog B1',
    ],
  },
  {
    id: 'ENSG00000145335',
    symbol: 'SNCA',
    name: 'synuclein alpha',
    synonyms: [],
  },
];
const SEARCH_VARIANTS = [
  {
    variantId: '1_10247043_A_T',
    rsId: 'rs869449',
  },
  {
    variantId: '5_17399320_C_G',
    rsId: 'rs3758469',
  },
];
const SEARCH_STUDIES = [
  {
    studyId: 'GCST005806',
    traitReported: 'Blood protein levels',
    pubAuthor: 'Sun BB',
    pubDate: '2018-06-06',
    pubJournal: 'Nature',
  },
  {
    studyId: 'GCST005831',
    traitReported: 'Systemic lupus erythematosus',
    pubAuthor: 'Julia A',
    pubDate: '2018-05-30',
    pubJournal: 'Arthritis Res Ther',
  },
];
const mockSearchResult = () => {
  return {
    genes: SEARCH_GENES,
    variants: SEARCH_VARIANTS,
    studies: SEARCH_STUDIES,
  };
};
const mockStudyInfo = () => {
  return {
    ...SEARCH_STUDIES[0],
    pmid: '8962668',
  };
};
const mockVariantId = () => {
  const chromosome = casual.random_element(CHROMOSOMES);
  const position = casual.integer(1, CHROMOSOME_LENGTHS_GRCH38[chromosome]);
  const effectAllele = casual.random_element(ALLELES);
  const effectAlleleIndex = ALLELES.indexOf(effectAllele);
  const otherAlleleOptions = [
    ...ALLELES.slice(0, effectAlleleIndex),
    ...ALLELES.slice(effectAlleleIndex + 1),
  ];
  const otherAllele = casual.random_element(otherAlleleOptions);
  return `${chromosome}_${position}_${otherAllele}_${effectAllele}`;
};
const mockRsId = () => `rs${casual.integer(100, 100000)}`;

const mocks = {
  PheWAS: () => {
    // sample from the actual study names, then augment with other fields
    const associations = _.sampleSize(STUDIES, 100).map(d => ({
      ...d,
      traitCode: `TRAIT_${casual.integer(10000, 99999)}`,
      pval: Math.pow(10, -casual.double(0, MAX_NEG_LOG10_PVAL_PHEWAS)),
      beta: casual.double(-0.002, 0.008), // taken from example summary stats file for rheumatoid arthritis
      oddsRatio: Math.exp(casual.double(-0.002, 0.008)),
      nCases: casual.integer(1, d.nTotal),
    }));
    return { associations };
  },
  StudyInfo: mockStudyInfo,
  SearchResult: mockSearchResult,
  IndexVariantAndStudyForTagVariant: () => {
    const study = casual.random_element(STUDIES);
    return {
      indexVariantId: mockVariantId(),
      indexVariantRsId: mockRsId(),
      ...study,
      pval: Math.pow(10, -casual.double(0, MAX_NEG_LOG10_PVAL_PHEWAS)),
      nCases: casual.integer(1, study.nTotal),
      pmid: `${casual.integer(10000000, 100000000)}`,
      pubDate: casual.date('YYYY-MM-DD'),
      pubJournal: casual.random_element(PUB_JOURNALS),
      pubTitle: casual.random_element(PUB_TITLES),
      pubAuthor: `${casual.last_name} ${casual.letter.toUpperCase()}`,
      overallR2: casual.double(0.7, 1),
      log10Abf: casual.double(-10, 10),
      posteriorProbability: casual.double(0, 1),
    };
  },
  TagVariantAndStudyForIndexVariant: () => {
    const study = casual.random_element(STUDIES);
    return {
      tagVariantId: mockVariantId(),
      tagVariantRsId: mockRsId(),
      ...study,
      pval: Math.pow(10, -casual.double(0, MAX_NEG_LOG10_PVAL_PHEWAS)),
      nCases: casual.integer(1, study.nTotal),
      pmid: `${casual.integer(10000000, 100000000)}`,
      pubDate: casual.date('YYYY-MM-DD'),
      pubJournal: casual.random_element(PUB_JOURNALS),
      pubTitle: casual.random_element(PUB_TITLES),
      pubAuthor: `${casual.last_name} ${casual.letter.toUpperCase()}`,
      overallR2: casual.double(0.7, 1),
      log10Abf: casual.double(-10, 10),
      posteriorProbability: casual.double(0, 1),
    };
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
