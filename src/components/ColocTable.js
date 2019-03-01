import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, Button } from 'ot-ui';

const tableColumns = [
  {
    id: 'molecularTrait',
    label: 'Molecular Trait',
  },
  {
    id: 'gene',
    label: 'Gene',
    renderCell: d => <Link to={`/gene/${d.gene.id}`}>{d.gene.symbol}</Link>,
  },
  {
    id: 'tissue',
    label: 'Tissue',
    renderCell: d => d.tissue.name,
  },
  {
    id: 'source',
    label: 'Source',
  },
  {
    id: 'h4',
    label: 'H4',
  },
  {
    id: 'show',
    label: 'Regional Plot',
    renderCell: d => <Button gradient>Add track</Button>,
  },
];

const ColocTable = ({ loading, error, filenameStem, data }) => (
  <OtTable
    loading={loading}
    error={error}
    columns={tableColumns}
    data={data}
    sortBy="nInitial"
    order="desc"
    downloadFileStem={filenameStem}
  />
);

export default ColocTable;
