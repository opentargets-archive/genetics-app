import _ from 'lodash';

import locusFilter from './locusAggFilter';
import locusSelected from './locusAggSelected';
import locusTransform from './locusTransform';
import locusChained from './locusAggChained';
import locusFinemapping from './locusFinemapping';
import locusLookups from './locusLookups';
import locusTable from './locusTable';

export const LOCUS_SCHEME = {
  CHAINED: 1,
  ALL: 2,
  ALL_GENES: 3,
};

export const LOCUS_FINEMAPPING = {
  ALL: 1,
  FINEMAPPING_ONLY: 2,
};

const BIGGER_THAN_POSITION = 1000000000;
const variantComparator = (a, b) => {
  // render by ordering (chained, position)
  const scoreA = (a.chained ? BIGGER_THAN_POSITION : 0) + a.position;
  const scoreB = (b.chained ? BIGGER_THAN_POSITION : 0) + b.position;
  return scoreA - scoreB;
};

const tagVariantBlocksComparator = (a, b) => {
  // TODO: may need to update
  return a.chained > b.chained;
};

const geneIndexVariantStudiesComparator = (a, b) => {
  // TODO: may need to update
  return a.chained > b.chained;
};

const EMPTY_PLOT = {
  genes: [],
  tagVariantBlocks: [],
  indexVariants: [],
  studies: [],
  geneIndexVariantStudies: [],
};
const EMPTY_LOOKUPS = {
  geneDict: {},
  tagVariantBlockDict: {},
  indexVariantDict: {},
  studyDict: {},
};
const EMPTY_ENTITIES = {
  genes: [],
  tagVariantBlocks: [],
  indexVariants: [],
  studies: [],
};

const newApiTransform = ({
  genes,
  tagVariants,
  indexVariants,
  studies,
  geneTagVariants,
  tagVariantIndexVariantStudies,
}) => {
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

  // lookups
  const genesLookupById = genes.reduce((acc, d) => {
    acc[d.id] = d;
    return acc;
  }, {});
  const tagVariantsLookupById = tagVariants.reduce((acc, d) => {
    acc[d.id] = d;
    return acc;
  }, {});
  const indexVariantsLookupById = indexVariants.reduce((acc, d) => {
    acc[d.id] = d;
    return acc;
  }, {});
  const studiesLookupById = studies.reduce((acc, d) => {
    acc[d.studyId] = d;
    return acc;
  }, {});

  // group by (indexVariant, study)
  const tagVariantBlocksObject = tagVariantIndexVariantStudies.reduce(
    (acc, d) => {
      const { tagVariantId, indexVariantId, studyId, pval } = d;
      const key = `${indexVariantId}-${studyId}`;
      if (!acc[key]) {
        acc[key] = {
          indexVariantId,
          studyId,
          pval,
          tagVariants: [],
          id: `${indexVariantId}-${studyId}`,
        };
      }
      acc[key].tagVariants.push(tagVariantId);
      return acc;
    },
    {}
  );
  const tagVariantBlocks = Object.values(tagVariantBlocksObject);
  // add start/end/score of tagVariantBlock
  tagVariantBlocks.forEach(d => {
    const positions = d.tagVariants.map(t => tagVariantsLookupById[t].position);
    d.tagVariantsStart = _.min(positions);
    d.tagVariantsEnd = _.max(positions);
  });

  const geneTagVariantsLookupByTagVariantId = geneTagVariants.reduce(
    (acc, d) => {
      if (!acc[d.tagVariantId]) {
        acc[d.tagVariantId] = [];
      }
      acc[d.tagVariantId].push(d);
      return acc;
    },
    {}
  );

  const geneIndexVariantStudiesObject = {};
  tagVariantBlocks.forEach(b => {
    // gives IV, S
    const {
      indexVariantId,
      studyId,
      pval,
      tagVariantsStart,
      tagVariantsEnd,
      tagVariants,
      id: tagVariantsBlockId,
    } = b;

    tagVariants.forEach(t => {
      // get linked genes
      geneTagVariantsLookupByTagVariantId[t].forEach(tg => {
        const { tss } = genesLookupById[tg.geneId];
        geneIndexVariantStudiesObject[
          `${tg.geneId}-${indexVariantId}-${studyId}`
        ] = {
          geneId: tg.geneId,
          geneTss: tss,
          indexVariantId,
          indexVariantPosition:
            indexVariantsLookupById[indexVariantId].position,
          studyId,
          traitReported: studiesLookupById[studyId].traitReported,
          pval,
          tagVariantsStart,
          tagVariantsEnd,
          tagVariantsBlockId,
        };
      });
    });
  });

  const lookups = {
    geneDict: genesLookupById,
    tagVariantBlockDict: tagVariantBlocksObject,
    indexVariantDict: indexVariantsLookupById,
    studyDict: studiesLookupById,
  };
  const plot = {
    genes: genesWithExonPairs,
    tagVariantBlocks,
    indexVariants,
    studies,
    geneIndexVariantStudies: Object.values(geneIndexVariantStudiesObject),
  };
  return { lookups, plot };
};

