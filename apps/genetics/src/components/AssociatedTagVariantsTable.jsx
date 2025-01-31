import React from 'react';
import {
  Link,
  OtTable,
  commaSeparate,
  significantFigures,
} from '../ot-ui-components';

import { pvalThreshold } from '../constants';
import PmidOrBiobankLink from './PmidOrBiobankLink';
import { generateComparator } from '../utils';

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
    label: 'Posterior Probability',
    tooltip:
      'Posterior probability from fine-mapping that this tag variant is causal',
    renderCell: rowData =>
      rowData.posteriorProbability !== null
        ? rowData.posteriorProbability.toPrecision(3)
        : '',
  },
  {
    id: 'hasSumstats',
    label: 'Has sumstats',
    comparator: generateComparator(d => d.hasSumstats),
    renderCell: rowData => rowData.hasSumstats ? <>yes</> : <>no</>,
    export: rowData => rowData.hasSumstats ? true : false,
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
  />
);

export default AssociatedTagVariantsTable;
