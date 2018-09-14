import React, { Component, Fragment } from 'react';
import * as d3 from 'd3';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

import { OtTable, Tabs, Tab } from 'ot-ui';

const OVERVIEW = 'overview';

const DataCircle = ({ radius, className }) => {
  return (
    <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg">
      <circle cx={radius} cy={radius} r={radius} className={className} />
    </svg>
  );
};

const areaScale = d3
  .scaleLinear()
  .domain([0, 1])
  .range([0, 36]);

const getColumnsAll = (genesForVariantSchema, genesForVariant, classes) => {
  const overallScoreScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(genesForVariant, geneForVariant => geneForVariant.overallScore),
    ])
    .range([0, 36]);
  const columns = [
    { id: 'geneSymbol', label: 'Gene' },
    {
      id: 'overallScore',
      label: 'Overall G2V',
      renderCell: rowData => {
        const circleArea = overallScoreScale(rowData.overallScore);
        const circleRadius = Math.sqrt(circleArea);
        return (
          <DataCircle
            radius={circleRadius}
            className={classes.overallScoreCircle}
          />
        );
      },
    },
  ];

  genesForVariantSchema.qtls.forEach(schema => {
    columns.push({
      id: schema.sourceId,
      label: schema.sourceId,
      renderCell: rowData => {
        if (rowData[schema.sourceId] !== undefined) {
          const circleArea = areaScale(rowData[schema.sourceId]);
          const circleRadius = Math.sqrt(circleArea);
          return (
            <DataCircle
              radius={circleRadius}
              className={classes.qtlIntervalCircle}
            />
          );
        }
      },
    });
  });

  genesForVariantSchema.intervals.forEach(schema => {
    columns.push({
      id: schema.sourceId,
      label: schema.sourceId,
      renderCell: rowData => {
        if (rowData[schema.sourceId] !== undefined) {
          const circleArea = areaScale(rowData[schema.sourceId]);
          const circleRadius = Math.sqrt(circleArea);
          return (
            <DataCircle
              radius={circleRadius}
              className={classes.qtlIntervalCircle}
            />
          );
        }
      },
    });
  });

  genesForVariantSchema.functionalPredictions.forEach(schema => {
    columns.push({
      id: schema.sourceId,
      label: schema.sourceId,
      renderCell: rowData => {
        const gene = genesForVariant.find(
          geneForVariant => geneForVariant.gene.symbol === rowData.geneSymbol
        );

        if (gene.functionalPredictions.length === 1) {
          const {
            maxEffectLabel,
            maxEffectScore,
          } = gene.functionalPredictions[0].tissues[0];
          const labelClass = classNames({
            [classes.maxEffectLow]:
              0 <= maxEffectScore && maxEffectScore <= 1 / 3,
            [classes.maxEffectMedium]:
              1 / 3 < maxEffectScore && maxEffectScore <= 2 / 3,
            [classes.maxEffectHigh]:
              2 / 3 < maxEffectScore && maxEffectScore <= 1,
          });
          return <span className={labelClass}>{maxEffectLabel}</span>;
        }
      },
    });
  });

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
              const qtlArea = areaScale(rowData[tissue.id]);
              const qtlRadius = Math.sqrt(qtlArea);
              const beta = findBeta(
                genesForVariant,
                rowData.geneSymbol,
                schema.sourceId,
                tissue.id
              );
              const qtlClass =
                beta > 0 ? classes.positiveBeta : classes.negativeBeta;
              console.log('beta', tissue.id, beta);
              return <DataCircle radius={qtlRadius} className={qtlClass} />;
            case 'intervals':
              const intervalArea = areaScale(rowData[tissue.id]);
              const intervalRadius = Math.sqrt(intervalArea);
              return (
                <DataCircle
                  radius={intervalRadius}
                  className={classes.qtlIntervalCircle}
                />
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
          elementTissue.maxEffectLabel || elementTissue.quantile;
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
    maxEffectHigh: {
      color: theme.palette.high,
    },
    maxEffectMedium: {
      color: theme.palette.medium,
    },
    maxEffectLow: {
      color: theme.palette.low,
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
