const idField = d => d.id;
const studyIdField = d => d.studyId;
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
    genes: genesFiltered,
    tagVariantBlocks: tagVariantsFiltered,
    indexVariants: indexVariantsFiltered,
    studies: studiesFiltered,
    geneIndexVariantStudies: geneIndexVariantStudiesFiltered,
  } = dataFiltered;

  // build dicts
  const geneDict = genesFiltered.reduce(dictReducer(idField), {});
  const tagVariantBlockDict = tagVariantsFiltered.reduce(
    dictReducer(idField),
    {}
  );
  const indexVariantDict = indexVariantsFiltered.reduce(
    dictReducer(idField),
    {}
  );
  const studyDict = studiesFiltered.reduce(dictReducer(studyIdField), {});
  const geneIndexVariantStudiesDict = geneIndexVariantStudiesFiltered.reduce(
    dictReducer(gIvSIdField),
    {}
  );

  const genesWithChained = genes.map(d => ({
    ...d,
    chained: geneDict[d.id],
  }));
  const tagVariantBlocksWithChained = tagVariantBlocks.map(d => ({
    ...d,
    chained: tagVariantBlockDict[d.id],
  }));
  const indexVariantsWithChained = indexVariants.map(d => ({
    ...d,
    chained: indexVariantDict[d.id],
  }));
  const studiesWithChained = studies.map(d => ({
    ...d,
    chained: studyDict[d.studyId],
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
