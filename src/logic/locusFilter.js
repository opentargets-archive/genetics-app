const locusFilter = ({
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
  let genesUnfiltered = genes.map(d => ({
    ...d,
    selected: selectedGenes && selectedGenes.indexOf(d.id) >= 0,
  }));
  let tagVariantsUnfiltered = tagVariants.map(d => ({
    ...d,
    selected: selectedTagVariants && selectedTagVariants.indexOf(d.id) >= 0,
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
  let geneTagVariantsFiltered = geneTagVariants.slice();
  let tagVariantsFiltered = tagVariantsUnfiltered.slice();
  let tagVariantIndexVariantStudiesFiltered = tagVariantIndexVariantStudies.slice();
  let indexVariantsFiltered = indexVariantsUnfiltered.slice();
  let studiesFiltered = studiesUnfiltered.slice();

  // iterative filtering (uses AND between entities; OR within entities)

  // genes
  if (selectedGenes) {
    genesFiltered = genesFiltered.filter(d => selectedGenes.indexOf(d.id) >= 0);
    geneTagVariantsFiltered = geneTagVariantsFiltered.filter(
      d => selectedGenes.indexOf(d.geneId) >= 0
    );
    const tagVariantsLeft = geneTagVariantsFiltered.reduce((acc, d) => {
      acc[d.tagVariantId] = true;
      return acc;
    }, {});
    tagVariantsFiltered = tagVariantsFiltered.filter(
      d => tagVariantsLeft[d.id]
    );
    tagVariantIndexVariantStudiesFiltered = tagVariantIndexVariantStudiesFiltered.filter(
      d => tagVariantsLeft[d.tagVariantId]
    );
    const indexVariantsLeft = tagVariantIndexVariantStudiesFiltered.reduce(
      (acc, d) => {
        acc[d.indexVariantId] = true;
        return acc;
      },
      {}
    );
    indexVariantsFiltered = indexVariantsFiltered.filter(
      d => indexVariantsLeft[d.id]
    );
    const studiesLeft = tagVariantIndexVariantStudiesFiltered.reduce(
      (acc, d) => {
        acc[d.studyId] = true;
        return acc;
      },
      {}
    );
    studiesFiltered = studiesFiltered.filter(d => studiesLeft[d.studyId]);
  }

  // tag variants
  if (selectedTagVariants) {
    tagVariantsFiltered = tagVariantsFiltered.filter(
      d => selectedTagVariants.indexOf(d.id) >= 0
    );
    geneTagVariantsFiltered = geneTagVariantsFiltered.filter(
      d => selectedTagVariants.indexOf(d.tagVariantId) >= 0
    );
    const genesLeft = geneTagVariantsFiltered.reduce((acc, d) => {
      acc[d.geneId] = true;
      return acc;
    }, {});
    genesFiltered = genesFiltered.filter(d => genesLeft[d.id]);
    tagVariantIndexVariantStudiesFiltered = tagVariantIndexVariantStudiesFiltered.filter(
      d => selectedTagVariants.indexOf(d.tagVariantId) >= 0
    );
    const indexVariantsLeft = tagVariantIndexVariantStudiesFiltered.reduce(
      (acc, d) => {
        acc[d.indexVariantId] = true;
        return acc;
      },
      {}
    );
    indexVariantsFiltered = indexVariantsFiltered.filter(
      d => indexVariantsLeft[d.id]
    );
    const studiesLeft = tagVariantIndexVariantStudiesFiltered.reduce(
      (acc, d) => {
        acc[d.studyId] = true;
        return acc;
      },
      {}
    );
    studiesFiltered = studiesFiltered.filter(d => studiesLeft[d.studyId]);
  }

  // index variants
  if (selectedIndexVariants) {
    indexVariantsFiltered = indexVariantsFiltered.filter(
      d => selectedIndexVariants.indexOf(d.id) >= 0
    );
    tagVariantIndexVariantStudiesFiltered = tagVariantIndexVariantStudiesFiltered.filter(
      d => selectedIndexVariants.indexOf(d.indexVariantId) >= 0
    );
    const tagVariantsLeft = tagVariantIndexVariantStudiesFiltered.reduce(
      (acc, d) => {
        acc[d.tagVariantId] = true;
        return acc;
      },
      {}
    );
    tagVariantsFiltered = tagVariantsFiltered.filter(
      d => tagVariantsLeft[d.id]
    );
    const studiesLeft = tagVariantIndexVariantStudiesFiltered.reduce(
      (acc, d) => {
        acc[d.studyId] = true;
        return acc;
      },
      {}
    );
    studiesFiltered = studiesFiltered.filter(d => studiesLeft[d.studyId]);
    geneTagVariantsFiltered = geneTagVariantsFiltered.filter(
      d => tagVariantsLeft[d.tagVariantId]
    );
    const genesLeft = geneTagVariantsFiltered.reduce((acc, d) => {
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
    tagVariantIndexVariantStudiesFiltered = tagVariantIndexVariantStudiesFiltered.filter(
      d => selectedStudies.indexOf(d.studyId) >= 0
    );
    const tagVariantsLeft = tagVariantIndexVariantStudiesFiltered.reduce(
      (acc, d) => {
        acc[d.tagVariantId] = true;
        return acc;
      },
      {}
    );
    const indexVariantsLeft = tagVariantIndexVariantStudiesFiltered.reduce(
      (acc, d) => {
        acc[d.indexVariantId] = true;
        return acc;
      },
      {}
    );
    tagVariantsFiltered = tagVariantsFiltered.filter(
      d => tagVariantsLeft[d.id]
    );
    indexVariantsFiltered = indexVariantsFiltered.filter(
      d => indexVariantsLeft[d.id]
    );
    geneTagVariantsFiltered = geneTagVariantsFiltered.filter(
      d => tagVariantsLeft[d.tagVariantId]
    );
    const genesLeft = geneTagVariantsFiltered.reduce((acc, d) => {
      acc[d.geneId] = true;
      return acc;
    }, {});
    genesFiltered = genesFiltered.filter(d => genesLeft[d.id]);
  }

  return {
    genes: genesFiltered,
    tagVariants: tagVariantsFiltered,
    indexVariants: indexVariantsFiltered,
    studies: studiesFiltered,
    geneTagVariants: geneTagVariantsFiltered,
    tagVariantIndexVariantStudies: tagVariantIndexVariantStudiesFiltered,
  };
};

export default locusFilter;
