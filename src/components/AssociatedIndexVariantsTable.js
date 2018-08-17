import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, commaSeparate } from 'ot-ui';

const tableColumns = [
  {
    label: 'indexVariantId',
    renderCell: rowData => (
      <Link to={`/variant/${rowData.indexVariantId}`}>
        {rowData.indexVariantId}
      </Link>
    ),
  },
  { label: 'indexVariantRsId', key: 'indexVariantRsId' },
  {
    label: 'studyId',
    renderCell: rowData => (
      <Link to={`/study/${rowData.studyId}`}>{rowData.studyId}</Link>
    ),
  },
  { label: 'traitReported', key: 'traitReported' },
  { label: 'pval', renderCell: rowData => rowData.pval.toPrecision(3) },
  { label: 'pmid', key: 'pmid' },
  { label: 'pubDate', key: 'pubDate' },
  { label: 'pubJournal', key: 'pubJournal' },
  // { label: 'pubTitle', key: 'pubTitle' },
  { label: 'pubAuthor', key: 'pubAuthor' },
  { label: 'nTotal', renderCell: rowData => commaSeparate(rowData.nTotal) },
  { label: 'nCases', renderCell: rowData => commaSeparate(rowData.nCases) },
  {
    label: 'overallR2',
    renderCell: rowData => rowData.overallR2.toPrecision(3),
  },
  { label: 'log10Abf', renderCell: rowData => rowData.log10Abf.toPrecision(3) },
  {
    label: 'posteriorProbability',
    renderCell: rowData => rowData.posteriorProbability.toPrecision(3),
  },
];

const AssociatedIndexVariantsTable = ({ loading, error, data }) => (
  <OtTable
    columns={tableColumns}
    data={data.indexVariantsAndStudiesForTagVariant.rows}
  />
);

export default AssociatedIndexVariantsTable;
