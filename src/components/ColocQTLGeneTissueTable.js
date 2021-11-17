import React from 'react';
import * as d3 from 'd3';

import { Link, OtTableRF, DataCircle, Tooltip } from '../ot-ui-components';

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

const ColocTable = ({ loading, error, fileStem, data }) => {
  const uniqueStudyGenePhenotypes = data.reduce((acc, d) => {
    const { phenotypeId, gene, qtlStudyName } = d;
    acc[`${qtlStudyName}__${gene.id}__${phenotypeId}`] = {
      phenotypeId,
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
  const tissueThresholdValue = 7;
  const [minVal, maxVal] = d3.extent(data, d => d.log2h4h3);
  const absMax = Math.min(
    tissueThresholdValue,
    Math.max(Math.abs(minVal), maxVal)
  );
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
        const qtlRadius = radiusScale(
          Math.min(tissueThresholdValue, Math.abs(log2h4h3))
        );
        const qtlColor = log2h4h3 > 0 ? 'blue' : 'red';
        return (
          <Tooltip
            title={`log2(H4/H3): ${log2h4h3.toPrecision(
              3
            )}, H3: ${h3.toPrecision(3)}, H4: ${h4.toPrecision(3)}, QTL beta: ${
              beta ? beta.toPrecision(3) : 'N/A'
            }`}
          >
            <span>
              <DataCircle radius={qtlRadius} colorScheme={qtlColor} />
            </span>
          </Tooltip>
        );
      },
    }));
  const dataByPhenotypeId = uniquePhenotypeIds.map(
    ({ phenotypeId, gene, qtlStudyName }) => ({
      phenotypeId,
      gene,
      qtlStudyName,
      ...uniqueTissues.reduce((acc, t) => {
        const items = data
          .filter(
            d =>
              d.phenotypeId === phenotypeId &&
              d.gene.id === gene.id &&
              d.qtlStudyName === qtlStudyName &&
              d.tissue.id === t.id
          )
          .map(d => ({
            h3: d.h3,
            h4: d.h4,
            log2h4h3: d.log2h4h3,
            beta: d.beta,
          }))
          .sort((a, b) => d3.descending(a.log2h4h3, b.log2h4h3));

        // there could be multiple loci for gene-tissue, so pick
        // by highest log2h4h3 value (this should not happen due
        // to deduplication on index variants)
        if (items.length > 1) {
          console.info(
            `Multiple entries found: ${
              gene.symbol
            }, ${qtlStudyName}, ${phenotypeId}`,
            items
          );
        }
        acc[t.id] = items.length > 0 ? items[0] : null;
        return acc;
      }, {}),
    })
  );
  const geneColumn = {
    id: 'gene.symbol',
    label: 'Gene',
    comparator: (a, b) => d3.ascending(a.gene.symbol, b.gene.symbol),
    renderCell: d => <Link to={`/gene/${d.gene.id}`}>{d.gene.symbol}</Link>,
  };
  const phenotypeIdColumn = {
    id: 'phenotypeId',
    label: 'Molecular trait',
  };
  const studyColumn = {
    id: 'qtlStudyName',
    label: 'Source',
  };
  const tableColumns = [
    geneColumn,
    phenotypeIdColumn,
    studyColumn,
    ...tissueColumns,
  ];
  return (
    <OtTableRF
      loading={loading}
      error={error}
      columns={tableColumns}
      data={dataByPhenotypeId}
      sortBy="gene.symbol"
      order="asc"
      verticalHeaders
    />
  );
};

export default ColocTable;
