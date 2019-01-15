const locusFilter = ({
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
  let genesUnfiltered = genes.map(d => ({
    ...d,
    selected: selectedGenes && selectedGenes.indexOf(d.id) >= 0,
  }));
  let tagVariantBlocksUnfiltered = tagVariantBlocks.map(d => ({
    ...d,
    selected:
      selectedTagVariantBlocks &&
      selectedTagVariantBlocks.indexOf(`${d.indexVariantId}-${d.studyId}`) >= 0,
  }));
  let indexVariantsUnfiltered = indexVariants.map(d => ({
    ...d,
    selected: selectedIndexVariants && selectedIndexVariants.indexOf(d.id) >= 0,
  }));
  let studiesUnfiltered = studies.map(d => ({
    ...d,
    selected: selectedStudies && selectedStudies.indexOf(d.studyId) >= 0,
  }));

  // copy original
  let genesFiltered = genesUnfiltered.slice();
  let tagVariantBlocksFiltered = tagVariantBlocksUnfiltered.slice();
  let geneIndexVariantStudiesFiltered = geneIndexVariantStudies.slice();
  let indexVariantsFiltered = indexVariantsUnfiltered.slice();
  let studiesFiltered = studiesUnfiltered.slice();

  // iterative filtering (uses AND between entities; OR within entities)

  // genes
  if (selectedGenes) {
    genesFiltered = genesFiltered.filter(d => selectedGenes.indexOf(d.id) >= 0);
    geneIndexVariantStudiesFiltered = geneIndexVariantStudiesFiltered.filter(
      d => selectedGenes.indexOf(d.geneId) >= 0
    );
    const tagVariantBlocksLeft = geneIndexVariantStudiesFiltered.reduce(
      (acc, d) => {
        acc[`${d.indexVariantId}-${d.studyId}`] = true;
        return acc;
      },
      {}
    );
    tagVariantBlocksFiltered = tagVariantBlocksFiltered.filter(
      d => tagVariantBlocksLeft[`${d.indexVariantId}-${d.studyId}`]
    );
    const indexVariantsLeft = geneIndexVariantStudiesFiltered.reduce(
      (acc, d) => {
        acc[d.indexVariantId] = true;
        return acc;
      },
      {}
    );
    indexVariantsFiltered = indexVariantsFiltered.filter(
      d => indexVariantsLeft[d.id]
    );
    const studiesLeft = geneIndexVariantStudiesFiltered.reduce((acc, d) => {
      acc[d.studyId] = true;
      return acc;
    }, {});
    studiesFiltered = studiesFiltered.filter(d => studiesLeft[d.studyId]);
  }

  // tag variants blocks
  if (selectedTagVariantBlocks) {
    tagVariantBlocksFiltered = tagVariantBlocksFiltered.filter(
      d => selectedTagVariantBlocks.indexOf(d.id) >= 0
    );
    geneIndexVariantStudiesFiltered = geneIndexVariantStudiesFiltered.filter(
      d =>
        selectedTagVariantBlocks.indexOf(`${d.indexVariantId}-${d.studyId}`) >=
        0
    );
    const genesLeft = geneIndexVariantStudiesFiltered.reduce((acc, d) => {
      acc[d.geneId] = true;
      return acc;
    }, {});
    genesFiltered = genesFiltered.filter(d => genesLeft[d.id]);
    const indexVariantsLeft = geneIndexVariantStudiesFiltered.reduce(
      (acc, d) => {
        acc[d.indexVariantId] = true;
        return acc;
      },
      {}
    );
    indexVariantsFiltered = indexVariantsFiltered.filter(
      d => indexVariantsLeft[d.id]
    );
    const studiesLeft = geneIndexVariantStudiesFiltered.reduce((acc, d) => {
      acc[d.studyId] = true;
      return acc;
    }, {});
    studiesFiltered = studiesFiltered.filter(d => studiesLeft[d.studyId]);
  }

  // index variants
  if (selectedIndexVariants) {
    indexVariantsFiltered = indexVariantsFiltered.filter(
      d => selectedIndexVariants.indexOf(d.id) >= 0
    );
    geneIndexVariantStudiesFiltered = geneIndexVariantStudiesFiltered.filter(
      d => selectedIndexVariants.indexOf(d.indexVariantId) >= 0
    );
    const tagVariantBlocksLeft = geneIndexVariantStudiesFiltered.reduce(
      (acc, d) => {
        acc[`${d.indexVariantId}-${d.studyId}`] = true;
        return acc;
      },
      {}
    );
    tagVariantBlocksFiltered = tagVariantBlocksFiltered.filter(
      d => tagVariantBlocksLeft[`${d.indexVariantId}-${d.studyId}`]
    );
    const studiesLeft = geneIndexVariantStudiesFiltered.reduce((acc, d) => {
      acc[d.studyId] = true;
      return acc;
    }, {});
    studiesFiltered = studiesFiltered.filter(d => studiesLeft[d.studyId]);
    const genesLeft = geneIndexVariantStudiesFiltered.reduce((acc, d) => {
      acc[d.geneId] = true;
      return acc;
    }, {});
    genesFiltered = genesFiltered.filter(d => genesLeft[d.id]);
  }

  // studies
  if (selectedStudies) {
    studiesFiltered = studiesFiltered.filter(
      d => selectedStudies.indexOf(d.studyId) >= 0
    );
    geneIndexVariantStudiesFiltered = geneIndexVariantStudiesFiltered.filter(
      d => selectedStudies.indexOf(d.studyId) >= 0
    );
    const tagVariantBlocksLeft = geneIndexVariantStudiesFiltered.reduce(
      (acc, d) => {
        acc[`${d.indexVariantId}-${d.studyId}`] = true;
        return acc;
      },
      {}
    );
    tagVariantBlocksFiltered = tagVariantBlocksFiltered.filter(
      d => tagVariantBlocksLeft[`${d.indexVariantId}-${d.studyId}`]
    );
    const indexVariantsLeft = geneIndexVariantStudiesFiltered.reduce(
      (acc, d) => {
        acc[d.indexVariantId] = true;
        return acc;
      },
      {}
    );
    indexVariantsFiltered = indexVariantsFiltered.filter(
      d => indexVariantsLeft[d.id]
    );
    const genesLeft = geneIndexVariantStudiesFiltered.reduce((acc, d) => {
      acc[d.geneId] = true;
      return acc;
    }, {});
    genesFiltered = genesFiltered.filter(d => genesLeft[d.id]);
  }

  return {
    genes: genesFiltered,
    tagVariantBlocks: tagVariantBlocksFiltered,
    indexVariants: indexVariantsFiltered,
    studies: studiesFiltered,
    geneIndexVariantStudies: geneIndexVariantStudiesFiltered,
  };
};

export default locusFilter;
