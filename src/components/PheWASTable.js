import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, commaSeparate } from 'ot-ui';

const tableColumns = [
  {
    label: 'studyId',
    renderCell: rowData => (
      <Link to={`/study/${rowData.studyId}`}>{rowData.studyId}</Link>
    ),
  },
  {
    label: 'traitReported',
    key: 'traitReported',
  },
  {
    label: 'pval',
    renderCell: rowData => rowData.pval.toPrecision(3),
  },
  {
    label: 'nCases',
    renderCell: rowData => commaSeparate(rowData.nCases),
  },
  {
    label: 'nTotal',
    renderCell: rowData => commaSeparate(rowData.nTotal),
  },
  // TODO: check status of traitCode with Miguel - should we expose?
  // {
  //   label: 'traitCode',
  //   key: 'traitCode',
  // },
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
