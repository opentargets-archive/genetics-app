const locusLookups = ({
  genes,
  tagVariants,
  indexVariants,
  studies,
  geneTagVariants,
  tagVariantIndexVariantStudies,
}) => {
  // build dictionaries (to find items quickly by id)
  const geneDict = {};
  const tagVariantDict = {};
  const indexVariantDict = {};
  const studyDict = {};
  genes.forEach(d => (geneDict[d.id] = d));
  tagVariants.forEach(d => (tagVariantDict[d.id] = d));
  indexVariants.forEach(d => (indexVariantDict[d.id] = d));
  studies.forEach(d => (studyDict[d.studyId] = d));
  return {
    geneDict,
    tagVariantDict,
    indexVariantDict,
    studyDict,
  };
};

export default locusLookups;
