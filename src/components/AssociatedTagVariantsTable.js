import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, commaSeparate } from 'ot-ui';

const tableColumns = variantId => [
  {
    id: 'tagVariantId',
    label: 'Variant',
    renderCell: rowData => (
      <Link to={`/variant/${rowData.tagVariantId}`}>
        {variantId === rowData.tagVariantId
          ? `${rowData.tagVariantId} (self)`
          : rowData.tagVariantId}
      </Link>
    ),
  },
  { id: 'tagVariantRsId', label: 'rsID' },
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
    label: 'P-value',
    renderCell: rowData => rowData.pval.toPrecision(3),
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
      `${rowData.pubAuthor} et al (${new Date(rowData.pubDate).getFullYear()})`,
  },
  {
    id: 'nTotal',
    label: 'Study N',
    renderCell: rowData => commaSeparate(rowData.nTotal),
  },
  {
    id: 'overallR2',
    label: 'LD (R-squared)',
    tooltip: 'Linkage disequilibrium with the queried variant',
    renderCell: rowData =>
      rowData.overallR2 ? rowData.overallR2.toPrecision(3) : 'No information',
  },
  {
    id: 'posteriorProbability',
    label: 'posteriorProbability',
    tooltip:
      'Posterior probability from finemapping that this tag variant is causal',
    renderCell: rowData =>
      rowData.posteriorProbability
        ? rowData.posteriorProbability.toPrecision(3)
        : 'No information',
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
    columns={tableColumns(variantId)}
    data={data}
    sortBy="pval"
    order="asc"
    downloadFileStem={filenameStem}
  />
);

export default AssociatedTagVariantsTable;
