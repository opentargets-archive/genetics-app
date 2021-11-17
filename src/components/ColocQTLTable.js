import React from 'react';

import { OtTableRF } from '../ot-ui-components';

const ColocQTLTable = ({ loading, error, data, tableColumns }) => {
  return (
    <OtTableRF
      loading={loading}
      error={error}
      columns={tableColumns}
      data={data}
      sortBy="log2h4h3"
      order="desc"
    />
  );
};

export default ColocQTLTable;
