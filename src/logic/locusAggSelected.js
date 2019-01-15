const locusSelected = ({
  data,
  selectedGenes,
  selectedTagVariantBlocks,
  selectedIndexVariants,
  selectedStudies,
}) => {
  const {
    genes,
    tagVariantBlocks,
    indexVariants,
    studies,
    geneIndexVariantStudies,
  } = data;

  // add selected field
  let genesWithSelected = genes.map(d => ({
    ...d,
    selected: selectedGenes && selectedGenes.indexOf(d.id) >= 0,
  }));
  let tagVariantBlocksWithSelected = tagVariantBlocks.map(d => ({
    ...d,
    selected:
      selectedTagVariantBlocks && selectedTagVariantBlocks.indexOf(d.id) >= 0,
  }));
  let indexVariantsWithSelected = indexVariants.map(d => ({
    ...d,
    selected: selectedIndexVariants && selectedIndexVariants.indexOf(d.id) >= 0,
  }));
  let studiesWithSelected = studies.map(d => ({
    ...d,
    selected: selectedStudies && selectedStudies.indexOf(d.studyId) >= 0,
  }));

  return {
    genes: genesWithSelected,
    tagVariantBlocks: tagVariantBlocksWithSelected,
    indexVariants: indexVariantsWithSelected,
    studies: studiesWithSelected,
    geneIndexVariantStudies,
  };
};

export default locusSelected;
