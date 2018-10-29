import React from 'react';
import { Link } from 'react-router-dom';
import * as d3 from 'd3';
import { OtTable, DataCircle, significantFigures, Autocomplete } from 'ot-ui';

import { pvalThreshold } from '../constants';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';
import StudyDetailCell from './StudyDetailCell';

export const tableColumns = ({
  overallScoreScale,
  geneFilterValue,
  geneFilterOptions,
  geneFilterHandler,
  tagVariantFilterValue,
  tagVariantFilterOptions,
  tagVariantFilterHandler,
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
    id: 'tagVariantId',
    label: 'Tag Variant',
    renderFilter: () => (
      <Autocomplete
        options={tagVariantFilterOptions}
        value={tagVariantFilterValue}
        getOptionLabel={d => `${d.id} (${d.rsId})`}
        getOptionValue={d => d.id}
        handleSelectOption={tagVariantFilterHandler}
        placeholder="None"
        multiple
      />
    ),
    renderCell: rowData => (
      <Link to={`/variant/${rowData.tagVariantId}`}>
        {rowData.tagVariantId}
      </Link>
    ),
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
    id: 'pval',
    label: 'Lead Variant P-value',
    renderCell: rowData =>
      rowData.pval < pvalThreshold
        ? `<${pvalThreshold}`
        : significantFigures(rowData.pval),
  },
  {
    id: 'method',
    label: 'Expansion',
    renderCell: rowData =>
      rowData.posteriorProbability ? 'Fine-mapping' : 'LD Expansion',
  },
  {
    id: 'r2',
    label: 'LD (r²)',
    tooltip: 'Linkage disequilibrium between lead and tag variants',
    renderCell: rowData =>
      rowData.r2 ? rowData.r2.toPrecision(3) : 'No information',
  },
  {
    id: 'posteriorProbability',
    label: 'Posterior Probability',
    tooltip:
      'Posterior probability from fine-mapping that this tag variant is causal',
    renderCell: rowData =>
      rowData.posteriorProbability !== null
        ? rowData.posteriorProbability.toPrecision(3)
        : '',
  },
  {
    id: 'overallScore',
    label: 'Overall V2G',
    renderCell: rowData => (
      <DataCircle
        radius={overallScoreScale(rowData.overallScore)}
        colorScheme="bold"
      />
    ),
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
  tagVariantFilterValue,
  tagVariantFilterOptions,
  tagVariantFilterHandler,
  indexVariantFilterValue,
  indexVariantFilterOptions,
  indexVariantFilterHandler,
  studyFilterValue,
  studyFilterOptions,
  studyFilterHandler,
}) {
  const overallScoreScale = d3
    .scaleSqrt()
    .domain([0, d3.max(data, d => d.overallScore)])
    .range([0, 6]);
  return (
    <OtTable
      loading={loading}
      error={error}
      columns={tableColumns({
        overallScoreScale,
        geneFilterValue,
        geneFilterOptions,
        geneFilterHandler,
        tagVariantFilterValue,
        tagVariantFilterOptions,
        tagVariantFilterHandler,
        indexVariantFilterValue,
        indexVariantFilterOptions,
        indexVariantFilterHandler,
        studyFilterValue,
        studyFilterOptions,
        studyFilterHandler,
      })}
      filters
      data={data}
      sortBy="pval"
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
