import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, commaSeparate } from 'ot-ui';

import { pvalThreshold } from '../constants';

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
        : rowData.pval.toPrecision(3),
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
    label: 'Is in 95% Credible Set',
    renderCell: rowData =>
      rowData.posteriorProbability !== null ? 'True' : '',
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
