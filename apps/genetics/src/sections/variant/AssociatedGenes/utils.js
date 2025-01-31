import { scaleSqrt } from 'd3';

export const OVERVIEW = 'overview';

export const radiusScale = scaleSqrt().domain([0, 1]).range([0, 6]);

export const getDataAll = (genesForVariant) => {
  const data = [];
  genesForVariant.forEach((item) => {
    const row = {
      geneId: item.gene.id,
      geneSymbol: item.gene.symbol,
      overallScore: item.overallScore,
    };
    // for distances we want to use the first element of
    // the distances array
    item.distances.forEach((distance) => {
      row[distance.sourceId] = item.distances[0];
    });
    item.qtls.forEach((qtl) => {
      row[qtl.sourceId] = qtl.aggregatedScore;
    });
    item.intervals.forEach((interval) => {
      row[interval.sourceId] = interval.aggregatedScore;
    });
    // for functionalPredictions we want to use the first element of
    // the functionalPredictions array
    item.functionalPredictions.forEach((fp) => {
      row[fp.sourceId] = item.functionalPredictions[0];
    });
    data.push(row);
  });
  return data;
};

export const getDataAllDownload = (tableData) => {
  return tableData.map((row) => {
    const newRow = { ...row };
    if (row.canonical_tss) {
      newRow.canonical_tss = row.canonical_tss.tissues[0].distance;
    }
    if (row.vep) {
      newRow.vep = row.vep.tissues[0].maxEffectLabel;
    }
    return newRow;
  });
};

export const isDisabledColumn = (allData, sourceId) => {
  return !allData.some((d) => d[sourceId]);
};
