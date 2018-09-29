import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import * as d3 from 'd3';

import { OtTable, Tabs, Tab, DataCircle, LabelHML, Tooltip } from 'ot-ui';

import { pvalThreshold } from '../constants';

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

const createIntervalCellRenderer = schema => {
  return rowData => {
    if (rowData[schema.sourceId] !== undefined) {
      const circleRadius = radiusScale(rowData[schema.sourceId]);
      return <DataCircle radius={circleRadius} colorScheme="default" />;
    }
  };
};

const createFPCellRenderer = genesForVariant => {
  return rowData => {
    const gene = genesForVariant.find(
      geneForVariant => geneForVariant.gene.symbol === rowData.geneSymbol
    );

    if (gene.functionalPredictions.length === 1) {
      const {
        maxEffectLabel,
        maxEffectScore,
      } = gene.functionalPredictions[0].tissues[0];
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
        const geneId = genesForVariant.find(
          geneForVariant => geneForVariant.gene.symbol === rowData.geneSymbol
        ).gene.id;
        return <Link to={`/gene/${geneId}`}>{rowData.geneSymbol}</Link>;
      },
    },
    {
      id: 'overallScore',
      label: 'Overall G2V',
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
      renderCell: createFPCellRenderer(genesForVariant),
    })),
  ];

  return columns;
};

const getDataAll = genesForVariant => {
  const data = [];
  genesForVariant.forEach(item => {
    const row = {
      geneSymbol: item.gene.symbol,
      overallScore: item.overallScore,
    };
    item.qtls.forEach(qtl => {
      row[qtl.sourceId] = qtl.aggregatedScore;
    });
    item.intervals.forEach(interval => {
      row[interval.sourceId] = interval.aggregatedScore;
    });
    item.functionalPredictions.forEach(fp => {
      row[fp.sourceId] = fp.aggregatedScore;
    });
    data.push(row);
  });
  return data;
};

const getTissueColumns = (genesForVariantSchema, genesForVariant, sourceId) => {
  const schema = [
    ...genesForVariantSchema.qtls.map(qtl => ({ ...qtl, type: 'qtls' })),
    ...genesForVariantSchema.intervals.map(interval => ({
      ...interval,
      type: 'intervals',
    })),
    ...genesForVariantSchema.functionalPredictions.map(fp => ({
      ...fp,
      type: 'functionalPredictions',
    })),
  ].find(schema => schema.sourceId === sourceId);

  let tissueColumns;

  switch (schema.type) {
    case 'qtls':
      tissueColumns = schema.tissues.map(tissue => {
        return {
          id: tissue.id,
          label: tissue.name,
          renderCell: rowData => {
            if (rowData[tissue.id]) {
              const qtlRadius = radiusScale(rowData[tissue.id]);
              const { beta, pval } = findValues(
                genesForVariant,
                rowData.geneSymbol,
                schema.sourceId,
                tissue.id
              );
              const qtlColor = beta > 0 ? 'red' : 'blue';
              return (
                <Tooltip
                  title={`Beta: ${beta.toPrecision(3)} pval: ${
                    pval < pvalThreshold
                      ? `<${pvalThreshold}`
                      : pval.toPrecision(3)
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
      });
      break;
    case 'intervals':
      tissueColumns = schema.tissues.map(tissue => {
        return {
          id: tissue.id,
          label: tissue.name,
          renderCell: rowData => {
            if (rowData[tissue.id]) {
              const intervalRadius = radiusScale(rowData[tissue.id]);
              return (
                <Tooltip title={`quantile: ${rowData[tissue.id]}`}>
                  <span>
                    <DataCircle radius={intervalRadius} colorScheme="default" />
                  </span>
                </Tooltip>
              );
            }
          },
        };
      });
      break;
    case 'functionalPredictions':
    default:
      tissueColumns = schema.tissues.map(tissue => {
        return {
          id: tissue.id,
          label: tissue.name,
          renderCell: rowData => {
            if (rowData[tissue.id]) {
              return rowData[tissue.id];
            }
          },
        };
      });
  }
  const columns = [
    {
      id: 'geneSymbol',
      label: 'Gene',
      renderCell: rowData => {
        const geneId = genesForVariant.find(
          geneForVariant => geneForVariant.gene.symbol === rowData.geneSymbol
        ).gene.id;
        return <Link to={`/gene/${geneId}`}>{rowData.geneSymbol}</Link>;
      },
    },
    ...tissueColumns,
  ];
  return columns;
};

const findValues = (genesForVariant, geneSymbol, sourceId, tissueId) => {
  const gene = genesForVariant.find(
    geneForVariant => geneForVariant.gene.symbol === geneSymbol
  );
  const qtl = gene.qtls.find(qtl => qtl.sourceId === sourceId);
  const tissue = qtl.tissues.find(tissue => tissue.tissue.id === tissueId);
  return {
    beta: tissue.beta,
    pval: tissue.pval,
  };
};

const getTissueData = (genesForVariantSchema, genesForVariant, sourceId) => {
  const data = [];
  let searchField;

  genesForVariantSchema.qtls.forEach(qtl => {
    if (qtl.sourceId === sourceId) {
      searchField = 'qtls';
    }
  });

  !searchField &&
    genesForVariantSchema.intervals.forEach(interval => {
      if (interval.sourceId === sourceId) {
        searchField = 'intervals';
      }
    });

  !searchField &&
    genesForVariantSchema.functionalPredictions.forEach(fp => {
      if (fp.sourceId === sourceId) {
        searchField = 'functionalPredictions';
      }
    });

  genesForVariant.forEach(geneForVariant => {
    const row = { geneSymbol: geneForVariant.gene.symbol };
    const element = geneForVariant[searchField].find(
      item => item.sourceId === sourceId
    );

    if (element) {
      element.tissues.forEach(elementTissue => {
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

class AssociatedGenes extends Component {
  state = {
    value: OVERVIEW,
  };

  handleChange = (_, value) => {
    this.setState({ value });
  };

  render() {
    const { value } = this.state;
    const { genesForVariantSchema, genesForVariant } = this.props;

    // Hardcoding the order and assuming qtls, intervals, and
    // functionalPredictions are the only fields in the schema
    const schemas = [
      ...genesForVariantSchema.qtls,
      ...genesForVariantSchema.intervals,
      ...genesForVariantSchema.functionalPredictions,
    ];

    const columnsAll = getColumnsAll(genesForVariantSchema, genesForVariant);
    const dataAll = getDataAll(genesForVariant);

    return (
      <Fragment>
        <Tabs scrollable value={value} onChange={this.handleChange}>
          <Tab label="Summary" value={OVERVIEW} />
          {schemas.map(schema => {
            return (
              <Tab
                key={schema.sourceId}
                value={schema.sourceId}
                label={schema.sourceLabel}
              />
            );
          })}
        </Tabs>
        {value === OVERVIEW && (
          <OtTable
            message="Evidence summary linking this variant to different genes."
            columns={columnsAll}
            data={dataAll}
          />
        )}
        {schemas.map(schema => {
          return (
            value === schema.sourceId && (
              <OtTable
                message={schema.sourceDescriptionBreakdown}
                verticalHeaders
                key={schema.sourceId}
                columns={getTissueColumns(
                  genesForVariantSchema,
                  genesForVariant,
                  schema.sourceId
                )}
                data={getTissueData(
                  genesForVariantSchema,
                  genesForVariant,
                  schema.sourceId
                )}
              />
            )
          );
        })}
      </Fragment>
    );
  }
}

export default AssociatedGenes;