const locusScheme = ({
  scheme,
  finemappingOnly,
  data,
  selectedGenes,
  selectedTagVariantBlocks,
  selectedIndexVariants,
  selectedStudies,
}) => {
  if (!data) {
    return {
      plot: EMPTY_PLOT,
      entities: EMPTY_ENTITIES,
      rows: [],
      lookups: EMPTY_LOOKUPS,
      isEmpty: true,
      isEmptyFiltered: true,
    };
  }

  const { lookups, plot: transformed } = newApiTransform(data);

  console.info(
    `
entities:
|G|=${data.genes.length}, |TV|=${data.tagVariants.length} |IV|=${
      data.indexVariants.length
    } |S|=${data.studies.length}

new (aggregate) scheme:
|(G, aggTV, IV, S)|=${
      transformed.geneIndexVariantStudies.length
    }, |aggTV blocks|=${transformed.tagVariantBlocks.length}

old scheme:
|(G, TV)|=${data.geneTagVariants.length}, |(TV, IV, S)|=${
      data.tagVariantIndexVariantStudies.length
    }
    `
  );

  const selected = locusSelected({
    data: transformed,
    selectedGenes,
    selectedTagVariantBlocks,
    selectedIndexVariants,
    selectedStudies,
  });
  const filtered = locusFilter({
    data: selected,
    selectedGenes,
    selectedTagVariantBlocks,
    selectedIndexVariants,
    selectedStudies,
  });
  const chained = locusChained({
    data: selected,
    dataFiltered: filtered,
  });
  const {
    genes,
    tagVariantBlocks,
    indexVariants,
    studies,
    geneIndexVariantStudies,
  } = chained;

  const entities = {
    genes: _.sortBy(genes, [d => !d.selected, d => !d.chained, 'symbol']),
    tagVariantBlocks: tagVariantBlocks,
    indexVariants: _.sortBy(indexVariants, [
      d => !d.selected,
      d => !d.chained,

      'id',
    ]),
    studies: _.sortBy(studies, [
      d => !d.selected,
      d => !d.chained,
      'traitReported',
      'pubAuthor',
    ]),
  };

  const genesFiltered = genes.filter(d => d.chained);
  const tagVariantBlocksFiltered = tagVariantBlocks
    .filter(d => d.chained)
    .sort(tagVariantBlocksComparator);
  const indexVariantsFiltered = indexVariants
    .filter(d => d.chained)
    .sort(variantComparator);
  const studiesFiltered = studies.filter(d => d.chained);
  const geneIndexVariantStudiesFiltered = geneIndexVariantStudies
    .filter(d => d.chained)
    .sort(geneIndexVariantStudiesComparator);

  const isEmpty = transformed.geneIndexVariantStudies.length === 0;
  const isEmptyFiltered = filtered.geneIndexVariantStudies.length === 0;

  // TODO: update to use filtering; isEmpty
  const plot = {
    genes: genesFiltered,
    tagVariantBlocks: tagVariantBlocksFiltered,
    indexVariants: indexVariantsFiltered,
    studies: studiesFiltered,
    geneIndexVariantStudies: geneIndexVariantStudiesFiltered,
  };

  return {
    plot,
    rows: [],
    entities,
    lookups,
    isEmpty,
    isEmptyFiltered,
  };

  // const lookups = locusLookups(data);
  // const finemapping = locusFinemapping({ data, finemappingOnly });
  // const selected = locusSelected({
  //   data: finemapping,
  //   selectedGenes,
  //   selectedTagVariants,
  //   selectedIndexVariants,
  //   selectedStudies,
  // });
  // const transformed = locusTransform({ data: selected, lookups });

  // const filtered = locusFilter({
  //   data: transformed,
  //   selectedGenes,
  //   selectedTagVariants,
  //   selectedIndexVariants,
  //   selectedStudies,
  // });
  // const chained = locusChained({
  //   data: transformed,
  //   dataFiltered: filtered,
  // });
  // const {
  //   genes,
  //   tagVariants,
  //   indexVariants,
  //   studies,
  //   geneTagVariants,
  //   tagVariantIndexVariantStudies,
  // } = chained;

  // const entities = {
  //   genes: _.sortBy(genes, [d => !d.selected, d => !d.chained, 'symbol']),
  //   tagVariants: tagVariants,
  //   indexVariants: _.sortBy(indexVariants, [
  //     d => !d.selected,
  //     d => !d.chained,

  //     'id',
  //   ]),
  //   studies: _.sortBy(studies, [
  //     d => !d.selected,
  //     d => !d.chained,
  //     'traitReported',
  //     'pubAuthor',
  //   ]),
  // };

  // const genesFiltered = genes.filter(d => d.chained);
  // const tagVariantsFiltered = tagVariants
  //   .filter(d => d.chained)
  //   .sort(variantComparator);
  // const indexVariantsFiltered = indexVariants
  //   .filter(d => d.chained)
  //   .sort(variantComparator);
  // const studiesFiltered = studies.filter(d => d.chained);
  // const geneTagVariantsFiltered = geneTagVariants
  //   .filter(d => d.chained)
  //   .sort(geneTagVariantComparator);
  // const tagVariantIndexVariantStudiesFiltered = tagVariantIndexVariantStudies
  //   .filter(d => d.chained)
  //   .sort(tagVariantIndexVariantStudyComparator);

  // const isEmpty =
  //   transformed.geneTagVariants.length === 0 &&
  //   transformed.tagVariantIndexVariantStudies.length === 0;
  // const isEmptyFiltered =
  //   filtered.geneTagVariants.length === 0 &&
  //   filtered.tagVariantIndexVariantStudies.length === 0;

  // const rows = locusTable(
  //   {
  //     genes: genesFiltered,
  //     tagVariants: tagVariantsFiltered,
  //     indexVariants: indexVariantsFiltered,
  //     studies: studiesFiltered,
  //     geneTagVariants: geneTagVariantsFiltered,
  //     tagVariantIndexVariantStudies: tagVariantIndexVariantStudiesFiltered,
  //   },
  //   lookups
  // );
  // let plot;
  // switch (scheme) {
  //   case LOCUS_SCHEME.CHAINED:
  //     plot = {
  //       genes: genesFiltered,
  //       tagVariants: tagVariantsFiltered,
  //       indexVariants: indexVariantsFiltered,
  //       studies: studiesFiltered,
  //       geneTagVariants: geneTagVariantsFiltered,
  //       tagVariantIndexVariantStudies: tagVariantIndexVariantStudiesFiltered,
  //     };
  //     break;
  //   case LOCUS_SCHEME.ALL:
  //     const tagVariantsSorted = tagVariants.sort(variantComparator);
  //     const indexVariantsSorted = indexVariants.sort(variantComparator);
  //     const geneTagVariantsSorted = geneTagVariants.sort(
  //       geneTagVariantComparator
  //     );
  //     const tagVariantIndexVariantStudiesSorted = tagVariantIndexVariantStudies.sort(
  //       tagVariantIndexVariantStudyComparator
  //     );
  //     plot = {
  //       genes,
  //       tagVariants: tagVariantsSorted,
  //       indexVariants: indexVariantsSorted,
  //       studies,
  //       geneTagVariants: geneTagVariantsSorted,
  //       tagVariantIndexVariantStudies: tagVariantIndexVariantStudiesSorted,
  //     };
  //     break;
  //   case LOCUS_SCHEME.ALL_GENES:
  //   default:
  //     plot = {
  //       genes,
  //       tagVariants: tagVariantsFiltered,
  //       indexVariants: indexVariantsFiltered,
  //       studies: studiesFiltered,
  //       geneTagVariants: geneTagVariantsFiltered,
  //       tagVariantIndexVariantStudies: tagVariantIndexVariantStudiesFiltered,
  //     };
  // }
  // return {
  //   plot,
  //   rows,
  //   entities,
  //   lookups,
  //   isEmpty,
  //   isEmptyFiltered,
  // };
};

export default locusScheme;
