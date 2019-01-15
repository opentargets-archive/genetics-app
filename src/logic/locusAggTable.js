const locusTable = (
  { genes, tagVariantBlocks, indexVariants, studies, geneIndexVariantStudies },
  lookups
) => {
  const {
    geneDict,
    tagVariantBlockDict,
    indexVariantDict,
    studyDict,
  } = lookups;

  // build rows
  const rows = geneIndexVariantStudies.map(d => ({
    ...d,
    gene: geneDict[d.geneId],
    tagVariantBlock: tagVariantBlockDict[d.tagVariantsBlockId],
    indexVariant: indexVariantDict[d.indexVariantId],
    study: studyDict[d.studyId],
  }));

  return rows;
};

export default locusTable;
