import React from 'react';
import { Link } from 'react-router-dom';
import {
  OtTable,
  commaSeparate,
  significantFigures,
  Autocomplete,
} from 'ot-ui';

import { pvalThreshold } from '../constants';
import LocusLink from './LocusLink';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';
import PmidOrBiobankLink from './PmidOrBiobankLink';

const tableColumns = ({
  geneId,
  chromosome,
  position,
  traitFilterValue,
  traitFilterOptions,
  traitFilterHandler,
  authorFilterValue,
  authorFilterOptions,
  authorFilterHandler,
}) => [
  {
    id: 'study.studyId',
    label: 'Study ID',
    renderCell: rowData => (
      <Link to={`/study/${rowData.study.studyId}`}>
        {rowData.study.studyId}
      </Link>
    ),
  },
  {
    id: 'study.traitReported',
    label: 'Trait',
    renderCell: rowData => rowData.study.traitReported,
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
    id: 'study.pmid',
    label: 'PMID',
    renderCell: rowData => (
      <PmidOrBiobankLink
        studyId={rowData.study.studyId}
        pmid={rowData.study.pmid}
      />
    ),
  },
  {
    id: 'study.pubAuthor',
    label: 'Author (Year)',
    renderFilter: () => (
      <Autocomplete
        options={authorFilterOptions}
        value={authorFilterValue}
        handleSelectOption={authorFilterHandler}
        placeholder="None"
        multiple
      />
    ),
    renderCell: rowData =>
      `${rowData.study.pubAuthor} (${new Date(
        rowData.study.pubDate
      ).getFullYear()})`,
  },
  {
    id: 'study.nInitial',
    label: 'N Initial',
    renderCell: rowData =>
      rowData.study.nInitial ? commaSeparate(rowData.study.nInitial) : '',
  },
  {
    id: 'study.nReplication',
    label: 'N Replication',
    renderCell: rowData =>
      rowData.study.nReplication
        ? commaSeparate(rowData.study.nReplication)
        : '',
  },
  {
    id: 'study.nCases',
    label: 'N Cases',
    renderCell: rowData =>
      rowData.study.nCases ? commaSeparate(rowData.study.nCases) : '',
  },
  {
    id: 'indexVariant.id',
    label: 'Lead Variant',
    renderCell: rowData => (
      <Link to={`/variant/${rowData.indexVariant.id}`}>
        {rowData.indexVariant.rsId}
      </Link>
    ),
  },
  {
    id: 'pval',
    label: 'P-value',
    renderCell: rowData =>
      rowData.pval < pvalThreshold
        ? `<${pvalThreshold}`
        : significantFigures(rowData.pval),
  },
  {
    id: 'beta',
    label: 'Beta',
    tooltip: 'Beta with respect to the ALT allele',
    renderCell: rowData =>
      rowData.beta ? significantFigures(rowData.beta) : null,
  },
  {
    id: 'oddsRatio',
    label: 'Odds Ratio',
    tooltip: 'Odds ratio with respect to the ALT allele',
    renderCell: rowData =>
      rowData.oddsRatio ? significantFigures(rowData.oddsRatio) : null,
  },
  {
    id: 'ci',
    label: '95% Confidence Interval',
    tooltip:
      '95% confidence interval for the effect estimate. CIs are calculated approximately using the reported p-value.',
    renderCell: rowData =>
      rowData.beta
        ? `(${significantFigures(rowData.betaCILower)}, ${significantFigures(
            rowData.betaCIUpper
          )})`
        : rowData.oddsRatio
          ? `(${significantFigures(
              rowData.oddsRatioCILower
            )}, ${significantFigures(rowData.oddsRatioCIUpper)})`
          : null,
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
  authorFilterValue,
  authorFilterOptions,
  authorFilterHandler,
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
      authorFilterValue,
      authorFilterOptions,
      authorFilterHandler,
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
