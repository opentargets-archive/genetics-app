import { descending } from 'd3';
import { getPhenotypeId, getSpliceId } from '../../utils';

export const useColocTable = data => {
  const uniqueStudyGenePhenotypes = data.reduce((acc, d) => {
    const { phenotypeId, gene, qtlStudyName } = d;
    acc[`${qtlStudyName}__${gene.id}`] = {
      phenotypeId: getPhenotypeId(phenotypeId),
      gene,
      qtlStudyName,
    };
    return acc;
  }, {});

  const uniquePhenotypeIds = Object.values(uniqueStudyGenePhenotypes);

  const uniqueTissues = Object.values(
    data.reduce((acc, d) => {
      acc[d.tissue.id] = d.tissue;
      return acc;
    }, {})
  );

  const dataByPhenotypeId = uniquePhenotypeIds.map(
    ({ phenotypeId, gene, qtlStudyName }) => ({
      phenotypeId,
      gene,
      qtlStudyName,
      ...uniqueTissues.reduce((acc, t) => {
        const items = data
          .filter(
            d =>
              d.gene.id === gene.id &&
              d.qtlStudyName === qtlStudyName &&
              d.tissue.id === t.id
          )
          .map(d => ({
            h3: d.h3,
            h4: d.h4,
            log2h4h3: d.log2h4h3,
            beta: d.beta,
            splice: getSpliceId(d.phenotypeId),
          }))
          .sort((a, b) => descending(a.log2h4h3, b.log2h4h3));

        // there could be multiple loci for gene-tissue, so pick
        // by highest log2h4h3 value (this should not happen due
        // to deduplication on index variants)
        if (items.length > 1) {
          console.info(
            `Multiple entries found: ${gene.symbol}, ${qtlStudyName}, ${phenotypeId}`,
            items
          );
        }
        acc[t.id] = items.length > 0 ? items[0] : null;
        return acc;
      }, {}),
    })
  );

  return {
    uniqueTissues,
    dataByPhenotypeId,
  };
};
