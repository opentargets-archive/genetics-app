import React, { Component, Fragment } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import * as d3 from 'd3';

import {
  Link,
  DataDownloader,
  OtTableRF,
  Tabs,
  Tab,
  DataCircle,
  LabelHML,
  Tooltip,
  significantFigures,
  commaSeparate,
} from 'ot-ui';

import { pvalThreshold } from '../constants';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';
import generateComparator from '../utils/generateComparator';

const OVERVIEW = 'overview';

const radiusScale = d3
  .scaleSqrt()
  .domain([0, 1])
  .range([0, 6]);

const createDistanceCellRenderer = schema => {
  return rowData => {
    const distanceData = rowData[schema.sourceId];
    if (distanceData !== undefined) {
      const { distance } = distanceData.tissues[0];
      return <React.Fragment>{commaSeparate(distance)}</React.Fragment>;
    }
  };
};

const createDistanceAggregateCellRenderer = schema => {
  return rowData => {
    if (rowData.aggregated) {
      const { distance } = rowData.aggregated;
      return (
        <React.Fragment>
          {distance ? commaSeparate(distance) : null}
        </React.Fragment>
      );
    } else {
      return null;
    }
  };
};

const createQtlCellRenderer = schema => {
  return rowData => {
    if (rowData[schema.sourceId] !== undefined) {
      const circleRadius = radiusScale(rowData[schema.sourceId]);
      return <DataCircle radius={circleRadius} colorScheme="default" />;
    }
  };
};

const createAggregateCellRenderer = schema => {
  return rowData => {
    if (rowData.aggregated) {
      const circleRadius = radiusScale(rowData.aggregated.aggregatedScore);
      return <DataCircle radius={circleRadius} colorScheme="default" />;
    } else {
      return null;
    }
  };
};

const tissueColumnComparator = (a, b) =>
  a.label > b.label ? 1 : a.label === b.label ? 0 : -1;

const createIntervalCellRenderer = schema => {
  return rowData => {
    if (rowData[schema.sourceId] !== undefined) {
      const circleRadius = radiusScale(rowData[schema.sourceId]);
      return <DataCircle radius={circleRadius} colorScheme="default" />;
    }
  };
};

const createFPCellRenderer = schema => {
  return rowData => {
    const fpData = rowData[schema.sourceId];

    if (fpData !== undefined) {
      const { maxEffectLabel, maxEffectScore } = fpData.tissues[0];
      const level =
        0 <= maxEffectScore && maxEffectScore <= 1 / 3
          ? 'L'
          : 1 / 3 < maxEffectScore && maxEffectScore <= 2 / 3
            ? 'M'
            : 'H';
      return <LabelHML level={level}>{maxEffectLabel}</LabelHML>;
    }
  };
};

const createFPAggregateCellRenderer = schema => {
  return rowData => {
    const fpData = rowData.aggregated;

    if (fpData !== undefined) {
      const { maxEffectLabel, maxEffectScore } = fpData.tissues[0];
      const level =
        0 <= maxEffectScore && maxEffectScore <= 1 / 3
          ? 'L'
          : 1 / 3 < maxEffectScore && maxEffectScore <= 2 / 3
            ? 'M'
            : 'H';
      return <LabelHML level={level}>{maxEffectLabel}</LabelHML>;
    }
  };
};

const getColumnsAll = (genesForVariantSchema, genesForVariant) => {
  const overallScoreScale = d3
    .scaleSqrt()
    .domain([
      0,
      d3.max(genesForVariant, geneForVariant => geneForVariant.overallScore),
    ])
    .range([0, 6]);
  const columns = [
    {
      id: 'geneSymbol',
      label: 'Gene',
      renderCell: rowData => {
        return (
          <Link component={RouterLink} to={`/gene/${rowData.geneId}`}>
            {rowData.geneSymbol}
          </Link>
        );
      },
    },
    {
      id: 'overallScore',
      label: 'Overall V2G',
      renderCell: rowData => {
        const circleRadius = overallScoreScale(rowData.overallScore);
        return <DataCircle radius={circleRadius} colorScheme="bold" />;
      },
    },
    ...genesForVariantSchema.distances.map(schema => ({
      id: schema.sourceId,
      label: schema.sourceLabel,
      tooltip: schema.sourceDescriptionOverview,
      renderCell: createDistanceCellRenderer(schema),
      comparator: generateComparator(
        d =>
          d[schema.sourceId] && d[schema.sourceId].tissues[0].distance
            ? d[schema.sourceId].tissues[0].distance
            : null
      ),
    })),
    ...genesForVariantSchema.qtls.map(schema => ({
      id: schema.sourceId,
      label: schema.sourceLabel,
      tooltip: schema.sourceDescriptionOverview,
      renderCell: createQtlCellRenderer(schema),
    })),
    ...genesForVariantSchema.intervals.map(schema => ({
      id: schema.sourceId,
      label: schema.sourceLabel,
      tooltip: schema.sourceDescriptionOverview,
      renderCell: createIntervalCellRenderer(schema),
    })),
    ...genesForVariantSchema.functionalPredictions.map(schema => ({
      id: schema.sourceId,
      label: schema.sourceLabel,
      tooltip: schema.sourceDescriptionOverview,
      renderCell: createFPCellRenderer(schema),
    })),
  ];

  return columns;
};

