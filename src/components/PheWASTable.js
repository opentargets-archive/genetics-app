import React from 'react';
import { OtTable } from 'ot-ui';
import { Link } from 'react-router-dom';

const tableColumns = [
  {
    label: 'nCases',
    key: 'nCases',
  },
  {
    label: 'nTotal',
    key: 'nTotal',
  },
  {
    label: 'pval',
    key: 'pval',
  },
  {
    label: 'studyId',
    renderCell: rowData => (
      <Link to={`/study/${rowData.studyId}`}>{rowData.studyId}</Link>
    ),
  },
  {
    label: 'traitCode',
    key: 'traitCode',
  },
  {
    label: 'traitReported',
    key: 'traitReported',
  },
  {
    label: 'Locus View',
    renderCell: () => {
      return <Link to="/locus">Gecko Plot</Link>;
    },
  },
];

function PheWASTable({ associations }) {
  return <OtTable columns={tableColumns} data={associations} />;
}

export default PheWASTable;
