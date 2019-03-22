import React from 'react';
import { Link } from 'react-router-dom';
import * as d3 from 'd3';

import { OtTable, DataCircle, Tooltip } from 'ot-ui';

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
    renderCell: row => {
      const logH4H3 = row[t] && row[t].length > 0 && row[t][0].logH4H3;
      const qtlRadius = radiusScale(Math.abs(logH4H3));
      const qtlColor = logH4H3 > 0 ? 'blue' : 'red';
      return logH4H3 ? (
        <Tooltip title={`log(H4/H3): ${logH4H3.toPrecision(3)}`}>
          <span>
            <DataCircle radius={qtlRadius} colorScheme={qtlColor} />
          </span>
        </Tooltip>
      ) : null;
    },
  }));
  const dataByGene = uniqueGenes.map(g => ({
    ...g,
    ...uniqueTissues.reduce((acc, t) => {
      acc[t] = data
        .filter(
          d =>
            d.phenotypeEnsemblId === g.phenotypeEnsemblId && d.bioFeature === t
        )
        .map(d => ({ logH4H3: d.logH4H3 }));
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
      downloadFileStem={filenameStem}
    />
  );
};

export default ColocTable;
