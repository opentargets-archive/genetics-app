import React from 'react';
import { OtTable } from 'ot-ui';

const tableColumns = [
  { label: 'indexVariantId', key: 'indexVariantId' },
  { label: 'indexVariantRsId', key: 'indexVariantRsId' },
  { label: 'studyId', key: 'studyId' },
  { label: 'traitReported', key: 'traitReported' },
  { label: 'pval', key: 'pval' },
  { label: 'pmid', key: 'pmid' },
  { label: 'pubDate', key: 'pubDate' },
  { label: 'pubJournal', key: 'pubJournal' },
  { label: 'pubTitle', key: 'pubTitle' },
  { label: 'pubAuthor', key: 'pubAuthor' },
  { label: 'nTotal', key: 'nTotal' },
  { label: 'nCases', key: 'nCases' },
  { label: 'overallR2', key: 'overallR2' },
  { label: 'log10Abf', key: 'log10Abf' },
  { label: 'posteriorProbability', key: 'posteriorProbability' },
];

const AssociatedIndexVariantsTable = ({ loading, error, data }) => (
  <OtTable
    columns={tableColumns}
    data={data.indexVariantsAndStudiesForTagVariant.rows}
  />
);

export default AssociatedIndexVariantsTable;
