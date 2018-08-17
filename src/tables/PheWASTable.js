import React from 'react';
import { OtTable } from 'ot-ui';

const tableColumns = [
  {
    label: 'nCases',
    key: 'nCases',
  },
  {
    label: 'nTotal',
    key: 'nTotal',
  },
  {
    label: 'pval',
    key: 'pval',
  },
  {
    label: 'studyId',
    key: 'studyId',
  },
  {
    label: 'traitCode',
    key: 'traitCode',
  },
  {
    label: 'traitReported',
    key: 'traitReported',
  },
];

const PheWASTable = ({ loading, error, data }) => (
  <OtTable columns={tableColumns} data={data.pheWAS.associations} />
);

export default PheWASTable;
