import React from 'react';
import { extent, scaleSqrt, ascending } from 'd3';

import { Link, DataCircle, Tooltip } from '../../ot-ui-components';
import { tissueComparator } from './utils';

const getTissueColumns = (data, uniqueTissues) => {
  const tissueThresholdValue = 7;
  const [minVal, maxVal] = extent(data, d => d.log2h4h3);
  const absMax = Math.min(
    tissueThresholdValue,
    Math.max(Math.abs(minVal), maxVal)
  );
  const radiusScale = scaleSqrt().domain([0, absMax]).range([0, 6]);
  return uniqueTissues
    .sort((a, b) => ascending(a.name, b.name))
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

        const { h3, h4, log2h4h3, beta, splice } = row[t.id];

        const qtlRadius = radiusScale(
          Math.min(tissueThresholdValue, Math.abs(log2h4h3))
        );

        const qtlColor = log2h4h3 > 0 ? 'blue' : 'red';

        const tooltipText = `log2(H4/H3): ${log2h4h3.toPrecision(
          3
        )}, H3: ${h3.toPrecision(3)}, H4: ${h4.toPrecision(3)}, QTL beta: ${
          beta ? beta.toPrecision(3) : 'N/A'
        }${splice ? `, splice: ${splice}` : ''}`;

        return (
          <Tooltip title={tooltipText}>
            <span>
              <DataCircle radius={qtlRadius} colorScheme={qtlColor} />
            </span>
          </Tooltip>
        );
      },
    }));
};

export const getTableColumns = (data, uniqueTissues) => {
  const geneColumn = {
    id: 'gene.symbol',
    label: 'Gene',
    comparator: (a, b) => ascending(a.gene.symbol, b.gene.symbol),
    renderCell: d => <Link to={`/gene/${d.gene.id}`}>{d.gene.symbol}</Link>,
  };
  const phenotypeIdColumn = {
    id: 'gene.id',
    label: 'Molecular trait',
    comparator: (a, b) => ascending(a.gene.id, b.gene.id),
    renderCell: d => <span>{d.gene.id}</span>,
  };
  const studyColumn = {
    id: 'qtlStudyName',
    label: 'Source',
  };
  return [
    geneColumn,
    phenotypeIdColumn,
    studyColumn,
    ...getTissueColumns(data, uniqueTissues),
  ];
};
