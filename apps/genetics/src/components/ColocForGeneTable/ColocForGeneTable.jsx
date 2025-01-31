import React, { Fragment } from 'react';

import { OtTableRF, DataDownloader } from '../../ot-ui-components';

import {
  getDownloadColumns,
  getDownloadRows,
  tableColumns,
} from './ColumnRederers';

const ColocTable = ({
  loading,
  error,
  filenameStem,
  data,
  colocTraitFilterValue,
  colocTraitFilterOptions,
  colocTraitFilterHandler,
}) => (
  <Fragment>
    <DataDownloader
      tableHeaders={getDownloadColumns()}
      rows={getDownloadRows(data)}
      fileStem={filenameStem}
    />
    <OtTableRF
      loading={loading}
      error={error}
      columns={tableColumns({
        colocTraitFilterValue,
        colocTraitFilterOptions,
        colocTraitFilterHandler,
      })}
      filters
      data={data}
      sortBy="h4"
      order="desc"
      downloadFileStem={filenameStem}
    />
  </Fragment>
);

export default ColocTable;
