import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, commaSeparate } from 'ot-ui';

import LocusLink from './LocusLink';

const tableColumns = (geneId, chromosome, position) => [
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
    id: 'pmid',
    label: 'PMID',
    renderCell: rowData => (
      <a
        href={`http://europepmc.org/abstract/med/${rowData.pmid}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {rowData.pmid}
      </a>
    ),
  },
  {
    id: 'pubAuthor',
    label: 'Author (Year)',
    renderCell: rowData =>
      `${rowData.pubAuthor} (${new Date(rowData.pubDate).getFullYear()})`,
  },
  {
    id: 'nInitial',
    label: 'N Initial',
    renderCell: rowData =>
      rowData.nInitial ? commaSeparate(rowData.nInitial) : '',
  },
  {
    id: 'nReplication',
    label: 'N Replication',
    renderCell: rowData =>
      rowData.nReplication ? commaSeparate(rowData.nReplication) : '',
  },
  {
    id: 'nCases',
    label: 'N Cases',
    renderCell: rowData =>
      rowData.nCases ? commaSeparate(rowData.nCases) : '',
  },
  {
    id: 'locusView',
    label: 'View',
    renderCell: rowData => (
      <LocusLink
        chromosome={chromosome}
        position={position}
        selectedGenes={[geneId]}
        selectedStudies={[rowData.studyId]}
      >
        Locus
      </LocusLink>
    ),
  },
];

const AssociatedStudiesTable = ({
  loading,
  error,
  filenameStem,
  data,
  geneId,
  chromosome,
  position,
}) => (
  <OtTable
    columns={tableColumns(geneId, chromosome, position)}
    data={data}
    sortBy="nInitial"
    order="desc"
    downloadFileStem={filenameStem}
  />
);

export default AssociatedStudiesTable;
