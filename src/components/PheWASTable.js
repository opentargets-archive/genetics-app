import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, commaSeparate } from 'ot-ui';

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
    id: 'pval',
    label: 'P-value',
    renderCell: rowData => rowData.pval.toPrecision(3),
  },
  {
    id: 'nCases',
    label: 'N Cases',
    renderCell: rowData => commaSeparate(rowData.nCases),
  },
  {
    id: 'nTotal',
    label: 'N Overall',
    renderCell: rowData => commaSeparate(rowData.nTotal),
  },
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
      sortBy="pval"
      order="asc"
    />
  );
}

export default PheWASTable;
