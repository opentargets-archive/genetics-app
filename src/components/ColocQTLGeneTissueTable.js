import React from 'react';
import { Link } from 'react-router-dom';
import * as d3 from 'd3';

import { OtTable, DataCircle, Tooltip } from 'ot-ui';

import GENE_MAPPING from '../mock-data/gene-mappings.json';

const GENE_PHENOTYPE_LOOKUP = GENE_MAPPING.reduce((acc, d) => {
  acc[d.phenotype] = d;
  return acc;
}, {});

const ColocTable = ({ loading, error, filenameStem, data }) => {
  const uniqueGenes = Object.keys(
    data.reduce((acc, d) => {
      acc[d.phenotype] = true;
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
    phenotype: g,
    ...uniqueTissues.reduce((acc, t) => {
      acc[t] = data
        .filter(d => d.phenotype === g && d.bioFeature === t)
        .map(d => ({ logH4H3: d.logH4H3 }));
      return acc;
    }, {}),
  }));
  const geneColumn = {
    id: 'phenotype',
    label: 'Gene',
    renderCell: d => {
      if (d.phenotype && d.phenotype.startsWith('ILMN_')) {
        // TODO: improve coverage of ensgId => symbol
        const { ensgId, symbol } = GENE_PHENOTYPE_LOOKUP[d.phenotype];
        return <Link to={`/gene/${ensgId}`}>{symbol}</Link>;
      } else {
        return <Link to={`/gene/${d.phenotype}`}>{d.phenotype}</Link>;
      }
    },
  };
  const tableColumns = [geneColumn, ...tissueColumns];
  return (
    <OtTable
      loading={loading}
      error={error}
      columns={tableColumns}
      data={dataByGene}
      sortBy="phenotype"
      order="desc"
      downloadFileStem={filenameStem}
    />
  );
};

export default ColocTable;
