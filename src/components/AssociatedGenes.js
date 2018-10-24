import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import * as d3 from 'd3';

import {
  OtTable,
  Tabs,
  Tab,
  DataCircle,
  LabelHML,
  Tooltip,
  significantFigures,
} from 'ot-ui';

import { pvalThreshold } from '../constants';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';

const OVERVIEW = 'overview';

const radiusScale = d3
  .scaleSqrt()
  .domain([0, 1])
  .range([0, 6]);

const createQtlCellRenderer = schema => {
  return rowData => {
    if (rowData[schema.sourceId] !== undefined) {
      const circleRadius = radiusScale(rowData[schema.sourceId]);
      return <DataCircle radius={circleRadius} colorScheme="default" />;
    }
  };
};

const tissueComparator = (a, b) =>
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
        return <Link to={`/gene/${rowData.geneId}`}>{rowData.geneSymbol}</Link>;
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

const getTissueColumns = (schema, genesForVariant) => {
  let tissueColumns;

  switch (schema.type) {
    case 'qtls':
      tissueColumns = schema.tissues
        .map(tissue => {
          return {
            id: tissue.id,
            label: tissue.name,
            verticalHeader: true,
            renderCell: rowData => {
              if (rowData[tissue.id]) {
                const qtlRadius = radiusScale(rowData[tissue.id]);
                const { beta, pval } = rowData;
                const qtlColor = beta > 0 ? 'red' : 'blue';
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
        .sort(tissueComparator);
      break;
    case 'intervals':
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
        .sort(tissueComparator);
      break;
    case 'functionalPredictions':
    default:
      tissueColumns = schema.tissues
        .map(tissue => {
          return {
            id: tissue.id,
            label: tissue.name,
            verticalHeader: true,
            renderCell: rowData => {
              if (rowData[tissue.id]) {
                return rowData[tissue.id];
              }
            },
          };
        })
        .sort(tissueComparator);
  }
  const columns = [
    {
      id: 'geneSymbol',
      label: 'Gene',
      renderCell: rowData => {
        return <Link to={`/gene/${rowData.geneId}`}>{rowData.geneSymbol}</Link>;
      },
    },
    ...tissueColumns,
  ];
  return columns;
};

const getTissueData = (schema, genesForVariant) => {
  const data = [];

  genesForVariant.forEach(geneForVariant => {
    const row = {
      geneId: geneForVariant.gene.id,
      geneSymbol: geneForVariant.gene.symbol,
    };
    const element = geneForVariant[schema.type].find(
      item => item.sourceId === schema.sourceId
    );

    if (element) {
      element.tissues.forEach(elementTissue => {
        // add beta and pval when qtl for rendering
        if (elementTissue.__typename === 'QTLTissue') {
          row.beta = elementTissue.beta;
          row.pval = elementTissue.pval;
        }
        row[elementTissue.tissue.id] =
          elementTissue.__typename === 'FPredTissue'
            ? elementTissue.maxEffectLabel
            : elementTissue.quantile;
      });
    }

    data.push(row);
  });
  return data;
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
    const { genesForVariantSchema, genesForVariant } = this.props;

    // Hardcoding the order and assuming qtls, intervals, and
    // functionalPredictions are the only fields in the schema
    const schemas = [
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

    const tabOverview = value === OVERVIEW && (
      <OtTable
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
    );

    const tabsTissues = schemas.map(schema => {
      return (
        value === schema.sourceId && (
          <OtTable
            message={schema.sourceDescriptionBreakdown}
            verticalHeaders
            key={schema.sourceId}
            columns={getTissueColumns(schema, genesForVariant)}
            data={getTissueData(schema, genesForVariant)}
            reportTableDownloadEvent={format => {
              reportAnalyticsEvent({
                category: 'table',
                action: 'download',
                label: `variant:associated-genes:${schema.sourceId}:${format}`,
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
        )
      );
    });

    const tabs = (
      <Tabs scrollable value={value} onChange={this.handleChange}>
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
