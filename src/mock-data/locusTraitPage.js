import distributionGenerator from './distribution-generator';
import GENE_SET from './ccdc71l-genes.json';

const study = {
  studyId: 'GCST001231',
  traitReported: 'Carotid intima media thickness',
  pubAuthor: 'Bis JC',
  pubJournal: 'Nat Genet',
  pubDate: '2011-09-11',
};
const indexVariant = {
  id: '7_106409452_G_A',
  rsId: 'rs17398575',
};

export const MOCK_STUDY_INFO = study;

export const MOCK_INDEX_VARIANT_INFO = indexVariant;

export const MOCK_COLOC_DATA = [
  {
    molecularTrait: 'eqtl',
    gene: {
      id: 'ENSG00000253276',
      symbol: 'CCDC71L',
    },
    tissue: {
      id: 'artery_aorta',
      name: 'Artery aorta',
    },
    source: 'gtex',
    h4: 0.993,
  },
  {
    molecularTrait: 'eqtl',
    gene: {
      id: 'ENSG00000228742',
      symbol: 'RP5-884M6.1',
    },
    tissue: {
      id: 'testis',
      name: 'Testis',
    },
    source: 'gtex',
    h4: 0.78,
  },
];

export const MOCK_CREDIBLE_SET_TRACK_PLOT = {
  disease: [
    {
      tagVariant: {
        id: '7_106409452_G_A ',
        rsId: 'rs17398575',
      },
      posteriorProbability: 0.31,
    },
    {
      tagVariant: {
        id: '7_106414069_T_G',
        rsId: 'rs2392929',
      },
      posteriorProbability: 0.91,
    },
    {
      tagVariant: {
        id: '	7_106405642_C_T',
        rsId: 'rs12705389',
      },
      posteriorProbability: 0.61,
    },
    {
      tagVariant: {
        id: '7_106412082_G_A',
        rsId: 'rs62481856',
      },
      posteriorProbability: 0.11,
    },
    {
      tagVariant: {
        id: '7_106411858_T_C',
        rsId: 'rs17477177',
      },
      posteriorProbability: 0.76,
    },
    {
      tagVariant: {
        id: '7_106410777_G_A',
        rsId: 'rs12705390',
      },
      posteriorProbability: 0.67,
    },
    {
      tagVariant: {
        id: '7_106418972_G_A',
        rsId: 'rs11760498',
      },
      posteriorProbability: 0.55,
    },
    {
      tagVariant: {
        id: '7_106417963_G_A',
        rsId: 'rs35301188',
      },
      posteriorProbability: 0.12,
    },
  ],
  qtls: [
    {
      molecularTrait: 'eqtl',
      gene: {
        id: 'ENSG00000253276',
        symbol: 'CCDC71L',
      },
      tissue: {
        id: 'artery_aorta',
        name: 'Artery aorta',
      },
      source: 'gtex',
      credibleSet: [
        {
          tagVariant: {
            id: '7_106409452_G_A ',
            rsId: 'rs17398575',
          },
          posteriorProbability: 0.31,
        },
        {
          tagVariant: {
            id: '7_106414069_T_G',
            rsId: 'rs2392929',
          },
          posteriorProbability: 0.91,
        },
        {
          tagVariant: {
            id: '7_106410777_G_A',
            rsId: 'rs12705390',
          },
          posteriorProbability: 0.67,
        },
        {
          tagVariant: {
            id: '7_106418972_G_A',
            rsId: 'rs11760498',
          },
          posteriorProbability: 0.55,
        },
      ],
    },
    {
      molecularTrait: 'eqtl',
      gene: {
        id: 'ENSG00000228742',
        symbol: 'RP5-884M6.1',
      },
      tissue: {
        id: 'testis',
        name: 'Testis',
      },
      source: 'gtex',
      credibleSet: [
        {
          tagVariant: {
            id: '7_106409452_G_A ',
            rsId: 'rs17398575',
          },
          posteriorProbability: 0.31,
        },
        {
          tagVariant: {
            id: '7_106414069_T_G',
            rsId: 'rs2392929',
          },
          posteriorProbability: 0.91,
        },
      ],
    },
  ],
};

export const MOCK_REGIONAL_START = 105301442;
export const MOCK_REGIONAL_END = 107301442;

export const MOCK_REGIONAL_DATA_STUDY = distributionGenerator({
  chromosome: '7',
  start: MOCK_REGIONAL_START,
  end: MOCK_REGIONAL_END,
  peaks: [],
});

export const MOCK_REGIONAL_DATA_GENES = {
  genes: GENE_SET,
};
