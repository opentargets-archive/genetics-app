import React from 'react';
import { Link, OtTable, Button, significantFigures } from 'ot-ui';

const tableColumns = handleToggleRegional => [
  {
    id: 'type',
    label: 'Molecular Trait',
    renderCell: d => 'eQTL',
  },
  {
    id: 'phenotype',
    label: 'Gene',
    renderCell: d => (
      <Link to={`/gene/${d.phenotypeEnsemblId}`}>{d.phenotypeSymbol}</Link>
    ),
  },
  {
    id: 'bioFeature',
    label: 'Tissue',
  },
  {
    id: 'study',
    label: 'Source',
  },
  {
    id: 'beta',
    label: 'QTL beta',
    renderCell: d => significantFigures(d.beta),
  },
  {
    id: 'h3',
    label: 'H3',
    renderCell: d => significantFigures(d.h3),
  },
  {
    id: 'h4',
    label: 'H4',
    renderCell: d => significantFigures(d.h4),
  },
  {
    id: 'logH4H3',
    label: 'log(H4/H3)',
    renderCell: d => significantFigures(d.logH4H3),
  },
  {
    id: 'show',
    label: 'Regional Plot',
    renderCell: d =>
      d.isShowingRegional ? (
        <Button gradient onClick={() => handleToggleRegional(d)}>
          Hide
        </Button>
      ) : (
        <Button gradient onClick={() => handleToggleRegional(d)}>
          Show
        </Button>
      ),
  },
];

const ColocTable = ({
  loading,
  error,
  filenameStem,
  data,
  handleToggleRegional,
}) => (
  <OtTable
    loading={loading}
    error={error}
    columns={tableColumns(handleToggleRegional)}
    data={data}
    sortBy="logH4H3"
    order="desc"
    downloadFileStem={filenameStem}
  />
);

export default ColocTable;
