const locusFinemapping = ({ data, finemappingOnly }) => {
  if (!finemappingOnly) {
    return data;
  }

  const { geneTagVariants, tagVariantIndexVariantStudies, ...rest } = data;

  const tagVariantIndexVariantStudiesFinemapping = tagVariantIndexVariantStudies.filter(
    d => d.posteriorProbability
  );
  const tagVariantsFinemapping = tagVariantIndexVariantStudiesFinemapping.reduce(
    (acc, d) => {
      acc[d.tagVariantId] = true;
      return acc;
    },
    {}
  );
  const geneTagVariantsFinemapping = geneTagVariants.filter(
    d => tagVariantsFinemapping[d.tagVariantId]
  );

  return {
    geneTagVariants: geneTagVariantsFinemapping,
    tagVariantIndexVariantStudies: tagVariantIndexVariantStudiesFinemapping,
    ...rest,
  };
};

export default locusFinemapping;
