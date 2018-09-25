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

const locusScheme = ({
  scheme,
  data,
  selectedGenes,
  selectedTagVariants,
  selectedIndexVariants,
  selectedStudies,
}) => {
  const lookups = locusLookups(data);
  const noneSelected =
    !selectedGenes &&
    !selectedTagVariants &&
    !selectedIndexVariants &&
    !selectedStudies;
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
  const geneTagVariantsFiltered = geneTagVariants.filter(d => d.chained);
  const tagVariantIndexVariantStudiesFiltered = tagVariantIndexVariantStudies.filter(
    d => d.chained
  );

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
      plot = {
        genes,
        tagVariants,
        indexVariants,
        studies,
        geneTagVariants,
        tagVariantIndexVariantStudies,
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
