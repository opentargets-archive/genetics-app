import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, commaSeparate } from 'ot-ui';
import { getCytoband } from 'ot-charts';

export const tableColumns = [
  {
    id: 'studyId',
    label: 'Study ID',
    renderCell: rowData => (
      <Link to={`/study/${rowData.studyId}`}>{rowData.studyId}</Link>
    ),
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
    renderCell: rowData => (
      <Link to={`/gene/${rowData.geneId}`}>{rowData.gene.symbol}</Link>
    ),
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
