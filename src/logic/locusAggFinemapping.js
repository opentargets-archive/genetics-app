const locusFinemapping = ({ data, finemappingOnly }) => {
  if (!finemappingOnly) {
    return data;
  } else {
    const { tagVariantBlocks, geneIndexVariantStudies, ...rest } = data;
    return {
      tagVariantBlocks: tagVariantBlocks.filter(d => d.expansionType === 'fm'),
      geneIndexVariantStudies: geneIndexVariantStudies.filter(
        d => d.expansionType === 'fm'
      ),
      ...rest,
    };
  }
};

export default locusFinemapping;
