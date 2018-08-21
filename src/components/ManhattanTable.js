import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, commaSeparate } from 'ot-ui';

const tableColumns = [
  {
    label: 'indexVariantId',
    renderCell: rowData => (
      <Link to={`/variant/${rowData.indexVariantId}`}>
        {rowData.indexVariantId}
      </Link>
    ),
  },
  { label: 'indexVariantRsId', key: 'indexVariantRsId' },
  {
    label: 'pval',
    renderCell: rowData => rowData.pval.toPrecision(3),
  },
  {
    label: 'credibleSetSize',
    renderCell: rowData => commaSeparate(rowData.credibleSetSize),
  },
  {
    label: 'ldSetSize',
    renderCell: rowData => commaSeparate(rowData.ldSetSize),
  },
];

function ManhattanTable({ data }) {
  return <OtTable columns={tableColumns} data={data} />;
}

export default ManhattanTable;
