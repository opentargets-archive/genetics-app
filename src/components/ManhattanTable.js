import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, commaSeparate } from 'ot-ui';

export const tableColumns = [
  {
    id: 'indexVariantId',
    label: 'indexVariantId',
    renderCell: rowData => (
      <Link to={`/variant/${rowData.indexVariantId}`}>
        {rowData.indexVariantId}
      </Link>
    ),
  },
  {
    id: 'indexVariantRsId',
    label: 'indexVariantRsId',
  },
  {
    id: 'pval',
    label: 'pval',
    renderCell: rowData => rowData.pval.toPrecision(3),
  },
  {
    id: 'credibleSetSize',
    label: 'credibleSetSize',
    renderCell: rowData => commaSeparate(rowData.credibleSetSize),
  },
  {
    id: 'ldSetSize',
    label: 'ldSetSize',
    renderCell: rowData => commaSeparate(rowData.ldSetSize),
  },
];

function ManhattanTable({ data }) {
  return (
    <OtTable
      columns={tableColumns}
      data={data}
      sortBy="indexVariantId"
      order="desc"
    />
  );
}

export default ManhattanTable;
