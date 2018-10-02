import React from 'react';
import { Link } from 'react-router-dom';
import * as d3 from 'd3';
import { OtTable, DataCircle, significantFigures } from 'ot-ui';

import { pvalThreshold } from '../constants';

export const tableColumns = overallScoreScale => [
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
        {rowData.indexVariantId}
      </Link>
    ),
  },
  {
    id: 'tagVariantId',
    label: 'Tag Variant',
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
      rowData.posteriorProbability ? 'Finemapping' : 'LD Expansion',
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
      'Posterior probability from finemapping that this tag variant is causal',
    renderCell: rowData =>
      rowData.posteriorProbability !== null
        ? rowData.posteriorProbability.toPrecision(3)
        : '',
  },
  {
    id: 'overallScore',
    label: 'Overall G2V',
    renderCell: rowData => (
      <DataCircle
        radius={overallScoreScale(rowData.overallScore)}
        colorScheme="bold"
      />
    ),
  },
];

function LocusTable({ loading, error, data, filenameStem }) {
  const overallScoreScale = d3
    .scaleSqrt()
    .domain([0, d3.max(data, d => d.overallScore)])
    .range([0, 6]);
  return (
    <OtTable
      loading={loading}
      error={error}
      columns={tableColumns(overallScoreScale)}
      data={data}
      sortBy="pval"
      order="asc"
      downloadFileStem={filenameStem}
    />
  );
}

export default LocusTable;
