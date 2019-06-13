import React from 'react';

import { Link, OtTable, significantFigures } from 'ot-ui';

const tableColumns = [
  {
    id: 'id',
    label: 'Variant',
    renderCell: d => <Link to={`/variant/${d.id}`}>{d.id}</Link>,
  },
  // {
  //   id: 'rsId',
  //   label: 'Variant rsID',
  // },
  {
    id: 'position',
    label: 'Position',
  },
  {
    id: 'posteriorProbabilityMax',
    label: 'Maximum Posterior Probability',
    tooltip:
      'The maximum posterior probability for this variant across selected colocalisation tracks',
    renderCell: d => significantFigures(d.posteriorProbabilityMax),
  },
  {
    id: 'posteriorProbabilityProd',
    label: 'Product of Posterior Probabilities (across selected studies)',
    tooltip:
      'The product of posterior probabilities for this variant across selected colocalisation tracks',
    renderCell: d => significantFigures(d.posteriorProbabilityProd),
  },
];

const CredibleSetsIntersectionTable = ({ filenameStem, data }) => (
  <OtTable
    loading={false}
    error={false}
    columns={tableColumns}
    data={data}
    sortBy="posteriorProbabilityProd"
    order="desc"
    downloadFileStem={filenameStem}
  />
);

export default CredibleSetsIntersectionTable;
