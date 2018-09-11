import React, { Component, Fragment } from 'react';

import { OtTable, Tabs, Tab } from 'ot-ui';

const getColumnsAll = schemas => {
  const columns = [
    { id: 'gene', label: 'Gene' },
    {
      id: 'overallScore',
      label: 'Overall G2V',
      renderCell: rowData => {
        return rowData.overallScore.toPrecision(3);
      },
    },
  ];
  schemas.forEach(schema => {
    columns.push({
      id: schema.sourceId,
      label: schema.sourceId,
      renderCell: rowData => {
        return rowData[schema.sourceId]
          ? rowData[schema.sourceId].toPrecision(3)
          : 'No information';
      },
    });
  });
  return columns;
};

const getDataAll = genesForVariant => {
  const data = [];
  genesForVariant.forEach(item => {
    const row = { gene: item.gene.symbol, overallScore: item.overallScore };
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

const getTissueColumns = (schemas, sourceId) => {
  const columns = [{ id: 'gene', label: 'Gene' }];
  schemas
    .find(schema => schema.sourceId === sourceId)
    .tissues.forEach(tissue => {
      columns.push({
        id: tissue.id,
        label: tissue.name,
        renderCell: rowData => {
          return rowData[tissue.id]
            ? rowData[tissue.id].toPrecision(3)
            : 'No information';
        },
      });
    });
  return columns;
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
    const row = { gene: geneForVariant.gene.symbol };
    const element = geneForVariant[searchField].find(
      item => item.sourceId === sourceId
    );

    if (element) {
      element.tissues.forEach(elementTissue => {
        row[elementTissue.tissue.id] =
          elementTissue.score || elementTissue.beta;
      });
    }

    data.push(row);
  });
  return data;
};

class AssociatedGenes extends Component {
  state = {
    value: 0,
  };

  handleChange = (_, value) => {
    this.setState({ value });
  };

  render() {
    const { value } = this.state;
    const { genesForVariantSchema, genesForVariant } = this.props.data;

    // Hardcoding the order and assuming qtls, intervals, and
    // functionalPredictions are the only fields in the schema
    const schemas = [
      ...genesForVariantSchema.qtls,
      ...genesForVariantSchema.intervals,
      ...genesForVariantSchema.functionalPredictions,
    ];

    const filteredSchemas = schemas.filter(schema => schema.tissues.length > 1);

    const columnsAll = getColumnsAll(schemas);
    const dataAll = getDataAll(genesForVariant);

    return (
      <Fragment>
        <Tabs value={value} onChange={this.handleChange}>
          <Tab label="All" />
          {filteredSchemas.map(schema => {
            return (
              <Tab
                key={schema.sourceId}
                value={schema.sourceId}
                label={schema.sourceId}
              />
            );
          })}
        </Tabs>
        {value === 0 && <OtTable columns={columnsAll} data={dataAll} />}
        {filteredSchemas.map(schema => {
          const tissueColumns = getTissueColumns(schemas, schema.sourceId);
          const tissueData = getTissueData(
            genesForVariantSchema,
            genesForVariant,
            schema.sourceId
          );
          return (
            value === schema.sourceId && (
              <OtTable
                key={schema.sourceId}
                columns={tissueColumns}
                data={tissueData}
              />
            )
          );
        })}
      </Fragment>
    );
  }
}

export default AssociatedGenes;
