import React from 'react';

import { Link, OtTable } from 'ot-ui';

const tableColumns = [
  {
    id: 'id',
    label: 'Variant',
    renderCell: d => <Link to={`/variant/${d.id}`}>{d.id}</Link>,
  },
  {
    id: 'rsId',
    label: 'Variant rsID',
  },
  {
    id: 'position',
    label: 'Position',
  },
];

const CredibleSetsIntersectionTable = ({ filenameStem, data }) => (
  <OtTable
    loading={false}
    error={false}
    columns={tableColumns}
    data={data}
    sortBy="position"
    order="asc"
    downloadFileStem={filenameStem}
  />
);

export default CredibleSetsIntersectionTable;
