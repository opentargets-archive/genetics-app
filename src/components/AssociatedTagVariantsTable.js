import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, commaSeparate, significantFigures } from 'ot-ui';

import { pvalThreshold } from '../constants';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';

const tableColumns = variantId => [
  {
    id: 'leadVariant',
    label: 'Lead Variant',
    renderCell: () => variantId,
  },
  {
    id: 'tagVariantId',
    label: 'Tag Variant',
    renderCell: rowData =>
      variantId !== rowData.tagVariantId ? (
        <Link to={`/variant/${rowData.tagVariantId}`}>
          {rowData.tagVariantId}
        </Link>
      ) : (
        `${rowData.tagVariantId} (self)`
      ),
  },
  { id: 'tagVariantRsId', label: 'Tag Variant rsID' },
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
    label: 'Posterior Probability',
    tooltip:
      'Posterior probability from fine-mapping that this tag variant is causal',
    renderCell: rowData =>
      rowData.posteriorProbability !== null
        ? rowData.posteriorProbability.toPrecision(3)
        : '',
  },
];

const AssociatedTagVariantsTable = ({
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
    reportTableDownloadEvent={format => {
      reportAnalyticsEvent({
        category: 'table',
        action: 'download',
        label: `variant:associated-tag-variants:${format}`,
      });
    }}
    reportTableSortEvent={(sortBy, order) => {
      reportAnalyticsEvent({
        category: 'table',
        action: 'sort-column',
        label: `variant:associated-tag-variants:${sortBy}(${order})`,
      });
    }}
  />
);

export default AssociatedTagVariantsTable;