const getDataAll = genesForVariant => {
  const data = [];
  genesForVariant.forEach(item => {
    const row = {
      geneId: item.gene.id,
      geneSymbol: item.gene.symbol,
      overallScore: item.overallScore,
    };
    // for distances we want to use the first element of
    // the distances array
    item.distances.forEach(distance => {
      row[distance.sourceId] = item.distances[0];
    });
    item.qtls.forEach(qtl => {
      row[qtl.sourceId] = qtl.aggregatedScore;
    });
    item.intervals.forEach(interval => {
      row[interval.sourceId] = interval.aggregatedScore;
    });
    // for functionalPredictions we want to use the first element of
    // the functionalPredictions array
    item.functionalPredictions.forEach(fp => {
      row[fp.sourceId] = item.functionalPredictions[0];
    });
    data.push(row);
  });
  return data;
};

const getDataAllDownload = tableData => {
  return tableData.map(row => {
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
          comparator: generateComparator(
            d =>
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
          comparator: generateComparator(
            d => (d.aggregated ? d.aggregated.aggregatedScore : null)
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
          comparator: generateComparator(
            d => (d.aggregated ? d.aggregated.aggregatedScore : null)
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
          // tooltip: schema.sourceDescriptionOverview,
          renderCell: createFPAggregateCellRenderer(schema),
          comparator: generateComparator(
            d => (d.aggregated ? d.aggregated.aggregatedScore : null)
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
        return (
          <Link component={RouterLink} to={`/gene/${rowData.geneId}`}>
            {rowData.geneSymbol}
          </Link>
        );
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
        const functionalPredictions = geneForVariant.functionalPredictions.filter(
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

const isDisabledColumn = (allData, sourceId) => {
  return !allData.some(d => d[sourceId]);
};

class AssociatedGenes extends Component {
  state = {
    value: OVERVIEW,
  };

  handleChange = (_, value) => {
    reportAnalyticsEvent({
      category: 'tabs',
      action: 'change-tab',
      label: `variant:associated-genes:${value}`,
    });
    this.setState({ value });
  };

  render() {
    const { value } = this.state;
    const { variantId, genesForVariantSchema, genesForVariant } = this.props;

    // Hardcoding the order and assuming qtls, intervals, and
    // functionalPredictions are the only fields in the schema
    const schemas = [
      ...genesForVariantSchema.distances.map(distanceSchema => ({
        ...distanceSchema,
        type: 'distances',
      })),
      ...genesForVariantSchema.qtls.map(qtlSchema => ({
        ...qtlSchema,
        type: 'qtls',
      })),
      ...genesForVariantSchema.intervals.map(intervalSchema => ({
        ...intervalSchema,
        type: 'intervals',
      })),
      ...genesForVariantSchema.functionalPredictions.map(fpSchema => ({
        ...fpSchema,
        type: 'functionalPredictions',
      })),
    ];

    const columnsAll = getColumnsAll(genesForVariantSchema, genesForVariant);
    const dataAll = getDataAll(genesForVariant);
    const dataAllDownload = getDataAllDownload(dataAll);

    const tabOverview = value === OVERVIEW && (
      <Fragment>
        <DataDownloader
          tableHeaders={columnsAll}
          rows={dataAllDownload}
          fileStem={`${variantId}-assigned-genes-summary`}
        />
        <OtTableRF
          message="Evidence summary linking this variant to different genes."
          sortBy="overallScore"
          order="desc"
          columns={columnsAll}
          data={dataAll}
          reportTableDownloadEvent={format => {
            reportAnalyticsEvent({
              category: 'table',
              action: 'download',
              label: `variant:associated-genes:overview:${format}`,
            });
          }}
          reportTableSortEvent={(sortBy, order) => {
            reportAnalyticsEvent({
              category: 'table',
              action: 'sort-column',
              label: `variant:associated-genes:overview:${sortBy}(${order})`,
            });
          }}
        />
      </Fragment>
    );

    const tabsTissues = schemas.map(schema => {
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
              reportTableDownloadEvent={format => {
                reportAnalyticsEvent({
                  category: 'table',
                  action: 'download',
                  label: `variant:associated-genes:${
                    schema.sourceId
                  }:${format}`,
                });
              }}
              reportTableSortEvent={(sortBy, order) => {
                reportAnalyticsEvent({
                  category: 'table',
                  action: 'sort-column',
                  label: `variant:associated-genes:${
                    schema.sourceId
                  }:${sortBy}(${order})`,
                });
              }}
            />
          </Fragment>
        )
      );
    });

    const tabs = (
      <Tabs variant="scrollable" value={value} onChange={this.handleChange}>
        <Tab label="Summary" value={OVERVIEW} />
        {schemas.map(schema => {
          return (
            <Tab
              key={schema.sourceId}
              value={schema.sourceId}
              label={schema.sourceLabel}
              disabled={isDisabledColumn(dataAll, schema.sourceId)}
            />
          );
        })}
      </Tabs>
    );
    return (
      <Fragment>
        {tabs}
        {tabOverview}
        {tabsTissues}
      </Fragment>
    );
  }
}

export default AssociatedGenes;
