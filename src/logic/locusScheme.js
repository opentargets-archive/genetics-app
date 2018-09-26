import locusFilter from './locusFilter';
import locusSelected from './locusSelected';
import locusTransform from './locusTransform';
import locusChained from './locusChained';
import locusLookups from './locusLookups';
import locusTable from './locusTable';

export const LOCUS_SCHEME = {
  CHAINED: 1,
  ALL: 2,
  ALL_GENES: 3,
};

const geneTagVariantComparator = (a, b) => {
  // render by ordering (chained, overallScore)
  const scoreA = (a.chained ? 1 : 0) + a.overallScore;
  const scoreB = (b.chained ? 1 : 0) + b.overallScore;
  return scoreA - scoreB;
  // if (a.chained && b.chained) {
  //   return a.overallScore - b.overallScore;
  // } else if (a.chained) {
  //   return 1;
  // } else if (b.chained) {
  //   return -1;
  // } else {
  //   return a.overallScore - b.overallScore;
  // }
};

const tagVariantIndexVariantStudyComparator = (a, b) => {
  // render by ordering (chained, finemapping, r2)
  const scoreA = (a.chained ? 2 : 0) + (a.finemapping ? 1 : 0) + a.r2;
  const scoreB = (b.chained ? 2 : 0) + (b.finemapping ? 1 : 0) + b.r2;
  return scoreA - scoreB;
  // if (a.posteriorProbability && b.posteriorProbability) {
  //   return a.r2 - b.r2;
  // } else if (a.posteriorProbability) {
  //   return 1;
  // } else if (b.posteriorProbability) {
  //   return -1;
  // } else {
  //   return a.r2 - b.r2;
  // }
};

const locusScheme = ({
  scheme,
  data,
  selectedGenes,
  selectedTagVariants,
  selectedIndexVariants,
  selectedStudies,
}) => {
  const lookups = locusLookups(data);
  const selected = locusSelected({
    data,
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

  const genesFiltered = genes.filter(d => d.chained);
  const tagVariantsFiltered = tagVariants.filter(d => d.chained);
  const indexVariantsFiltered = indexVariants.filter(d => d.chained);
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
      const geneTagVariantsSorted = geneTagVariants.sort(
        geneTagVariantComparator
      );
      const tagVariantIndexVariantStudiesSorted = tagVariantIndexVariantStudies.sort(
        tagVariantIndexVariantStudyComparator
      );
      plot = {
        genes,
        tagVariants,
        indexVariants,
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
    lookups,
    isEmpty,
    isEmptyFiltered,
  };
};

export default locusScheme;
