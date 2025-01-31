import _ from 'lodash';

import locusFilter from './locusFilter';
import locusSelected from './locusSelected';
import locusTransform from './locusTransform';
import locusChained from './locusChained';
import locusFinemapping from './locusFinemapping';
import locusLookups from './locusLookups';
import locusTable from './locusTable';

export const LOCUS_SCHEME = {
  CHAINED: 1,
  ALL: 2,
  ALL_GENES: 3,
};

export const LOCUS_FINEMAPPING = {
  ALL: 1,
  FINEMAPPING_ONLY: 2,
};

const BIGGER_THAN_POSITION = 1000000000;
const variantComparator = (a, b) => {
  // render by ordering (chained, position)
  const scoreA = (a.chained ? BIGGER_THAN_POSITION : 0) + a.position;
  const scoreB = (b.chained ? BIGGER_THAN_POSITION : 0) + b.position;
  return scoreA - scoreB;
};

const geneTagVariantComparator = (a, b) => {
  // render by ordering (chained, overallScore)
  const scoreA = (a.chained ? 2 : 0) + a.overallScore;
  const scoreB = (b.chained ? 2 : 0) + b.overallScore;
  return scoreA - scoreB;
};

const tagVariantIndexVariantStudyComparator = (a, b) => {
  // render by ordering (chained, fine-mapping, r2)
  const scoreA =
    (a.chained ? 8 : 4) +
    (a.posteriorProbability ? 1 + a.posteriorProbability : 0) +
    a.r2;
  const scoreB =
    (b.chained ? 8 : 4) +
    (b.posteriorProbability ? 1 + b.posteriorProbability : 0) +
    b.r2;
  return scoreA - scoreB;
};

const EMPTY_PLOT = {
  genes: [],
  tagVariants: [],
  indexVariants: [],
  studies: [],
  geneTagVariants: [],
  tagVariantIndexVariantStudies: [],
};
const EMPTY_LOOKUPS = {
  geneDict: {},
  tagVariantDict: {},
  indexVariantDict: {},
  studyDict: {},
};
const EMPTY_ENTITIES = {
  genes: [],
  tagVariants: [],
  indexVariants: [],
  studies: [],
};

const locusScheme = ({
  scheme,
  finemappingOnly,
  data,
  selectedGenes,
  selectedTagVariants,
  selectedIndexVariants,
  selectedStudies,
}) => {
  if (!data) {
    return {
      plot: EMPTY_PLOT,
      entities: EMPTY_ENTITIES,
      rows: [],
      lookups: EMPTY_LOOKUPS,
      isEmpty: true,
      isEmptyFiltered: true,
    };
  }

  const lookups = locusLookups(data);
  const finemapping = locusFinemapping({ data, finemappingOnly });
  const selected = locusSelected({
    data: finemapping,
    selectedGenes,
    selectedTagVariants,
    selectedIndexVariants,
    selectedStudies,
  });
  const transformed = locusTransform({ data: selected, lookups });

  const filtered = locusFilter({
    data: transformed,
    selectedGenes,
    selectedTagVariants,
    selectedIndexVariants,
    selectedStudies,
  });
  const chained = locusChained({
    data: transformed,
    dataFiltered: filtered,
  });
  const {
    genes,
    tagVariants,
    indexVariants,
    studies,
    geneTagVariants,
    tagVariantIndexVariantStudies,
  } = chained;

  const entities = {
    genes: _.sortBy(genes, [d => !d.selected, d => !d.chained, 'symbol']),
    tagVariants: tagVariants,
    indexVariants: _.sortBy(indexVariants, [
      d => !d.selected,
      d => !d.chained,

      'id',
    ]),
    studies: _.sortBy(studies, [
      d => !d.selected,
      d => !d.chained,
      'traitReported',
      'pubAuthor',
    ]),
  };

  const genesFiltered = genes.filter(d => d.chained);
  const tagVariantsFiltered = tagVariants
    .filter(d => d.chained)
    .sort(variantComparator);
  const indexVariantsFiltered = indexVariants
    .filter(d => d.chained)
    .sort(variantComparator);
  const studiesFiltered = studies.filter(d => d.chained);
  const geneTagVariantsFiltered = geneTagVariants
    .filter(d => d.chained)
    .sort(geneTagVariantComparator);
  const tagVariantIndexVariantStudiesFiltered = tagVariantIndexVariantStudies
    .filter(d => d.chained)
    .sort(tagVariantIndexVariantStudyComparator);

  const isEmpty =
    transformed.geneTagVariants.length === 0 &&
    transformed.tagVariantIndexVariantStudies.length === 0;
  const isEmptyFiltered =
    filtered.geneTagVariants.length === 0 &&
    filtered.tagVariantIndexVariantStudies.length === 0;

  const rows = locusTable(
    {
      genes: genesFiltered,
      tagVariants: tagVariantsFiltered,
      indexVariants: indexVariantsFiltered,
      studies: studiesFiltered,
      geneTagVariants: geneTagVariantsFiltered,
      tagVariantIndexVariantStudies: tagVariantIndexVariantStudiesFiltered,
    },
    lookups
  );
  let plot;
  switch (scheme) {
    case LOCUS_SCHEME.CHAINED:
      plot = {
        genes: genesFiltered,
        tagVariants: tagVariantsFiltered,
        indexVariants: indexVariantsFiltered,
        studies: studiesFiltered,
        geneTagVariants: geneTagVariantsFiltered,
        tagVariantIndexVariantStudies: tagVariantIndexVariantStudiesFiltered,
      };
      break;
    case LOCUS_SCHEME.ALL:
      const tagVariantsSorted = tagVariants.sort(variantComparator);
      const indexVariantsSorted = indexVariants.sort(variantComparator);
      const geneTagVariantsSorted = geneTagVariants.sort(
        geneTagVariantComparator
      );
      const tagVariantIndexVariantStudiesSorted = tagVariantIndexVariantStudies.sort(
        tagVariantIndexVariantStudyComparator
      );
      plot = {
        genes,
        tagVariants: tagVariantsSorted,
        indexVariants: indexVariantsSorted,
        studies,
        geneTagVariants: geneTagVariantsSorted,
        tagVariantIndexVariantStudies: tagVariantIndexVariantStudiesSorted,
      };
      break;
    case LOCUS_SCHEME.ALL_GENES:
    default:
      plot = {
        genes,
        tagVariants: tagVariantsFiltered,
        indexVariants: indexVariantsFiltered,
        studies: studiesFiltered,
        geneTagVariants: geneTagVariantsFiltered,
        tagVariantIndexVariantStudies: tagVariantIndexVariantStudiesFiltered,
      };
  }
  return {
    plot,
    rows,
    entities,
    lookups,
    isEmpty,
    isEmptyFiltered,
  };
};

export default locusScheme;
