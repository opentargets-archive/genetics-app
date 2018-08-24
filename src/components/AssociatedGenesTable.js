import React from 'react';
import { OtTable } from 'ot-ui';

const tableColumns = [
  {
    id: 'symbol',
    label: 'Gene',
  },
  { id: 'overallScore', label: 'Confidence' },
];

const AssociatedGenesTable = ({ loading, error, data }) => (
  <OtTable
    columns={tableColumns}
    data={data}
    sortBy="pval"
    order="asc"
    downloadFileStem="assigned-genes"
  />
);

export default AssociatedGenesTable;
