import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, commaSeparate } from 'ot-ui';

export const tableColumns = [
  {
    id: 'studyId',
    label: 'studyId',
    renderCell: rowData => (
      <Link to={`/study/${rowData.studyId}`}>{rowData.studyId}</Link>
    ),
  },
  {
    id: 'traitReported',
    label: 'traitReported',
  },
  {
    id: 'pval',
    label: 'pval',
    renderCell: rowData => rowData.pval.toPrecision(3),
  },
  {
    id: 'nCases',
    label: 'nCases',
    renderCell: rowData => commaSeparate(rowData.nCases),
  },
  {
    id: 'nTotal',
    label: 'nTotal',
    renderCell: rowData => commaSeparate(rowData.nTotal),
  },
  // TODO: check status of traitCode with Miguel - should we expose?
  // {
  //   id: 'traitCode',
  //   label: 'traitCode'
  // },
  {
    id: 'locusView',
    label: 'Locus View',
    renderCell: () => {
      return <Link to="/locus">Gecko Plot</Link>;
    },
  },
];

function PheWASTable({ associations }) {
  return (
    <OtTable
      columns={tableColumns}
      data={associations}
      sortBy="studyId"
      order="desc"
    />
  );
}

export default PheWASTable;
