import { MockList } from 'graphql-tools';
import casual from 'casual-browserify';
import _ from 'lodash';

import STUDIES from './studies';
import GENES from './locusGenes';
import TAG_VARIANTS from './locusTagVariants';
import INDEX_VARIANTS from './locusIndexVariants';
import GENE_TAG_VARIANTS from './locusGeneTagVariants';

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

const IS_IN_CREDIBLE_SET_OPTIONS = [true, false, null];

const mockGecko = (_, { chromosome, start, end }) => {
  let tagVariants = [];
  let indexVariants = [];
  let genes = [];
  let geneTagVariants = [];
  let studies = [];
  if (chromosome === '7') {
    genes = GENES.filter(d => d.end >= start && d.start < end);
    tagVariants = TAG_VARIANTS.filter(
      d => d.position >= start && d.position < end
    );
    indexVariants = INDEX_VARIANTS.filter(
      d => d.position >= start && d.position < end
    );
    geneTagVariants = GENE_TAG_VARIANTS.filter(
      d =>
        (d => d.variantPosition >= start && d.variantPosition < end) ||
        (d => d.geneTss >= start && d.geneTss < end)
    );
    studies = STUDIES.filter((d, i) => i < 30).map(d => ({
      ...d,
      pmid: casual.integer(100000, 1000000),
    }));
  }
  return {
    genes,
    tagVariants,
    indexVariants,
    geneTagVariants,
    studies,
  };
};

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
  GenesForVariant: () => {
    return {
      genes: [
        {
          id: 'ENSG00000157764',
          symbol: 'BRAF',
          overallScore: 'High',
        },
        {
          id: 'ENSG00000145335',
          symbol: 'SNCA',
          overallScore: 'Medium',
        },
      ],
    };
  },
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
      pmid: `${casual.integer(10000000, 100000000)}`,
      pubDate: casual.date('YYYY-MM-DD'),
      pubAuthor: `${casual.last_name} ${casual.letter.toUpperCase()}`,
      overallR2: casual.double(0.7, 1),
      isInCredibleSet: casual.random_element(IS_IN_CREDIBLE_SET_OPTIONS),
    };
  },
  TagVariantAndStudyForIndexVariant: () => {
    const study = casual.random_element(STUDIES);
    return {
      tagVariantId: mockVariantId(),
      tagVariantRsId: mockRsId(),
      ...study,
      pval: Math.pow(10, -casual.double(0, MAX_NEG_LOG10_PVAL_PHEWAS)),
      pmid: `${casual.integer(10000000, 100000000)}`,
      pubDate: casual.date('YYYY-MM-DD'),
      pubAuthor: `${casual.last_name} ${casual.letter.toUpperCase()}`,
      overallR2: casual.double(0.7, 1),
      isInCredibleSet: casual.random_element(IS_IN_CREDIBLE_SET_OPTIONS),
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
    gecko: mockGecko,
  }),
};

export default mocks;
