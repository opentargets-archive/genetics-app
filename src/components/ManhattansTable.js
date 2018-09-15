import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable } from 'ot-ui';
import { ManhattanFlat } from 'ot-charts';

export const tableColumns = [
  {
    id: 'studyId',
    label: 'Study ID',
    renderCell: rowData => (
      <Link to={`/study/${rowData.studyId}`}>{rowData.studyId}</Link>
    ),
  },
  {
    id: 'traitReported',
    label: 'Trait',
  },
  {
    id: 'associations',
    label: 'Independently-associated loci',
    renderCell: rowData => <ManhattanFlat data={rowData.associations} />,
  },
];

function ManhattansTable({ studies }) {
  return (
    <OtTable
      columns={tableColumns}
      data={studies}
      downloadFileStem="multi-study"
    />
  );
}

export default ManhattansTable;
