import React from 'react';
import { Link } from 'react-router-dom';
import { OtTable, commaSeparate } from 'ot-ui';

const tableColumns = [
  {
    id: 'indexVariantId',
    label: 'indexVariantId',
    renderCell: rowData => (
      <Link to={`/variant/${rowData.indexVariantId}`}>
        {rowData.indexVariantId}
      </Link>
    ),
  },
  { id: 'indexVariantRsId', label: 'indexVariantRsId' },
  {
    id: 'studyId',
    label: 'studyId',
    renderCell: rowData => (
      <Link to={`/study/${rowData.studyId}`}>{rowData.studyId}</Link>
    ),
  },
  { id: 'traitReported', label: 'traitReported' },
  {
    id: 'pval',
    label: 'pval',
    renderCell: rowData => rowData.pval.toPrecision(3),
  },
  { id: 'pmid', label: 'pmid' },
  { id: 'pubDate', label: 'pubDate' },
  { id: 'pubJournal', label: 'pubJournal' },
  // { id: 'pubTitle', label: 'pubTitle' },
  { id: 'pubAuthor', label: 'pubAuthor' },
  {
    id: 'nTotal',
    label: 'nTotal',
    renderCell: rowData => commaSeparate(rowData.nTotal),
  },
  {
    id: 'nCases',
    label: 'nCases',
    renderCell: rowData => commaSeparate(rowData.nCases),
  },
  {
    id: 'overallR2',
    label: 'overallR2',
    renderCell: rowData => rowData.overallR2.toPrecision(3),
  },
  {
    id: 'log10Abf',
    label: 'log10Abf',
    renderCell: rowData => rowData.log10Abf.toPrecision(3),
  },
  {
    id: 'posteriorProbability',
    label: 'posteriorProbability',
    renderCell: rowData => rowData.posteriorProbability.toPrecision(3),
  },
];

const AssociatedIndexVariantsTable = ({ loading, error, data }) => (
  <OtTable
    columns={tableColumns}
    data={data}
    sortBy="indexVariantId"
    order="desc"
  />
);

export default AssociatedIndexVariantsTable;
