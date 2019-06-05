import React from 'react';
import * as d3 from 'd3';

import { Link, OtTable, DataCircle, Tooltip } from 'ot-ui';

const tissueComparator = t => (a, b) => {
  if (a[t] && b[t]) {
    return a[t].log2h4h3 > b[t].log2h4h3
      ? 1
      : a[t].log2h4h3 === b[t].log2h4h3
        ? 0
        : -1;
  } else if (a[t] && !b[t]) {
    return 1;
  } else if (!a[t] && b[t]) {
    return -1;
  } else {
    return 0;
  }
};

const ColocTable = ({ loading, error, filenameStem, data }) => {
  const uniquePhenotypeIds = Object.values(
    data.reduce((acc, d) => {
      const { phenotypeId, gene } = d;
      acc[phenotypeId] = { phenotypeId, gene };
      return acc;
    }, {})
  );
  const uniqueTissues = Object.values(
    data.reduce((acc, d) => {
      acc[d.tissue.id] = d.tissue;
      return acc;
    }, {})
  );
  const [minVal, maxVal] = d3.extent(data, d => d.log2h4h3);
  const absMax = Math.max(Math.abs(minVal), maxVal);
  const radiusScale = d3
    .scaleSqrt()
    .domain([0, absMax])
    .range([0, 6]);
  const tissueColumns = uniqueTissues
    .sort((a, b) => d3.ascending(a.name, b.name))
    .map(t => ({
      id: t.id,
      label: t.name,
      verticalHeader: true,
      comparator: tissueComparator(t.id),
      renderCell: row => {
        if (!row[t.id]) {
          // no comparison made for this gene-tissue pair
          return null;
        }

        const { h3, h4, log2h4h3, beta } = row[t.id];
        const qtlRadius = radiusScale(Math.abs(log2h4h3));
        const qtlColor = log2h4h3 > 0 ? 'blue' : 'red';
        return (
          <Tooltip
            title={`log2(H4/H3): ${log2h4h3.toPrecision(
              3
            )}, H3: ${h3.toPrecision(3)}, H4: ${h4.toPrecision(
              3
            )}, QTL beta: ${beta.toPrecision(3)}`}
          >
            <span>
              <DataCircle radius={qtlRadius} colorScheme={qtlColor} />
            </span>
          </Tooltip>
        );
      },
    }));
  const dataByPhenotypeId = uniquePhenotypeIds.map(({ phenotypeId, gene }) => ({
    phenotypeId,
    gene,
    ...uniqueTissues.reduce((acc, t) => {
      const items = data
        .filter(d => d.phenotypeId === phenotypeId && d.tissue.id === t.id)
        .map(d => ({ h3: d.h3, h4: d.h4, log2h4h3: d.log2h4h3, beta: d.beta }))
        .sort((a, b) => d3.descending(a.log2h4h3, b.log2h4h3));

      // there could be multiple loci for gene-tissue, so pick
      // by highest log2h4h3 value
      acc[t.id] = items.length > 0 ? items[0] : null;
      return acc;
    }, {}),
  }));
  const geneColumn = {
    id: 'gene.symbol',
    label: 'Gene',
    renderCell: d => <Link to={`/gene/${d.gene.id}`}>{d.gene.symbol}</Link>,
  };
  const phenotypeIdColumn = {
    id: 'phenotypeId',
    label: 'Phenotype',
  };
  const tableColumns = [geneColumn, phenotypeIdColumn, ...tissueColumns];
  return (
    <OtTable
      loading={loading}
      error={error}
      columns={tableColumns}
      data={dataByPhenotypeId}
      sortBy="gene.symbol"
      order="asc"
      verticalHeaders
      downloadFileStem={filenameStem}
    />
  );
};

export default ColocTable;
