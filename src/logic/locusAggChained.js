const gIvSIdField = d => `${d.geneId}-${d.indexVariantId}-${d.studyId}`;
const dictReducer = idFieldAccessor => (dict, d) => {
  dict[idFieldAccessor(d)] = true;
  return dict;
};

const locusChained = ({ data, dataFiltered }) => {
  const {
    genes,
    tagVariantBlocks,
    indexVariants,
    studies,
    geneIndexVariantStudies,
  } = data;

  const {
    geneIndexVariantStudies: geneIndexVariantStudiesFiltered,
  } = dataFiltered;

  // build dicts
  const geneIndexVariantStudiesDict = geneIndexVariantStudiesFiltered.reduce(
    dictReducer(gIvSIdField),
    {}
  );

  const genesWithChained = genes.map(d => ({
    ...d,
    chained:
      geneIndexVariantStudiesFiltered.filter(c => c.geneId === d.id).length > 0,
  }));
  const tagVariantBlocksWithChained = tagVariantBlocks.map(d => ({
    ...d,
    chained:
      geneIndexVariantStudiesFiltered.filter(c => c.tagVariantsBlockId === d.id)
        .length > 0,
  }));
  const indexVariantsWithChained = indexVariants.map(d => ({
    ...d,
    chained:
      geneIndexVariantStudiesFiltered.filter(c => c.indexVariantId === d.id)
        .length > 0,
  }));
  const studiesWithChained = studies.map(d => ({
    ...d,
    chained:
      geneIndexVariantStudiesFiltered.filter(c => c.studyId === d.studyId)
        .length > 0,
  }));
  const geneIndexVariantStudiesWithChained = geneIndexVariantStudies.map(d => ({
    ...d,
    chained:
      geneIndexVariantStudiesDict[
        `${d.geneId}-${d.indexVariantId}-${d.studyId}`
      ],
  }));

  return {
    genes: genesWithChained,
    tagVariantBlocks: tagVariantBlocksWithChained,
    indexVariants: indexVariantsWithChained,
    studies: studiesWithChained,
    geneIndexVariantStudies: geneIndexVariantStudiesWithChained,
  };
};

export default locusChained;
