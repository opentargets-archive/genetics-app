import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, commaSeparate, Autocomplete } from 'ot-ui';

import LocusLink from './LocusLink';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';

const tableColumns = ({
  geneId,
  chromosome,
  position,
  traitFilterValue,
  traitFilterOptions,
  traitFilterHandler,
}) => [
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
    renderFilter: () => (
      <Autocomplete
        options={traitFilterOptions}
        value={traitFilterValue}
        handleSelectOption={traitFilterHandler}
        placeholder="None"
        multiple
      />
    ),
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
  traitFilterValue,
  traitFilterOptions,
  traitFilterHandler,
}) => (
  <OtTable
    loading={loading}
    error={error}
    filters
    columns={tableColumns({
      geneId,
      chromosome,
      position,
      traitFilterValue,
      traitFilterOptions,
      traitFilterHandler,
    })}
    data={data}
    sortBy="nInitial"
    order="desc"
    downloadFileStem={filenameStem}
    reportTableDownloadEvent={format => {
      reportAnalyticsEvent({
        category: 'table',
        action: 'download',
        label: `gene:associated-studies:${format}`,
      });
    }}
    reportTableSortEvent={(sortBy, order) => {
      reportAnalyticsEvent({
        category: 'table',
        action: 'sort-column',
        label: `gene:associated-studies:${sortBy}(${order})`,
      });
    }}
  />
);

export default AssociatedStudiesTable;
