import React from 'react';
import { Link, OtTable, Button, significantFigures } from 'ot-ui';

const tableColumns = handleToggleRegional => [
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
  {
    id: 'show',
    label: 'Regional Plot',
    renderCell: d =>
      d.isShowingRegional ? (
        <Button gradient onClick={() => handleToggleRegional(d)}>
          Hide
        </Button>
      ) : (
        <Button gradient onClick={() => handleToggleRegional(d)}>
          Show
        </Button>
      ),
  },
];

const ColocTable = ({
  loading,
  error,
  filenameStem,
  data,
  handleToggleRegional,
}) => (
  <OtTable
    loading={loading}
    error={error}
    columns={tableColumns(handleToggleRegional)}
    data={data}
    sortBy="logH4H3"
    order="desc"
    downloadFileStem={filenameStem}
  />
);

export default ColocTable;
