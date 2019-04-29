import React from 'react';
import { Link, OtTable, significantFigures } from 'ot-ui';

const tableColumns = [
  {
    id: 'study',
    label: 'Study',
    renderCell: d => <Link to={`/study/${d.studyId}`}>{d.studyId}</Link>,
  },
  {
    id: 'traitReported',
    label: 'Trait reported',
  },
  {
    id: 'pubAuthor',
    label: 'Author',
  },
  {
    id: 'beta',
    label: 'Study beta',
    renderCell: d => significantFigures(d.beta),
  },
  {
    id: 'h3',
    label: 'H3',
    renderCell: d => significantFigures(d.h3),
  },
  {
    id: 'h4',
    label: 'H4',
    renderCell: d => significantFigures(d.h4),
  },
  {
    id: 'logH4H3',
    label: 'log(H4/H3)',
    renderCell: d => significantFigures(d.logH4H3),
  },
];

const ColocTable = ({ loading, error, filenameStem, data }) => (
  <OtTable
    loading={loading}
    error={error}
    columns={tableColumns}
    data={data}
    sortBy="logH4H3"
    order="desc"
    downloadFileStem={filenameStem}
  />
);

export default ColocTable;
