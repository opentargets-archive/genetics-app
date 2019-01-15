import React from 'react';
import { Link } from 'react-router-dom';
import * as d3 from 'd3';
import { OtTable, significantFigures, Autocomplete } from 'ot-ui';

import { pvalThreshold } from '../constants';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';
import StudyDetailCell from './StudyDetailCell';

export const tableColumns = ({
  geneFilterValue,
  geneFilterOptions,
  geneFilterHandler,
  tagVariantBlockFilterValue,
  tagVariantBlockFilterOptions,
  tagVariantBlockFilterHandler,
  indexVariantFilterValue,
  indexVariantFilterOptions,
  indexVariantFilterHandler,
  studyFilterValue,
  studyFilterOptions,
  studyFilterHandler,
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
    label: 'Study Detail',
    renderFilter: () => (
      <Autocomplete
        options={studyFilterOptions}
        value={studyFilterValue}
        getOptionLabel={d =>
          `${d.traitReported} (${d.pubAuthor} ${new Date(
            d.pubDate
          ).getFullYear()})`
        }
        getOptionValue={d => d.studyId}
        handleSelectOption={studyFilterHandler}
        placeholder="None"
        multiple
      />
    ),
    renderCell: rowData => <StudyDetailCell {...rowData.study} />,
  },
  {
    id: 'indexVariantId',
    label: 'Lead Variant',
    renderFilter: () => (
      <Autocomplete
        options={indexVariantFilterOptions}
        value={indexVariantFilterValue}
        getOptionLabel={d => `${d.id} (${d.rsId})`}
        getOptionValue={d => d.id}
        handleSelectOption={indexVariantFilterHandler}
        placeholder="None"
        multiple
      />
    ),
    renderCell: rowData => (
      <Link to={`/variant/${rowData.indexVariantId}`}>
        {rowData.indexVariantId}
      </Link>
    ),
  },
  {
    id: 'tagVariantBlockId',
    label: 'Tag Variant',
    renderFilter: () => (
      <Autocomplete
        options={tagVariantBlockFilterOptions}
        value={tagVariantBlockFilterValue}
        getOptionLabel={d => d.id}
        getOptionValue={d => d.id}
        handleSelectOption={tagVariantBlockFilterHandler}
        placeholder="None"
        multiple
      />
    ),
    renderCell: rowData => rowData.tagVariantsBlockId,
  },
  {
    id: 'geneId',
    label: 'Gene',
    tooltip: 'Gene functionally implicated by the tag variant',
    renderFilter: () => (
      <Autocomplete
        options={geneFilterOptions}
        value={geneFilterValue}
        getOptionLabel={d => d.symbol}
        getOptionValue={d => d.id}
        handleSelectOption={geneFilterHandler}
        placeholder="None"
        multiple
      />
    ),
    renderCell: rowData => (
      <Link to={`/gene/${rowData.geneId}`}>{rowData.gene.symbol}</Link>
    ),
  },
  {
    id: 'expansionType',
    label: 'Expansion',
    renderCell: rowData =>
      rowData.expansionType === 'fm' ? 'Fine-mapping' : 'LD Expansion',
  },
];

function LocusTable({
  loading,
  error,
  data,
  filenameStem,
  geneFilterValue,
  geneFilterOptions,
  geneFilterHandler,
  tagVariantBlockFilterValue,
  tagVariantBlockFilterOptions,
  tagVariantBlockFilterHandler,
  indexVariantFilterValue,
  indexVariantFilterOptions,
  indexVariantFilterHandler,
  studyFilterValue,
  studyFilterOptions,
  studyFilterHandler,
}) {
  return (
    <OtTable
      loading={loading}
      error={error}
      columns={tableColumns({
        geneFilterValue,
        geneFilterOptions,
        geneFilterHandler,
        tagVariantBlockFilterValue,
        tagVariantBlockFilterOptions,
        tagVariantBlockFilterHandler,
        indexVariantFilterValue,
        indexVariantFilterOptions,
        indexVariantFilterHandler,
        studyFilterValue,
        studyFilterOptions,
        studyFilterHandler,
      })}
      filters
      data={data}
      sortBy="expansionType"
      order="asc"
      downloadFileStem={filenameStem}
      reportTableDownloadEvent={format => {
        reportAnalyticsEvent({
          category: 'table',
          action: 'download',
          label: `locus:${format}`,
        });
      }}
      reportTableSortEvent={(sortBy, order) => {
        reportAnalyticsEvent({
          category: 'table',
          action: 'sort-column',
          label: `locus:${sortBy}(${order})`,
        });
      }}
    />
  );
}

export default LocusTable;
