import React, { Fragment } from 'react';

import { DataDownloader, OtTableRF } from '../../../ot-ui-components';

import { OVERVIEW } from './utils';

export const TabOverview = ({
  value,
  columnsAll,
  dataAllDownload,
  variantId,
  dataAll,
}) => {
  return value === OVERVIEW ? (
    <Fragment>
      <DataDownloader
        tableHeaders={columnsAll}
        rows={dataAllDownload}
        fileStem={`${variantId}-assigned-genes-summary`}
      />
      <OtTableRF
        message="Evidence summary linking this variant to different genes."
        sortBy="overallScore"
        order="desc"
        columns={columnsAll}
        data={dataAll}
      />
    </Fragment>
  ) : null;
};
