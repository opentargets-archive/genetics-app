const locusSelected = ({
  data,
  selectedGenes,
  selectedTagVariants,
  selectedIndexVariants,
  selectedStudies,
}) => {
  const {
    genes,
    tagVariants,
    indexVariants,
    studies,
    geneTagVariants,
    tagVariantIndexVariantStudies,
  } = data;

  // add selected field
  let genesWithSelected = genes.map(d => ({
    ...d,
    selected: selectedGenes && selectedGenes.indexOf(d.id) >= 0,
  }));
  let tagVariantsWithSelected = tagVariants.map(d => ({
    ...d,
    selected: selectedTagVariants && selectedTagVariants.indexOf(d.id) >= 0,
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
    tagVariants: tagVariantsWithSelected,
    indexVariants: indexVariantsWithSelected,
    studies: studiesWithSelected,
    geneTagVariants,
    tagVariantIndexVariantStudies,
  };
};

export default locusSelected;
