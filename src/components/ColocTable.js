import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable } from 'ot-ui';

const tableColumns = [
  {
    id: 'molecularTrait',
    label: 'Molecular Trait',
  },
  {
    id: 'gene',
    label: 'Gene',
  },
  {
    id: 'tissue',
    label: 'Tissue',
  },
  {
    id: 'source',
    label: 'Source',
  },
  {
    id: 'h4',
    label: 'H4',
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
