import React, { Fragment } from 'react';
import {
  DataDownloader,
  OtTableRF,
  Link,
  Tooltip,
  DataCircle,
  significantFigures,
} from '../../../ot-ui-components';

import {
  createDistanceAggregateCellRenderer,
  createAggregateCellRenderer,
  createFPAggregateCellRenderer,
} from './Renderes';

import { radiusScale } from './utils';
import { generateComparator } from '../../../utils';
import { pvalThreshold } from '../../../constants';

const getTissueColumns = (schema, genesForVariantSchema, genesForVariant) => {
  let tissueColumns = [];
  let aggregateColumns = [];

  switch (schema.type) {
    case 'distances':
      aggregateColumns = genesForVariantSchema.distances
        .filter(distance => distance.sourceId === schema.sourceId)
        .map(schema => ({
          id: 'aggregated',
          label: `${schema.sourceLabel}`,
          renderCell: createDistanceAggregateCellRenderer(schema),
          comparator: generateComparator(d =>
            d.aggregated ? d.aggregated.distance : Number.MAX_SAFE_INTEGER
          ),
        }));
      break;
    case 'qtls':
      aggregateColumns = genesForVariantSchema.qtls
        .filter(qtl => qtl.sourceId === schema.sourceId)
        .map(schema => ({
          id: 'aggregated',
          label: `${schema.sourceLabel} aggregated`,
          renderCell: createAggregateCellRenderer(schema),
          comparator: generateComparator(d =>
            d.aggregated ? d.aggregated.aggregatedScore : null
          ),
        }));
      tissueColumns = schema.tissues
        .map(tissue => {
          return {
            id: tissue.id,
            label: tissue.name,
            verticalHeader: true,
            renderCell: rowData => {
              if (rowData[tissue.id]) {
                const { quantile, beta, pval } = rowData[tissue.id];
                const qtlRadius = radiusScale(quantile);
                const qtlColor = beta < 0 ? 'red' : 'blue';
                return (
                  <Tooltip
                    title={`Beta: ${beta.toPrecision(3)} pval: ${
                      pval < pvalThreshold
                        ? `<${pvalThreshold}`
                        : significantFigures(pval)
                    }`}
                  >
                    <span>
                      <DataCircle radius={qtlRadius} colorScheme={qtlColor} />
                    </span>
                  </Tooltip>
                );
              }
            },
          };
        })
        .sort(tissueColumnComparator);
      break;
    case 'intervals':
      aggregateColumns = genesForVariantSchema.intervals
        .filter(interval => interval.sourceId === schema.sourceId)
        .map(schema => ({
          id: 'aggregated',
          label: `${schema.sourceLabel} aggregated`,
          renderCell: createAggregateCellRenderer(schema),
          comparator: generateComparator(d =>
            d.aggregated ? d.aggregated.aggregatedScore : null
          ),
        }));
      tissueColumns = schema.tissues
        .map(tissue => {
          return {
            id: tissue.id,
            label: tissue.name,
            verticalHeader: true,
            renderCell: rowData => {
              if (rowData[tissue.id]) {
                const intervalRadius = radiusScale(rowData[tissue.id]);
                return (
                  <Tooltip title={`quantile: ${rowData[tissue.id]}`}>
                    <span>
                      <DataCircle
                        radius={intervalRadius}
                        colorScheme="default"
                      />
                    </span>
                  </Tooltip>
                );
              }
            },
          };
        })
        .sort(tissueColumnComparator);
      break;
    case 'functionalPredictions':
      aggregateColumns = genesForVariantSchema.functionalPredictions
        .filter(
          functionalPrediction =>
            functionalPrediction.sourceId === schema.sourceId
        )
        .map(schema => ({
          id: 'aggregated',
          label: `${schema.sourceLabel}`,
          renderCell: createFPAggregateCellRenderer(schema),
          comparator: generateComparator(d =>
            d.aggregated ? d.aggregated.aggregatedScore : null
          ),
        }));
      break;
    default:
      break;
  }
  const columns = [
    {
      id: 'geneSymbol',
      label: 'Gene',
      renderCell: rowData => {
        return <Link to={`/gene/${rowData.geneId}`}>{rowData.geneSymbol}</Link>;
      },
    },
    ...aggregateColumns,
    ...tissueColumns,
  ];
  return columns;
};

