import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, CloseButton, commaSeparate } from 'ot-ui';
import { ManhattanFlat } from 'ot-charts';

export const tableColumns = ({ onDeleteStudy, onClickIntersectionLocus }) => [
  {
    id: 'deleteRow',
    label: 'Remove',
    renderCell: onDeleteStudy
      ? rowData => <CloseButton onClick={onDeleteStudy(rowData.studyId)} />
      : null,
  },
  {
    id: 'studyId',
    label: 'Study ID',
    renderCell: rowData =>
      rowData.pileup ? (
        <b>Intersection</b>
      ) : (
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
    id: 'nInitial',
    label: 'N Initial',
    renderCell: rowData =>
      rowData.nInitial ? commaSeparate(rowData.nInitial) : null,
  },
  {
    id: 'nReplication',
    label: 'N Replication',
    renderCell: rowData =>
      rowData.nReplication ? commaSeparate(rowData.nReplication) : null,
  },
  {
    id: 'nCases',
    label: 'N Cases',
    renderCell: rowData =>
      rowData.nCases ? commaSeparate(rowData.nCases) : null,
  },
  {
    id: 'associationsCount',
    label: 'Independently-associated loci',
    tooltip:
      'Independently-associated loci across studies (overlapping loci are shown in red)',
    renderCell: rowData =>
      rowData.pileup && onClickIntersectionLocus ? (
        <ManhattanFlat
          data={rowData.associations}
          onClick={onClickIntersectionLocus}
        />
      ) : (
        <ManhattanFlat data={rowData.associations} />
      ),
  },
];

function ManhattansTable({
  select,
  studies,
  rootStudy,
  onDeleteStudy,
  onClickIntersectionLocus,
  pileupPseudoStudy,
}) {
  const columns = tableColumns({ onDeleteStudy });
  const columnsFixed = tableColumns({ onClickIntersectionLocus });
  return (
    <OtTable
      left={select}
      columns={columns}
      data={studies}
      columnsFixed={columnsFixed}
      dataFixed={[pileupPseudoStudy, rootStudy]}
      sortBy="associationsCount"
      order="desc"
      downloadFileStem="multi-study"
    />
  );
}

export default ManhattansTable;
