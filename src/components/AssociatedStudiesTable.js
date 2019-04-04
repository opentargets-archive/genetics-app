import React from 'react';
import { Link } from 'react-router-dom';
import {
  DataDownloader,
  OtTableRF,
  commaSeparate,
  significantFigures,
  Autocomplete,
} from 'ot-ui';

import { pvalThreshold } from '../constants';
import LocusLink from './LocusLink';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';
import PmidOrBiobankLink from './PmidOrBiobankLink';
import generateComparator from '../utils/generateComparator';

const getDownloadColumns = () => {
  return [
    { id: 'studyId', label: 'Study ID' },
    { id: 'studyTrait', label: 'Reported Trait' },
    { id: 'studyPmid', label: 'PMID' },
    { id: 'studyAuthor', label: 'Author' },
    { id: 'studyDate', label: 'Date' },
    { id: 'nInitial', label: 'Study N Initial' },
    { id: 'nReplication', label: 'Study N Replication' },
    { id: 'nCases', label: 'Study N Cases' },
    { id: 'indexVariantId', label: 'Index Variant ID' },
    { id: 'indexVariantRsId', label: 'Index Variant RSID' },
    { id: 'pval', label: 'P-Value' },
    { id: 'beta', label: 'Beta' },
    { id: 'betaCILower', label: 'Beta CI Lower' },
    { id: 'betaCIUpper', label: 'Beta CI Upper' },
    { id: 'oddsRatio', label: 'Odds Ratio' },
    { id: 'oddsRatioCILower', label: 'Odds Ratio CI Lower' },
    { id: 'oddsRatioCIUpper', label: 'Odds Ratio CI Upper' },
  ];
};

const getDownloadRows = rows => {
  return rows.map(row => ({
    studyId: row.study.studyId,
    studyTrait: row.study.traitReported,
    studyPmid: row.study.pmid,
    studyAuthor: row.study.pubAuthor,
    studyDate: row.study.pubDate,
    nInitial: row.study.nInitial,
    nReplication: row.study.nReplication,
    nCases: row.study.nCases,
    indexVariantId: row.indexVariant.id,
    indexVariantRsId: row.indexVariant.rsId,
    pval: row.pval,
    beta: row.beta,
    betaCILower: row.betaCILower,
    betaCIUpper: row.betaCIUpper,
    oddsRatio: row.oddsRatio,
    oddsRatioCILower: row.oddsRatioCILower,
    oddsRatioCIUpper: row.oddsRatioCIUpper,
  }));
};

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
    comparator: generateComparator(d => d.study.studyId),
    renderCell: rowData => (
      <Link to={`/study/${rowData.study.studyId}`}>
        {rowData.study.studyId}
      </Link>
    ),
  },
  {
    id: 'study.traitReported',
    label: 'Trait',
    comparator: generateComparator(d => d.study.traitReported),
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
    comparator: generateComparator(d => d.study.pmid),
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
    comparator: generateComparator(d => d.study.pubAuthor),
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
    comparator: generateComparator(d => d.study.nInitial),
    renderCell: rowData =>
      rowData.study.nInitial ? commaSeparate(rowData.study.nInitial) : '',
  },
  {
    id: 'study.nCases',
    label: 'N Cases',
    comparator: generateComparator(d => d.study.nCases),
    renderCell: rowData =>
      rowData.study.nCases ? commaSeparate(rowData.study.nCases) : '',
  },
  {
    id: 'indexVariant.id',
    label: 'Lead Variant',
    comparator: generateComparator(d => d.indexVariant.id),
    renderCell: rowData => (
      <Link to={`/variant/${rowData.indexVariant.id}`}>
        {rowData.indexVariant.id}
      </Link>
    ),
  },
  {
    id: 'indexVariant.rsId',
    label: 'Lead Variant rsID',
    comparator: generateComparator(d => d.indexVariant.rsId),
    renderCell: rowData => rowData.indexVariant.rsId,
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
        selectedStudies={[rowData.study.studyId]}
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
  <React.Fragment>
    <DataDownloader
      tableHeaders={getDownloadColumns()}
      rows={getDownloadRows(data)}
      fileStem={filenameStem}
    />
    <OtTableRF
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
      sortBy="pval"
      order="asc"
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
  </React.Fragment>
);

export default AssociatedStudiesTable;
