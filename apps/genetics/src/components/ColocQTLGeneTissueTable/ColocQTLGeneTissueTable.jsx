import React from 'react';

import { OtTableRF } from '../../ot-ui-components';
import { useColocTable, getTableColumns } from '.';

const ColocTable = ({ loading, error, fileStem, data }) => {
  const { uniqueTissues, dataByPhenotypeId } = useColocTable(data);

  const tableColumns = getTableColumns(data, uniqueTissues);

  return (
    <OtTableRF
      loading={loading}
      error={error}
      columns={tableColumns}
      data={dataByPhenotypeId}
      sortBy="gene.symbol"
      order="asc"
      verticalHeaders
    />
  );
};

export default ColocTable;
