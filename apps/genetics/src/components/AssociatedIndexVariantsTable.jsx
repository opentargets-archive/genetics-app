import React from 'react';
import {
  OtTable,
  commaSeparate,
  significantFigures,
  Link,
} from '../ot-ui-components';

import { pvalThreshold } from '../constants';
import PmidOrBiobankLink from './PmidOrBiobankLink';
import StudyLocusLink from './StudyLocusLink';
import { generateComparator } from '../utils';

const tableColumns = variantId => [
  {
    id: 'indexVariantId',
    label: 'Lead Variant',
    renderCell: rowData =>
      variantId !== rowData.indexVariantId ? (
        <Link to={`/variant/${rowData.indexVariantId}`}>
          {rowData.indexVariantId}
        </Link>
      ) : (
        `${rowData.indexVariantId} (self)`
      ),
  },
  { id: 'indexVariantRsId', label: 'Lead Variant rsID' },
  {
    id: 'tagVariant',
    label: 'Tag Variant',
    renderCell: () => variantId,
  },
  {
    id: 'studyId',
    label: 'Study ID',
    renderCell: rowData => (
      <Link to={`/study/${rowData.studyId}`}>{rowData.studyId}</Link>
    ),
  },
  { id: 'traitReported', label: 'Trait' },
  {
    id: 'pval',
    label: 'Lead Variant P-value',
    renderCell: rowData =>
      rowData.pval < pvalThreshold
        ? `<${pvalThreshold}`
        : significantFigures(rowData.pval),
  },
  {
    id: 'beta',
    label: 'Beta',
    tooltip: (
      <React.Fragment>
        Beta with respect to the ALT allele.
        <Link
          external
          tooltip
          to="https://genetics-docs.opentargets.org/faqs#why-are-betas-and-odds-ratios-displayed-inconsistently-in-the-portal"
        >
          See FAQ.
        </Link>
      </React.Fragment>
    ),
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
    id: 'pmid',
    label: 'PMID',
    renderCell: rowData => (
      <PmidOrBiobankLink studyId={rowData.studyId} pmid={rowData.pmid} />
    ),
  },
  {
    id: 'pubAuthor',
    label: 'Author (Year)',
    renderCell: rowData =>
      `${rowData.pubAuthor} (${new Date(rowData.pubDate).getFullYear()})`,
  },
  {
    id: 'nTotal',
    label: 'Study N',
    renderCell: rowData => commaSeparate(rowData.nTotal),
  },
  {
    id: 'overallR2',
    label: 'LD (r²)',
    tooltip: 'Linkage disequilibrium with the queried variant',
    renderCell: rowData =>
      rowData.overallR2 ? rowData.overallR2.toPrecision(3) : 'No information',
  },
  {
    id: 'posteriorProbability',
    label: 'Is in 95% Credible Set',
    renderCell: rowData =>
      rowData.posteriorProbability !== null ? 'True' : '',
  },
  {
    id: 'hasSumstats',
    label: 'Has sumstats',
    comparator: generateComparator(d => d.hasSumstats),
    renderCell: rowData => rowData.hasSumstats ? <>yes</> : <>no</>,
    export: rowData => rowData.hasSumstats ? true : false,
  },
  {
    id: 'studyLocus',
    label: 'View',
    renderCell: rowData => {
      return (
        <StudyLocusLink
          indexVariantId={rowData.indexVariantId}
          studyId={rowData.studyId}
        />
      );
    },
  },
];

const AssociatedIndexVariantsTable = ({
  loading,
  error,
  filenameStem,
  data,
  variantId,
}) => (
  <OtTable
    loading={loading}
    error={error}
    columns={tableColumns(variantId)}
    data={data}
    sortBy="pval"
    order="asc"
    downloadFileStem={filenameStem}
  />
);

export default AssociatedIndexVariantsTable;
