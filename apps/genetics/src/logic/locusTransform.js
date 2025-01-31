function locusTransform({ data, lookups }) {
  const {
    genes,
    geneTagVariants,
    tagVariantIndexVariantStudies,
    ...rest
  } = data;
  const { geneDict, tagVariantDict, indexVariantDict, studyDict } = lookups;

  // gene exons come as flat list, rendering expects list of pairs
  const genesWithExonPairs = genes.map(d => ({
    ...d,
    exons: d.exons.reduce((result, value, index, array) => {
      if (index % 2 === 0) {
        result.push(array.slice(index, index + 2));
      }
      return result;
    }, []),
  }));

  // geneTagVariants come with ids only, but need position info for gene and tagVariant
  const geneTagVariantsWithPosition = geneTagVariants.map(d => ({
    ...d,
    geneTss: geneDict[d.geneId].tss,
    tagVariantPosition: tagVariantDict[d.tagVariantId].position,
  }));

  // tagVariantIndexVariantStudies come with ids only, but need position info for tagVariant and indexVariant
  const tagVariantIndexVariantStudiesWithPosition = tagVariantIndexVariantStudies.map(
    d => ({
      ...d,
      tagVariantPosition: tagVariantDict[d.tagVariantId].position,
      indexVariantPosition: indexVariantDict[d.indexVariantId].position,
      traitReported: studyDict[d.studyId].traitReported,
    })
  );

  console.info(
    `Rendering ${geneTagVariants.length} (G, TV)s and ${
      tagVariantIndexVariantStudies.length
    } (TV, IV, S)s`
  );

  return {
    genes: genesWithExonPairs,
    geneTagVariants: geneTagVariantsWithPosition,
    tagVariantIndexVariantStudies: tagVariantIndexVariantStudiesWithPosition,
    ...rest,
  };
}

export default locusTransform;
