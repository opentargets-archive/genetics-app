import { Fragment } from 'react';
import {
  DataDownloader,
  OtTableRF,
  significantFigures,
  Autocomplete,
  Link,
} from '../ot-ui-components';

import { pvalThreshold } from '../constants';
import StudyLocusLink from './StudyLocusLink';
import { generateComparator, commaSeparate } from '../utils';

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
    { id: 'yProbaModel', label: 'L2G Pipeline Score' },
    { id: 'hasSumstats', label: 'Has sumstats' },
  ];
};

const getDownloadRows = (rows) => {
  return rows.map((row) => ({
    studyId: row.study.studyId,
    studyTrait: row.study.traitReported,
    studyPmid: row.study.pmid,
    studyAuthor: row.study.pubAuthor,
    studyDate: row.study.pubDate,
    nInitial: row.study.nInitial,
    nReplication: row.study.nReplication,
    nCases: row.study.nCases,
    indexVariantId: row.variant.id,
    indexVariantRsId: row.variant.rsId,
    pval: row.pval,
    beta: row.beta.betaCI,
    betaCILower: row.beta.betaCILower,
    betaCIUpper: row.beta.betaCIUpper,
    oddsRatio: row.odds.oddsCI,
    oddsRatioCILower: row.odds.oddsCILower,
    oddsRatioCIUpper: row.odds.oddsCIUpper,
    yProbaModel: row.yProbaModel,
    hasSumstats: row.study.hasSumstats,
  }));
};

const tableColumns = ({
  geneId,
  geneSymbol,
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
    comparator: generateComparator((d) => d.study.studyId),
    renderCell: (rowData) => (
      <Link to={`/study/${rowData.study.studyId}`}>
        {rowData.study.studyId}
      </Link>
    ),
  },

  {
    id: 'study.traitReported',
    label: 'Trait',
    comparator: generateComparator((d) => d.study.traitReported),
    renderCell: (rowData) => {
      // truncate long trait names for display
      return rowData.study.traitReported &&
        rowData.study.traitReported.length > 100 ? (
        <span title={rowData.study.traitReported}>
          {rowData.study.traitReported.substring(0, 100)}
          &hellip;
        </span>
      ) : (
        rowData.study.traitReported
      );
    },
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
    id: 'study.pubAuthor',
    label: 'Publication',
    comparator: generateComparator((d) => d.study.pubAuthor),
    renderFilter: () => (
      <Autocomplete
        options={authorFilterOptions}
        value={authorFilterValue}
        handleSelectOption={authorFilterHandler}
        placeholder="None"
        multiple
      />
    ),
    renderCell: (rowData) => {
      // Some studies don't have a pmid so need to avoid dead links
      const url = rowData.study.pmid
        ? `http://europepmc.org/article/MED/${rowData.study.pmid.split(':')[1]}`
        : null;
      const pub = `${rowData.study.pubAuthor} (${new Date(
        rowData.study.pubDate
      ).getFullYear()})`;
      return url ? (
        <Link to={url} external>
          {pub}
        </Link>
      ) : (
        pub
      );
    },
  },

  {
    id: 'study.nInitial',
    label: 'N Initial',
    comparator: generateComparator((d) => d.study.nInitial),
    renderCell: (rowData) =>
      rowData.study.nInitial ? commaSeparate(rowData.study.nInitial) : '',
  },

  {
    id: 'variant.id',
    label: 'Lead Variant',
    comparator: generateComparator((d) => d.variant.id),
    renderCell: (rowData) => (
      <Link to={`/variant/${rowData.variant.id}`}>{rowData.variant.id}</Link>
    ),
  },

  {
    id: 'pval',
    label: 'P-value',
    renderCell: (rowData) =>
      rowData.pval < pvalThreshold
        ? `<${pvalThreshold}`
        : significantFigures(rowData.pval),
  },

  {
    id: 'beta.betaCI',
    label: 'Beta',
    tooltip: (
      <Fragment>
        Beta with respect to the ALT allele.
        <Link
          external
          tooltip
          to="https://genetics-docs.opentargets.org/faqs#why-are-betas-and-odds-ratios-displayed-inconsistently-in-the-portal"
        >
          See FAQ.
        </Link>
      </Fragment>
    ),
    renderCell: (rowData) =>
      rowData.beta.betaCI ? significantFigures(rowData.beta.betaCI) : null,
  },

  {
    id: 'odds.oddsCI',
    label: 'Odds Ratio',
    tooltip: 'Odds ratio with respect to the ALT allele',
    renderCell: (rowData) =>
      rowData.odds.oddsCI ? significantFigures(rowData.odds.oddsCI) : null,
  },

  {
    id: 'ci',
    label: '95% Confidence Interval',
    tooltip:
      '95% confidence interval for the effect estimate. CIs are calculated approximately using the reported p-value.',
    renderCell: (rowData) =>
      rowData.beta.betaCI
        ? `(${significantFigures(
            rowData.beta.betaCILower
          )}, ${significantFigures(rowData.beta.betaCIUpper)})`
        : rowData.odds.oddsCI
        ? `(${significantFigures(
            rowData.odds.oddsCILower
          )}, ${significantFigures(rowData.odds.oddsCIUpper)})`
        : null,
  },

  {
    id: 'yProbaModel',
    label: 'L2G pipeline score',
    tooltip: `Evidence linking ${geneSymbol} to this study via our locus-to-gene pipeline. Score range [0, 1].`,
    renderCell: (rowData) =>
      rowData.yProbaModel ? significantFigures(rowData.yProbaModel) : null,
  },

  {
    id: 'hasSumstats',
    label: 'Has sumstats',
    comparator: generateComparator(d => d.study.hasSumstats),
    renderCell: rowData =>
      rowData.study.hasSumstats ? <>yes</> : <>no</>
  },

  {
    id: 'locusView',
    label: 'View',
    renderCell: (rowData) => {
      return (
        <StudyLocusLink
          indexVariantId={rowData.variant.id}
          studyId={rowData.study.studyId}
          label="Gene prioritisation"
        />
      );
    },
  },
];

const AssociatedStudiesTable = ({
  loading,
  error,
  filenameStem,
  data,
  geneId,
  geneSymbol,
  chromosome,
  position,
  traitFilterValue,
  traitFilterOptions,
  traitFilterHandler,
  authorFilterValue,
  authorFilterOptions,
  authorFilterHandler,
}) => (
  <Fragment>
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
        geneSymbol,
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
      sortBy="yProbaModel"
      order="desc"
      headerGroups={[
        { colspan: 4, label: 'Study Information' },
        {
          colspan: 7,
          label: 'Association Information',
        },
      ]}
    />
  </Fragment>
);

export default AssociatedStudiesTable;
