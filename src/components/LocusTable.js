import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, commaSeparate } from 'ot-ui';

export const tableColumns = [
  {
    id: 'studyId',
    label: 'Study ID',
    renderCell: rowData => (
      <Link to={`/study/${rowData.studyId}`}>{rowData.studyId}</Link>
    ),
  },
  {
    id: 'traitReported',
    label: 'Trait',
    renderCell: rowData => rowData.study.traitReported,
  },
  {
    id: 'indexVariantId',
    label: 'Lead Variant',
    renderCell: rowData => (
      <Link to={`/variant/${rowData.indexVariantId}`}>
        {`${rowData.indexVariantId} (${rowData.indexVariant.rsId})`}
      </Link>
    ),
  },
  {
    id: 'tagVariantId',
    label: 'Tag Variant',
    renderCell: rowData => (
      <Link to={`/variant/${rowData.tagVariantId}`}>
        {`${rowData.tagVariantId} (${rowData.tagVariant.rsId})`}
      </Link>
    ),
  },
  {
    id: 'geneId',
    label: 'Gene',
    renderCell: rowData => (
      <Link to={`/gene/${rowData.geneId}`}>{rowData.gene.symbol}</Link>
    ),
  },
  {
    id: 'pval',
    label: 'P-value',
    renderCell: rowData => rowData.pval.toPrecision(3),
  },
  {
    id: 'method',
    label: 'Expansion',
    renderCell: rowData =>
      rowData.posteriorProbability ? 'Finemapping' : 'LD Expansion',
  },
  {
    id: 'r2',
    label: 'LD (R-squared)',
    tooltip: 'Linkage disequilibrium between lead and tag variants',
    renderCell: rowData =>
      rowData.r2 ? rowData.r2.toPrecision(3) : 'No information',
  },
  {
    id: 'overallScore',
    label: 'Overall G2V',
    renderCell: rowData =>
      rowData.overallScore
        ? rowData.overallScore.toPrecision(3)
        : 'No information',
  },
];

function LocusTable({ data, filenameStem }) {
  return (
    <OtTable
      columns={tableColumns}
      data={data}
      sortBy="pval"
      order="asc"
      downloadFileStem={filenameStem}
    />
  );
}

export default LocusTable;
