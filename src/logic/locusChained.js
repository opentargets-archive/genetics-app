const locusChained = ({ data, dataFiltered }) => {
  const {
    genes,
    tagVariants,
    indexVariants,
    studies,
    geneTagVariants,
    tagVariantIndexVariantStudies,
  } = data;

  const {
    genes: genesFiltered,
    tagVariants: tagVariantsFiltered,
    indexVariants: indexVariantsFiltered,
    studies: studiesFiltered,
    geneTagVariants: geneTagVariantsFiltered,
    tagVariantIndexVariantStudies: tagVariantIndexVariantStudiesFiltered,
  } = dataFiltered;

  // show ALL genes
  const geneDict = {};
  const tagVariantDict = {};
  const indexVariantDict = {};
  const studyDict = {};
  const geneTagVariantDict = {};
  const tagVariantIndexVariantStudyDict = {};

  genesFiltered.forEach(d => (geneDict[d.id] = true));
  tagVariantsFiltered.forEach(d => (tagVariantDict[d.id] = true));
  indexVariantsFiltered.forEach(d => (indexVariantDict[d.id] = true));
  studiesFiltered.forEach(d => (studyDict[d.studyId] = true));
  geneTagVariantsFiltered.forEach(
    d => (geneTagVariantDict[`${d.geneId}-${d.tagVariantId}`] = true)
  );
  tagVariantIndexVariantStudiesFiltered.forEach(
    d =>
      (tagVariantIndexVariantStudyDict[
        `${d.tagVariantId}-${d.indexVariantId}-${d.studyId}`
      ] = true)
  );

  const genesWithChained = genes.map(d => ({
    ...d,
    chained: geneDict[d.id],
  }));
  const tagVariantsWithChained = tagVariants.map(d => ({
    ...d,
    chained: tagVariantDict[d.id],
  }));
  const indexVariantsWithChained = indexVariants.map(d => ({
    ...d,
    chained: indexVariantDict[d.id],
  }));
  const studiesWithChained = studies.map(d => ({
    ...d,
    chained: studyDict[d.studyId],
  }));
  const geneTagVariantsWithChained = geneTagVariants.map(d => ({
    ...d,
    chained: geneTagVariantDict[`${d.geneId}-${d.tagVariantId}`],
  }));
  const tagVariantIndexVariantStudiesWithChained = tagVariantIndexVariantStudies.map(
    d => ({
      ...d,
      chained:
        tagVariantIndexVariantStudyDict[
          `${d.tagVariantId}-${d.indexVariantId}-${d.studyId}`
        ],
    })
  );

  return {
    genes: genesWithChained,
    tagVariants: tagVariantsWithChained,
    indexVariants: indexVariantsWithChained,
    studies: studiesWithChained,
    geneTagVariants: geneTagVariantsWithChained,
    tagVariantIndexVariantStudies: tagVariantIndexVariantStudiesWithChained,
  };
};

export default locusChained;
