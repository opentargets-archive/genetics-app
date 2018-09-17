import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, CloseButton } from 'ot-ui';
import { ManhattanFlat } from 'ot-charts';

export const tableColumns = onDeleteStudy => [
  {
    id: 'deleteRow',
    label: 'Remove',
    renderCell: rowData => (
      <CloseButton onClick={onDeleteStudy(rowData.studyId)} />
    ),
  },
  {
    id: 'studyId',
    label: 'Study ID',
    renderCell: rowData => (
      <Link to={`/study/${rowData.studyId}`}>{rowData.studyId}</Link>
    ),
  },
  {
    id: 'traitReported',
    label: 'Details',
    renderCell: rowData => {
      let pubInfo = '';
      if (rowData.pubAuthor && rowData.pubDate) {
        pubInfo = ` (${rowData.pubAuthor} ${new Date(
          rowData.pubDate
        ).getFullYear()})`;
      }
      return (
        <React.Fragment>
          <span style={{ fontWeight: 'bold' }}>{rowData.traitReported}</span>
          <span style={{ fontSize: '0.75rem' }}>{pubInfo}</span>
          <br />
          <span style={{ fontSize: '0.65rem' }}>{rowData.pubJournal}</span>
        </React.Fragment>
      );
    },
  },
  {
    id: 'associationsCount',
    label: 'Independently-associated loci',
    tooltip:
      'Independent loci associated with this study (p < 5e-8 are shown in red)',
    renderCell: rowData => <ManhattanFlat data={rowData.associations} />,
  },
];

function ManhattansTable({ studies, onDeleteStudy }) {
  return (
    <OtTable
      columns={tableColumns(onDeleteStudy)}
      data={studies}
      sortBy="associationsCount"
      order="desc"
      downloadFileStem="multi-study"
    />
  );
}

export default ManhattansTable;
