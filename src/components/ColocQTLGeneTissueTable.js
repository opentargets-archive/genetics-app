import React from 'react';
import { Link } from 'react-router-dom';
import * as d3 from 'd3';

import { OtTable, DataCircle, Tooltip } from 'ot-ui';

const tissueComparator = t => (a, b) => {
  if (a[t] && b[t]) {
    return a[t].logH4H3 > b[t].logH4H3
      ? 1
      : a[t].logH4H3 === b[t].logH4H3
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
  const uniqueGenes = Object.values(
    data.reduce((acc, d) => {
      const { phenotypeEnsemblId, phenotypeSymbol } = d;
      acc[phenotypeEnsemblId] = { phenotypeEnsemblId, phenotypeSymbol };
      return acc;
    }, {})
  );
  const uniqueTissues = Object.keys(
    data.reduce((acc, d) => {
      acc[d.bioFeature] = true;
      return acc;
    }, {})
  );
  const [minVal, maxVal] = d3.extent(data, d => d.logH4H3);
  const absMax = Math.max(Math.abs(minVal), maxVal);
  const radiusScale = d3
    .scaleSqrt()
    .domain([0, absMax])
    .range([0, 6]);
  const tissueColumns = uniqueTissues.sort().map(t => ({
    id: t,
    label: t,
    verticalHeader: true,
    comparator: tissueComparator(t),
    renderCell: row => {
      if (!row[t]) {
        // no comparison made for this gene-tissue pair
        return null;
      }

      const { h3, h4, logH4H3, beta } = row[t];
      const qtlRadius = radiusScale(Math.abs(logH4H3));
      const qtlColor = logH4H3 > 0 ? 'blue' : 'red';
      return (
        <Tooltip
          title={`log(H4/H3): ${logH4H3.toPrecision(3)}, H3: ${h3.toPrecision(
            3
          )}, H4: ${h4.toPrecision(3)}, QTL beta: ${beta.toPrecision(3)}`}
        >
          <span>
            <DataCircle radius={qtlRadius} colorScheme={qtlColor} />
          </span>
        </Tooltip>
      );
    },
  }));
  const dataByGene = uniqueGenes.map(g => ({
    ...g,
    ...uniqueTissues.reduce((acc, t) => {
      const items = data
        .filter(
          d =>
            d.phenotypeEnsemblId === g.phenotypeEnsemblId && d.bioFeature === t
        )
        .map(d => ({ h3: d.h3, h4: d.h4, logH4H3: d.logH4H3, beta: d.beta }))
        .sort((a, b) => d3.descending(a.logH4H3, b.logH4H3));

      // there could be multiple loci for gene-tissue, so pick
      // by highest logH4H3 value
      acc[t] = items.length > 0 ? items[0] : null;
      return acc;
    }, {}),
  }));
  const geneColumn = {
    id: 'phenotypeEnsemblId',
    label: 'Gene',
    renderCell: d => (
      <Link to={`/gene/${d.phenotypeEnsemblId}`}>{d.phenotypeSymbol}</Link>
    ),
  };
  const tableColumns = [geneColumn, ...tissueColumns];
  return (
    <OtTable
      loading={loading}
      error={error}
      columns={tableColumns}
      data={dataByGene}
      sortBy="phenotypeSymbol"
      order="asc"
      verticalHeaders
      downloadFileStem={filenameStem}
    />
  );
};

export default ColocTable;