const getTissueData = (schema, genesForVariantSchema, genesForVariant) => {
  const data = [];

  genesForVariant.forEach(geneForVariant => {
    let aggregated = null;

    switch (schema.type) {
      case 'distances':
        const distances = geneForVariant.distances.filter(
          distance => distance.sourceId === schema.sourceId
        );
        if (distances.length === 1) {
          aggregated = distances[0].tissues[0];
        }
        break;
      case 'qtls':
        const qtls = geneForVariant.qtls.filter(
          qtl => qtl.sourceId === schema.sourceId
        );
        if (qtls.length === 1) {
          aggregated = qtls[0];
        }
        break;
      case 'intervals':
        const intervals = geneForVariant.intervals.filter(
          interval => interval.sourceId === schema.sourceId
        );
        if (intervals.length === 1) {
          aggregated = intervals[0];
        }
        break;
      case 'functionalPredictions':
        const functionalPredictions =
          geneForVariant.functionalPredictions.filter(
            functionalPrediction =>
              functionalPrediction.sourceId === schema.sourceId
          );
        if (functionalPredictions.length === 1) {
          aggregated = functionalPredictions[0];
        }
        break;
      default:
        break;
    }

    const row = {
      geneId: geneForVariant.gene.id,
      geneSymbol: geneForVariant.gene.symbol,
    };
    if (aggregated) {
      row.aggregated = aggregated;
    }
    const element = geneForVariant[schema.type].find(
      item => item.sourceId === schema.sourceId
    );

    if (element) {
      element.tissues.forEach(elementTissue => {
        if (elementTissue.__typename === 'DistanceTissue') {
          row[elementTissue.tissue.id] = {
            quantile: elementTissue.quantile,
            distance: elementTissue.distance,
          };
        } else if (elementTissue.__typename === 'FPredTissue') {
          row[elementTissue.tissue.id] = elementTissue.maxEffectLabel;
        } else if (elementTissue.__typename === 'IntervalTissue') {
          row[elementTissue.tissue.id] = elementTissue.quantile;
        } else if (elementTissue.__typename === 'QTLTissue') {
          row[elementTissue.tissue.id] = {
            quantile: elementTissue.quantile,
            beta: elementTissue.beta,
            pval: elementTissue.pval,
          };
        }
      });
    }

    data.push(row);
  });
  return data;
};

const getTissueDataDownload = (schema, tableData) => {
  if (schema.type === 'distances') {
    return tableData.map(row => {
      const newRow = { geneSymbol: row.geneSymbol };
      if (row.aggregated) {
        newRow.aggregated = row.aggregated.distance;
      }
      return newRow;
    });
  }

  if (schema.type === 'qtls' || schema.type === 'intervals') {
    return tableData.map(row => {
      const newRow = { geneSymbol: row.geneSymbol };
      if (row.aggregated) {
        newRow.aggregated = row.aggregated.aggregatedScore;
      }
      schema.tissues.forEach(tissue => {
        if (row[tissue.id]) {
          newRow[tissue.id] = row[tissue.id].quantile
            ? row[tissue.id].quantile
            : row[tissue.id];
        }
      });
      return newRow;
    });
  }

  return tableData.map(row => {
    const newRow = { geneSymbol: row.geneSymbol };
    if (row.aggregated) {
      newRow.aggregated = row.aggregated.tissues[0].maxEffectLabel;
    }
    return newRow;
  });
};

const tissueColumnComparator = (a, b) =>
  a.label > b.label ? 1 : a.label === b.label ? 0 : -1;

export const TabIssues = ({
  schemas,
  value,
  variantId,
  genesForVariantSchema,
  genesForVariant,
}) =>
  schemas.map(schema => {
    const tableColumns = getTissueColumns(
      schema,
      genesForVariantSchema,
      genesForVariant
    );

    const tableData = getTissueData(
      schema,
      genesForVariantSchema,
      genesForVariant
    );

    const tissueDataDownload = getTissueDataDownload(schema, tableData);

    return (
      value === schema.sourceId && (
        <Fragment key={schema.sourceId}>
          <DataDownloader
            tableHeaders={tableColumns}
            rows={tissueDataDownload}
            fileStem={`${variantId}-assigned-genes-${schema.sourceLabel}`}
          />
          <OtTableRF
            message={schema.sourceDescriptionBreakdown}
            sortBy={'aggregated'}
            order={schema.type === 'distances' ? 'asc' : 'desc'}
            verticalHeaders
            columns={tableColumns}
            data={tableData}
          />
        </Fragment>
      )
    );
  });
