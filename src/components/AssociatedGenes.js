import React, { Component, Fragment } from 'react';
import * as d3 from 'd3';
import { withStyles } from '@material-ui/core/styles';

import { OtTable, Tabs, Tab, DataCircle, LabelHML } from 'ot-ui';

const OVERVIEW = 'overview';

const radiusScale = d3
  .scaleSqrt()
  .domain([0, 1])
  .range([0, 6]);

const createQtlCellRenderer = (schema, classes) => {
  return rowData => {
    if (rowData[schema.sourceId] !== undefined) {
      const circleRadius = radiusScale(rowData[schema.sourceId]);
      return <DataCircle radius={circleRadius} colorScheme="default" />;
    }
  };
};

const createIntervalCellRenderer = (schema, classes) => {
  return rowData => {
    if (rowData[schema.sourceId] !== undefined) {
      const circleRadius = radiusScale(rowData[schema.sourceId]);
      return <DataCircle radius={circleRadius} colorScheme="default" />;
    }
  };
};

const createFPCellRenderer = (genesForVariant, classes) => {
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

const getColumnsAll = (genesForVariantSchema, genesForVariant, classes) => {
  const overallScoreScale = d3
    .scaleSqrt()
    .domain([
      0,
      d3.max(genesForVariant, geneForVariant => geneForVariant.overallScore),
    ])
    .range([0, 6]);
  const columns = [
    { id: 'geneSymbol', label: 'Gene' },
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
      label: schema.sourceId,
      renderCell: createQtlCellRenderer(schema, classes),
    })),
    ...genesForVariantSchema.intervals.map(schema => ({
      id: schema.sourceId,
      label: schema.sourceId,
      renderCell: createIntervalCellRenderer(schema, classes),
    })),
    ...genesForVariantSchema.functionalPredictions.map(schema => ({
      id: schema.sourceId,
      label: schema.sourceId,
      renderCell: createFPCellRenderer(genesForVariant, classes),
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

const getTissueColumns = (
  genesForVariantSchema,
  genesForVariant,
  sourceId,
  classes
) => {
  const columns = [{ id: 'geneSymbol', label: 'Gene' }];
  let type;
  let schema;

  genesForVariantSchema.qtls.forEach(s => {
    if (s.sourceId === sourceId) {
      type = 'qtls';
      schema = s;
    }
  });

  !schema &&
    genesForVariantSchema.intervals.forEach(s => {
      if (s.sourceId === sourceId) {
        type = 'intervals';
        schema = s;
      }
    });

  !schema &&
    genesForVariantSchema.functionalPredictions.forEach(s => {
      if (s.sourceId === sourceId) {
        type = 'functionalPredictions';
        schema = s;
      }
    });

  schema.tissues.forEach(tissue => {
    columns.push({
      id: tissue.id,
      label: tissue.name,
      renderCell: rowData => {
        if (rowData[tissue.id]) {
          switch (type) {
            case 'qtls':
              const qtlRadius = radiusScale(rowData[tissue.id]);
              const beta = findBeta(
                genesForVariant,
                rowData.geneSymbol,
                schema.sourceId,
                tissue.id
              );
              const qtlColor = beta > 0 ? 'red' : 'blue';
              return <DataCircle radius={qtlRadius} colorScheme={qtlColor} />;
            case 'intervals':
              const intervalRadius = radiusScale(rowData[tissue.id]);
              return (
                <DataCircle radius={intervalRadius} colorScheme="default" />
              );
            case 'functionalPredictions':
            default:
              return rowData[tissue.id];
          }
        }
      },
    });
  });

  return columns;
};

const findBeta = (genesForVariant, geneSymbol, sourceId, tissueId) => {
  const gene = genesForVariant.find(
    geneForVariant => geneForVariant.gene.symbol === geneSymbol
  );
  const qtl = gene.qtls.find(qtl => qtl.sourceId === sourceId);
  const tissue = qtl.tissues.find(tissue => tissue.tissue.id === tissueId);
  return tissue.beta;
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

const styles = theme => {
  return {
    overallScoreCircle: {
      fill: theme.palette.grey[600],
    },
    qtlIntervalCircle: {
      fill: theme.palette.grey[500],
    },
    positiveBeta: {
      fill: theme.palette.secondary.main,
    },
    negativeBeta: {
      fill: theme.palette.primary.main,
    },
  };
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
    const { genesForVariantSchema, genesForVariant, classes } = this.props;

    // Hardcoding the order and assuming qtls, intervals, and
    // functionalPredictions are the only fields in the schema
    const schemas = [
      ...genesForVariantSchema.qtls,
      ...genesForVariantSchema.intervals,
      ...genesForVariantSchema.functionalPredictions,
    ];

    const columnsAll = getColumnsAll(
      genesForVariantSchema,
      genesForVariant,
      classes
    );
    const dataAll = getDataAll(genesForVariant);

    return (
      <Fragment>
        <Tabs value={value} onChange={this.handleChange}>
          <Tab label="All" value={OVERVIEW} />
          {schemas.map(schema => {
            return (
              <Tab
                key={schema.sourceId}
                value={schema.sourceId}
                label={schema.sourceId}
              />
            );
          })}
        </Tabs>
        {value === OVERVIEW && <OtTable columns={columnsAll} data={dataAll} />}
        {schemas.map(schema => {
          return (
            value === schema.sourceId && (
              <OtTable
                key={schema.sourceId}
                columns={getTissueColumns(
                  genesForVariantSchema,
                  genesForVariant,
                  schema.sourceId,
                  classes
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

export default withStyles(styles)(AssociatedGenes);
