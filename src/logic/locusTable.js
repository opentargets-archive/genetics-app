const locusTable = ({
  genes,
  tagVariants,
  indexVariants,
  studies,
  geneTagVariants,
  tagVariantIndexVariantStudies,
}) => {
  // build dictionaries
  const geneDict = {};
  const tagVariantDict = {};
  const indexVariantDict = {};
  const studyDict = {};
  genes.forEach(d => (geneDict[d.id] = d));
  tagVariants.forEach(d => (tagVariantDict[d.id] = d));
  indexVariants.forEach(d => (indexVariantDict[d.id] = d));
  studies.forEach(d => (studyDict[d.studyId] = d));

  // build rows
  const rows = [];
  geneTagVariants.forEach(g2tv => {
    tagVariantIndexVariantStudies
      .filter(tv2iv2s => g2tv.tagVariantId === tv2iv2s.tagVariantId)
      .forEach(tv2iv2s => {
        rows.push({
          ...g2tv,
          ...tv2iv2s,
          gene: geneDict[g2tv.geneId],
          tagVariant: tagVariantDict[g2tv.tagVariantId],
          indexVariant: indexVariantDict[tv2iv2s.indexVariantId],
          study: studyDict[tv2iv2s.studyId],
        });
      });
  });

  return rows;
};

export default locusTable;
