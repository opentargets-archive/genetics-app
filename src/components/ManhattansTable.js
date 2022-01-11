import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import { Link, OtTable, commaSeparate } from '../ot-ui-components';

import ManhattanFlat from '../components/ManhattanFlat';

const CloseButton = props => (
  <IconButton {...props}>
    <CloseIcon />
  </IconButton>
);

export const tableColumns = ({ onDeleteStudy, onClickIntersectionLocus }) => [
  {
    id: 'deleteRow',
    label: 'Remove',
    renderCell: rowData =>
      onDeleteStudy ? (
        <CloseButton onClick={onDeleteStudy(rowData.studyId)} />
      ) : !rowData.pileup ? (
        <b>ROOT</b>
      ) : null,
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
      'Independently-associated loci across studies that occur in the ROOT study',
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
  loading,
  error,
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
      loading={loading}
      error={error}
      left={select}
      columns={columns}
      data={studies}
      columnsFixed={columnsFixed}
      dataFixed={[pileupPseudoStudy, rootStudy]}
      sortBy="associationsCount"
      order="desc"
      downloadFileStem="multi-study"
      message={
        <React.Fragment>
          Each selected study in this table is compared to the <b>ROOT</b>{' '}
          study.
          <br />
          <small>
            Loci overlapping with the ROOT study are shown in <i>black</i>. Loci
            overlapping across all selected studies are shown in <i>red</i>.
          </small>
        </React.Fragment>
      }
    />
  );
}

export default ManhattansTable;
