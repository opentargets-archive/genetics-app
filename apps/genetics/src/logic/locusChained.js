const idField = d => d.id;
const studyIdField = d => d.studyId;
const gTvIdField = d => `${d.geneId}-${d.tagVariantId}`;
const tvIvSIdField = d => `${d.tagVariantId}-${d.indexVariantId}-${d.studyId}`;
const dictReducer = idFieldAccessor => (dict, d) => {
  dict[idFieldAccessor(d)] = true;
  return dict;
};

const locusChained = ({ data, dataFiltered }) => {
  const {
    genes,
    tagVariants,
    indexVariants,
    studies,
    geneTagVariants,
    tagVariantIndexVariantStudies,
  } = data;

  const {
    genes: genesFiltered,
    tagVariants: tagVariantsFiltered,
    indexVariants: indexVariantsFiltered,
    studies: studiesFiltered,
    geneTagVariants: geneTagVariantsFiltered,
    tagVariantIndexVariantStudies: tagVariantIndexVariantStudiesFiltered,
  } = dataFiltered;

  // build dicts
  const geneDict = genesFiltered.reduce(dictReducer(idField), {});
  const tagVariantDict = tagVariantsFiltered.reduce(dictReducer(idField), {});
  const indexVariantDict = indexVariantsFiltered.reduce(
    dictReducer(idField),
    {}
  );
  const studyDict = studiesFiltered.reduce(dictReducer(studyIdField), {});
  const geneTagVariantDict = geneTagVariantsFiltered.reduce(
    dictReducer(gTvIdField),
    {}
  );
  const tagVariantIndexVariantStudyDict = tagVariantIndexVariantStudiesFiltered.reduce(
    dictReducer(tvIvSIdField),
    {}
  );

  const genesWithChained = genes.map(d => ({
    ...d,
    chained: geneDict[d.id],
  }));
  const tagVariantsWithChained = tagVariants.map(d => ({
    ...d,
    chained: tagVariantDict[d.id],
  }));
  const indexVariantsWithChained = indexVariants.map(d => ({
    ...d,
    chained: indexVariantDict[d.id],
  }));
  const studiesWithChained = studies.map(d => ({
    ...d,
    chained: studyDict[d.studyId],
  }));
  const geneTagVariantsWithChained = geneTagVariants.map(d => ({
    ...d,
    chained: geneTagVariantDict[`${d.geneId}-${d.tagVariantId}`],
  }));
  const tagVariantIndexVariantStudiesWithChained = tagVariantIndexVariantStudies.map(
    d => ({
      ...d,
      chained:
        tagVariantIndexVariantStudyDict[
          `${d.tagVariantId}-${d.indexVariantId}-${d.studyId}`
        ],
    })
  );

  return {
    genes: genesWithChained,
    tagVariants: tagVariantsWithChained,
    indexVariants: indexVariantsWithChained,
    studies: studiesWithChained,
    geneTagVariants: geneTagVariantsWithChained,
    tagVariantIndexVariantStudies: tagVariantIndexVariantStudiesWithChained,
  };
};

export default locusChained;
